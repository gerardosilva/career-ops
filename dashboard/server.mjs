#!/usr/bin/env node

import http from 'http';
import { readFileSync, writeFileSync, existsSync, createReadStream, statSync } from 'fs';
import { extname, join, normalize, resolve } from 'path';
import { URL } from 'url';
import { execSync, spawnSync } from 'child_process';

const repoRoot = process.argv.includes('--path')
  ? resolve(process.argv[process.argv.indexOf('--path') + 1] || '.')
  : resolve(process.cwd());
const portArg = process.argv.find((arg) => arg.startsWith('--port='));
const port = portArg ? Number(portArg.split('=')[1]) : 4173;

const STATUS_OPTIONS = ['Qualified', 'Reached Out', 'Submitted', 'In Process', 'Negotiating', 'Won', 'Lost', 'Parked'];
const STATUS_PRIORITY = {
  'pending': -1,
  'in_process': 0,
  'negotiating': 1,
  'submitted': 2,
  'reached_out': 3,
  'qualified': 4,
  'won': 5,
  'parked': 6,
  'lost': 7,
};

function applicationsPath() {
  const rootPath = join(repoRoot, 'applications.md');
  const dataPath = join(repoRoot, 'data', 'applications.md');
  return existsSync(rootPath) ? rootPath : dataPath;
}

function parseMarkdownLink(text) {
  const match = text.match(/\[([^\]]+)\]\(([^)]+)\)/);
  return match ? { label: match[1], path: match[2] } : null;
}

function normalizeStatus(raw) {
  const status = raw.replace(/\*\*/g, '').trim().toLowerCase();
  if (status.includes('reached out') || status.includes('responded') || status.includes('respondido') || status.includes('contactado')) return 'reached_out';
  if (status.includes('submitted') || status.includes('applied') || status.includes('aplicado') || status === 'sent' || status === 'enviada' || status === 'aplicada') return 'submitted';
  if (status.includes('in process') || status.includes('interview') || status.includes('entrevista') || status.includes('discovery')) return 'in_process';
  if (status.includes('negotiating') || status.includes('offer') || status.includes('oferta') || status.includes('negociando')) return 'negotiating';
  if (status.includes('won') || status.includes('ganado') || status.includes('signed')) return 'won';
  if (status.includes('lost') || status.includes('rejected') || status.includes('rechazado') || status.includes('perdido')) return 'lost';
  if (status.includes('parked') || status.includes('descartado') || status.includes('no aplicar') || status.includes('skip') || status.includes('monitor') || status.includes('hold')) return 'parked';
  return 'qualified';
}

function readApplications() {
  const filePath = applicationsPath();
  if (!existsSync(filePath)) return [];
  let content;
  try { content = readFileSync(filePath, 'utf8'); } catch { return []; }
  const lines = content.split('\n');
  const apps = [];

  for (const line of lines) {
    if (!line.startsWith('|') || line.includes('|---') || line.includes('| # ')) continue;
    const fields = line.split('|').map((part) => part.trim());
    if (fields.length < 10) continue;
    const number = Number(fields[1]);
    if (!Number.isFinite(number)) continue;

    const pdfLink = parseMarkdownLink(fields[7]);
    const reportLink = parseMarkdownLink(fields[8]);
    const scoreValue = fields[5].match(/(\d+\.?\d*)\/5/);
    const reportMeta = reportLink ? loadReportMeta(reportLink.path) : {};

    apps.push({
      number,
      date: fields[2],
      company: fields[3],
      role: fields[4],
      scoreRaw: fields[5],
      score: scoreValue ? Number(scoreValue[1]) : 0,
      statusLabel: fields[6],
      status: normalizeStatus(fields[6]),
      pdf: pdfLink,
      report: reportLink,
      notes: fields[9] || '',
      ...reportMeta,
    });
  }

  return apps;
}

function loadReportMeta(reportPath) {
  try {
    const fullPath = join(repoRoot, reportPath);
    const content = readFileSync(fullPath, 'utf8');
    const url = content.match(/^\*\*URL:\*\*\s*(https?:\/\/\S+)/m)?.[1] || '';
    const currentStatus = content.match(/^\*\*Current Status:\*\*\s*(.+)$/m)?.[1] || '';
    const archetype = content.match(/^\*\*Archetype:\*\*\s*(.+)$/m)?.[1] || '';
    const tldr = content.match(/\|\s*\*\*TL;DR\*\*\s*\|\s*(.+?)\s*\|/i)?.[1] || '';
    const remote = content.match(/\|\s*\*\*Remote\*\*\s*\|\s*(.+?)\s*\|/i)?.[1] || '';
    const compensation =
      content.match(/\|\s*\*\*Compensation\*\*\s*\|\s*(.+?)\s*\|/i)?.[1] ||
      content.match(/\|\s*\*\*Comp\*\*\s*\|\s*(.+?)\s*\|/i)?.[1] ||
      '';
    return { jobUrl: url, currentStatus, archetype, tldr, remote, compensation };
  } catch {
    return {};
  }
}

function computeMetrics(apps) {
  const metrics = {
    total: apps.length,
    actionable: 0,
    withPdf: 0,
    avgScore: 0,
    topScore: 0,
    byStatus: {},
  };

  let totalScore = 0;
  let scored = 0;

  for (const app of apps) {
    metrics.byStatus[app.status] = (metrics.byStatus[app.status] || 0) + 1;
    if (!['parked', 'lost', 'won'].includes(app.status)) metrics.actionable += 1;
    if (app.pdf?.path) metrics.withPdf += 1;
    if (app.score > 0) {
      totalScore += app.score;
      scored += 1;
      metrics.topScore = Math.max(metrics.topScore, app.score);
    }
  }

  metrics.avgScore = scored ? totalScore / scored : 0;
  return metrics;
}

function replaceStatus(reportPath, newStatus) {
  const filePath = applicationsPath();
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let replaced = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.startsWith('|') || !line.includes(reportPath)) continue;
    const fields = line.split('|');
    if (fields.length < 9) continue;
    fields[6] = ` ${newStatus} `;
    lines[i] = fields.join('|');
    replaced = true;
    break;
  }

  if (!replaced) throw new Error(`Could not find tracker row for ${reportPath}`);
  writeFileSync(filePath, lines.join('\n'));
}

function safeJoin(relativePath) {
  const fullPath = normalize(join(repoRoot, relativePath));
  if (!fullPath.startsWith(repoRoot)) throw new Error('Path outside repo');
  return fullPath;
}

function pipelinePath() {
  const rootPath = join(repoRoot, 'pipeline.md');
  const dataPath = join(repoRoot, 'data', 'pipeline.md');
  return existsSync(rootPath) ? rootPath : dataPath;
}

function readPendingPipeline() {
  try {
    const filePath = pipelinePath();
    const content = readFileSync(filePath, 'utf8');
    const items = [];
    let index = 1000;
    for (const line of content.split('\n')) {
      if (!line.startsWith('- [ ]')) continue;
      const rest = line.replace(/^- \[ \]\s*/, '');
      const parts = rest.split(' | ');
      if (parts.length < 3) continue;
      const jobUrl = parts[0].trim();
      const company = parts[1].trim();
      const role = parts[2].trim();
      const notes = parts.slice(3).join(' | ').trim();
      items.push({
        number: index++,
        date: '',
        company,
        role,
        scoreRaw: '—',
        score: 0,
        statusLabel: 'Pending',
        status: 'pending',
        pdf: null,
        report: null,
        notes,
        jobUrl,
        archetype: '',
        tldr: notes,
        remote: '',
        compensation: '',
        currentStatus: '',
      });
    }
    return items;
  } catch {
    return [];
  }
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function serveFile(res, relativePath) {
  try {
    const fullPath = safeJoin(relativePath);
    const stat = statSync(fullPath);
    const typeByExt = {
      '.pdf': 'application/pdf',
      '.md': 'text/markdown; charset=utf-8',
      '.html': 'text/html; charset=utf-8',
      '.txt': 'text/plain; charset=utf-8',
    };
    res.writeHead(200, {
      'Content-Type': typeByExt[extname(fullPath)] || 'application/octet-stream',
      'Content-Length': stat.size,
    });
    createReadStream(fullPath).pipe(res);
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Not found: ${error.message}`);
  }
}

function renderIndex() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Career Ops Dashboard</title>
  <style>
    :root {
      --bg: #f4f6fb;
      --surface: #ffffff;
      --text: #172033;
      --muted: #64748b;
      --line: #dbe3ef;
      --primary: #005f73;
      --accent: #c2410c;
      --success: #166534;
      --warning: #a16207;
      --danger: #b91c1c;
      --shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
      --radius: 18px;
      --font-title: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
      --font-body: "DM Sans", ui-sans-serif, system-ui, sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background:
        radial-gradient(circle at top left, rgba(0,95,115,0.10), transparent 30%),
        radial-gradient(circle at top right, rgba(194,65,12,0.08), transparent 24%),
        var(--bg);
      color: var(--text);
      font-family: var(--font-body);
    }
    .wrap {
      max-width: 1320px;
      margin: 0 auto;
      padding: 28px 24px 48px;
    }
    .hero {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      align-items: end;
      margin-bottom: 22px;
    }
    h1 {
      margin: 0 0 6px;
      font-family: var(--font-title);
      font-size: clamp(32px, 4vw, 52px);
      line-height: 0.95;
      letter-spacing: -0.04em;
    }
    .sub {
      color: var(--muted);
      max-width: 760px;
      font-size: 15px;
    }
    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .button, button, select, input {
      font: inherit;
    }
    .button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      padding: 12px 16px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: var(--surface);
      color: var(--text);
      box-shadow: var(--shadow);
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      margin-bottom: 18px;
    }
    .stat {
      background: var(--surface);
      border: 1px solid rgba(219,227,239,0.8);
      border-radius: var(--radius);
      padding: 18px;
      box-shadow: var(--shadow);
    }
    .stat-label {
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 10px;
    }
    .stat-value {
      font-family: var(--font-title);
      font-size: 34px;
      line-height: 1;
      letter-spacing: -0.04em;
    }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      margin-bottom: 18px;
      padding: 14px;
      background: rgba(255,255,255,0.8);
      border: 1px solid rgba(219,227,239,0.8);
      border-radius: 16px;
      position: sticky;
      top: 0;
      backdrop-filter: blur(10px);
      z-index: 2;
    }
    .toolbar input, .toolbar select {
      border: 1px solid var(--line);
      background: var(--surface);
      border-radius: 999px;
      padding: 11px 14px;
      min-height: 44px;
    }
    .toolbar input {
      min-width: min(380px, 100%);
      flex: 1 1 260px;
    }
    .tabs {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .tab {
      border: 1px solid var(--line);
      background: #fff;
      color: var(--muted);
      border-radius: 999px;
      padding: 10px 14px;
      cursor: pointer;
    }
    .tab.active {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
    }
    .list {
      display: grid;
      gap: 14px;
    }
    .card {
      background: var(--surface);
      border: 1px solid rgba(219,227,239,0.85);
      border-radius: 22px;
      padding: 18px;
      box-shadow: var(--shadow);
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: start;
      margin-bottom: 10px;
    }
    .company {
      font-family: var(--font-title);
      font-size: 22px;
      line-height: 1;
      margin-bottom: 6px;
    }
    .role {
      font-size: 16px;
      margin-bottom: 8px;
    }
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      color: var(--muted);
      font-size: 13px;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-pending { background: rgba(99,102,241,0.10); color: #4338ca; }
    .status-qualified { background: rgba(0,95,115,0.10); color: var(--primary); }
    .status-reached_out { background: rgba(14,116,144,0.12); color: #0f766e; }
    .status-submitted { background: rgba(22,101,52,0.10); color: var(--success); }
    .status-in_process { background: rgba(194,65,12,0.12); color: var(--accent); }
    .status-negotiating { background: rgba(161,98,7,0.12); color: var(--warning); }
    .status-won { background: rgba(22,101,52,0.14); color: var(--success); }
    .status-parked { background: rgba(100,116,139,0.12); color: var(--muted); }
    .status-lost { background: rgba(185,28,28,0.10); color: var(--danger); }
    .score {
      font-family: var(--font-title);
      font-size: 28px;
      letter-spacing: -0.03em;
    }
    .summary {
      margin: 10px 0 14px;
      color: #314158;
      line-height: 1.5;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      margin-bottom: 14px;
    }
    .detail {
      padding: 12px;
      border-radius: 16px;
      background: #f8fafc;
      border: 1px solid #edf2f7;
    }
    .detail-label {
      color: var(--muted);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 6px;
    }
    .detail-value {
      font-size: 14px;
    }
    .card-bottom {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 14px;
      align-items: center;
    }
    .link-row {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .link-row a {
      text-decoration: none;
      color: var(--primary);
      font-weight: 600;
    }
    .status-form {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
    .status-form select {
      min-width: 160px;
    }
    .status-form button {
      border: none;
      background: var(--primary);
      color: white;
      border-radius: 999px;
      padding: 11px 14px;
      cursor: pointer;
    }
    .status-note {
      font-size: 12px;
      color: var(--muted);
    }
    .empty {
      text-align: center;
      padding: 28px;
      color: var(--muted);
      background: rgba(255,255,255,0.75);
      border-radius: 20px;
      border: 1px dashed var(--line);
    }
    @media (max-width: 980px) {
      .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .detail-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 720px) {
      .hero { flex-direction: column; align-items: start; }
      .stats { grid-template-columns: 1fr; }
      .card-top, .card-bottom { flex-direction: column; align-items: start; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <div>
        <h1>Career Ops Dashboard</h1>
        <div class="sub">Live view of your Drupal opportunity pipeline. Filter by status, search companies and roles, open reports and assets, and update application state without touching markdown by hand.</div>
      </div>
      <div class="actions">
        <a class="button" href="/api/apps" target="_blank" rel="noreferrer">JSON feed</a>
      </div>
    </section>

    <section class="stats" id="stats"></section>

    <section class="toolbar">
      <input id="search" type="search" placeholder="Search company, role, notes, or TL;DR">
      <select id="sort">
        <option value="score">Sort: score</option>
        <option value="date">Sort: date</option>
        <option value="company">Sort: company</option>
        <option value="status">Sort: status</option>
      </select>
      <div class="tabs" id="tabs"></div>
    </section>

    <section class="list" id="list"></section>
  </div>

  <script>
    const STATUS_OPTIONS_CLIENT = ${JSON.stringify(STATUS_OPTIONS)};
    const STATUS_LABELS = {
      all: 'All',
      pending: 'Pending',
      qualified: 'Qualified',
      submitted: 'Submitted',
      in_process: 'In Process',
      reached_out: 'Reached Out',
      negotiating: 'Negotiating',
      won: 'Won',
      parked: 'Parked',
      lost: 'Lost',
    };
    const filters = ['all', 'pending', 'qualified', 'submitted', 'in_process', 'parked'];
    let state = { apps: [], metrics: {}, filter: 'all', sort: 'score', search: '' };

    const statsEl = document.getElementById('stats');
    const listEl = document.getElementById('list');
    const tabsEl = document.getElementById('tabs');
    const searchEl = document.getElementById('search');
    const sortEl = document.getElementById('sort');

    searchEl.addEventListener('input', () => {
      state.search = searchEl.value.trim().toLowerCase();
      render();
    });
    sortEl.addEventListener('change', () => {
      state.sort = sortEl.value;
      render();
    });

    async function load() {
      const response = await fetch('/api/apps');
      const payload = await response.json();
      state.apps = payload.apps;
      state.metrics = payload.metrics;
      renderTabs();
      render();
    }

    function renderTabs() {
      tabsEl.innerHTML = '';
      for (const filter of filters) {
        const button = document.createElement('button');
        button.className = 'tab' + (state.filter === filter ? ' active' : '');
        const count = filter === 'all' ? state.metrics.total || 0 : state.metrics.byStatus?.[filter] || 0;
        button.textContent = STATUS_LABELS[filter] + ' (' + count + ')';
        button.addEventListener('click', () => {
          state.filter = filter;
          renderTabs();
          render();
        });
        tabsEl.appendChild(button);
      }
    }

    function renderStats() {
      const metrics = state.metrics || {};
      const cards = [
        ['Total opportunities', metrics.total || 0],
        ['Actionable', metrics.actionable || 0],
        ['Average score', metrics.avgScore ? metrics.avgScore.toFixed(2) : '0.00'],
        ['With PDF', metrics.withPdf || 0],
      ];
      statsEl.innerHTML = cards.map(([label, value]) => \`
        <article class="stat">
          <div class="stat-label">\${label}</div>
          <div class="stat-value">\${value}</div>
        </article>
      \`).join('');
    }

    function filteredApps() {
      let apps = [...state.apps];
      if (state.filter !== 'all') {
        apps = apps.filter((app) => app.status === state.filter);
      }
      if (state.search) {
        apps = apps.filter((app) => {
          const haystack = [app.company, app.role, app.notes, app.tldr, app.archetype, app.remote, app.compensation].join(' ').toLowerCase();
          return haystack.includes(state.search);
        });
      }
      const sorters = {
        score: (a, b) => (b.score - a.score) || a.company.localeCompare(b.company),
        date: (a, b) => b.date.localeCompare(a.date),
        company: (a, b) => a.company.localeCompare(b.company),
        status: (a, b) => ((a.status in ${JSON.stringify(STATUS_PRIORITY)} ? ${JSON.stringify(STATUS_PRIORITY)}[a.status] : 99) - (b.status in ${JSON.stringify(STATUS_PRIORITY)} ? ${JSON.stringify(STATUS_PRIORITY)}[b.status] : 99)) || (b.score - a.score),
      };
      return apps.sort(sorters[state.sort] || sorters.score);
    }

    function escapeHtml(text) {
      return String(text || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
    }

    async function updateStatus(reportPath, value) {
      const response = await fetch('/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportPath, status: value }),
      });
      if (!response.ok) {
        const body = await response.text();
        alert(body);
        return;
      }
      await load();
    }

    function renderList() {
      const apps = filteredApps();
      if (!apps.length) {
        listEl.innerHTML = '<div class="empty">No opportunities match the current filter.</div>';
        return;
      }
      listEl.innerHTML = apps.map((app) => {
        const statusClass = 'status-' + app.status;
        const reportHref = app.report?.path ? '/file?path=' + encodeURIComponent(app.report.path) : '';
        const pdfHref = app.pdf?.path ? '/file?path=' + encodeURIComponent(app.pdf.path) : '';
        const summary = app.tldr || app.notes || 'No summary extracted yet.';
        return \`
          <article class="card">
            <div class="card-top">
              <div>
                <div class="company">\${escapeHtml(app.company)}</div>
                <div class="role">\${escapeHtml(app.role)}</div>
                <div class="meta">
                  <span>#\${app.number}</span>
                  <span>\${escapeHtml(app.date)}</span>
                  <span class="pill \${statusClass}">\${escapeHtml(app.statusLabel)}</span>
                </div>
              </div>
              <div class="score">\${escapeHtml(app.scoreRaw)}</div>
            </div>

            <div class="summary">\${escapeHtml(summary)}</div>

            <div class="detail-grid">
              <div class="detail">
                <div class="detail-label">Archetype</div>
                <div class="detail-value">\${escapeHtml(app.archetype || '—')}</div>
              </div>
              <div class="detail">
                <div class="detail-label">Remote / Location</div>
                <div class="detail-value">\${escapeHtml(app.remote || '—')}</div>
              </div>
              <div class="detail">
                <div class="detail-label">Comp</div>
                <div class="detail-value">\${escapeHtml(app.compensation || '—')}</div>
              </div>
            </div>

            <div class="card-bottom">
              <div class="link-row">
                \${app.report?.path ? \`<a href="\${reportHref}" target="_blank" rel="noreferrer">Open report</a>\` : ''}
                \${app.pdf?.path ? \`<a href="\${pdfHref}" target="_blank" rel="noreferrer">Open PDF</a>\` : ''}
                \${app.jobUrl ? \`<a href="\${escapeHtml(app.jobUrl)}" target="_blank" rel="noreferrer">Open job</a>\` : ''}
              </div>
              <div>\${renderControls(app)}</div>
            </div>
          </article>
        \`;
      }).join('');

      // Set the current status as the selected option in each tracked item's dropdown
      document.querySelectorAll('.tracked-status-select').forEach((select) => {
        const label = select.dataset.current;
        if (label) select.value = label;
      });
    }

    function renderControls(app) {
      if (app.status === 'pending') {
        const opts = ['not available', 'closed', 'not a fit', 'rate too low', 'geo restricted', 'language barrier']
          .map((v) => '<option value="' + v + '">' + v + '</option>').join('');
        return '<div class="status-form">'
          + '<select id="close-reason-' + app.number + '"><option value="">Cerrar como…</option>' + opts + '</select>'
          + '<button data-url="' + escapeHtml(app.jobUrl || '') + '" data-num="' + app.number
          + '" onclick="closePipelineItem(this.dataset.url,this.dataset.num)">Cerrar</button>'
          + '</div>';
      }
      const reportPath = escapeHtml(app.report && app.report.path ? app.report.path : '');
      const opts = STATUS_OPTIONS_CLIENT
        .map((s) => '<option value="' + s + '">' + s + '</option>').join('');
      const note = escapeHtml(app.currentStatus || app.notes || '');
      return '<div class="status-form">'
        + '<select class="tracked-status-select" data-current="' + escapeHtml(app.statusLabel) + '" '
        + 'data-path="' + reportPath + '" onchange="updateStatus(this.dataset.path,this.value)">'
        + opts + '</select>'
        + (note ? '<div class="status-note">' + note + '</div>' : '')
        + '</div>';
    }

    async function closePipelineItem(jobUrl, cardNumber) {
      const sel = document.getElementById('close-reason-' + cardNumber);
      const reason = sel ? sel.value : '';
      if (!reason) { alert('Selecciona un motivo'); return; }
      const resp = await fetch('/api/pipeline-close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobUrl, reason }),
      });
      if (!resp.ok) { alert(await resp.text()); return; }
      await load();
    }

    function render() {
      renderStats();
      renderList();
      renderTabs();
    }

    load();
    window.updateStatus = updateStatus;
    window.closePipelineItem = closePipelineItem;
  </script>
</body>
</html>`;
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://localhost:${port}`);

  if (req.method === 'GET' && requestUrl.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderIndex());
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/api/apps') {
    const apps = [...readApplications(), ...readPendingPipeline()];
    const metrics = computeMetrics(apps);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ apps, metrics }));
    return;
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/status') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const { reportPath, status } = JSON.parse(body);
        if (!reportPath || !STATUS_OPTIONS.includes(status)) throw new Error('Invalid payload');
        replaceStatus(reportPath, status);
        res.writeHead(204);
        res.end();
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(error.message);
      }
    });
    return;
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/pipeline-close') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const { jobUrl, reason } = JSON.parse(body);
        if (!jobUrl || !reason) throw new Error('Missing jobUrl or reason');
        await closePipelineItem(jobUrl, reason);
        res.writeHead(204);
        res.end();
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(error.message);
      }
    });
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/file') {
    const relativePath = requestUrl.searchParams.get('path');
    if (!relativePath) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Missing path');
      return;
    }
    serveFile(res, relativePath);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

// ── Pipeline close (local edit + GitHub API push) ─────────────────────────

async function closePipelineItem(jobUrl, reason) {
  const filePath = pipelinePath();
  if (!existsSync(filePath)) throw new Error('pipeline.md not found locally');
  const lines = readFileSync(filePath, 'utf8').split('\n');
  let found = false;
  const updated = lines.map((line) => {
    if (line.startsWith('- [ ]') && line.includes(jobUrl)) {
      found = true;
      const parts = line.replace(/^- \[ \]\s*/, '').split(' | ');
      const company = parts[1] || '';
      const role    = parts[2] || '';
      return `- [x] ${jobUrl} | ${company} | ${role} | Lost — ${reason}`;
    }
    return line;
  });
  if (!found) throw new Error(`URL not found in pending: ${jobUrl}`);
  const newContent = updated.join('\n');
  writeFileSync(filePath, newContent);

  const GH_TOKEN = (() => {
    try {
      const sec = readFileSync(join(repoRoot, 'config', 'secrets.env'), 'utf8');
      return sec.match(/GH_TOKEN\s*=\s*"?([^"\n]+)"?/)?.[1] || '';
    } catch { return ''; }
  })();
  if (!GH_TOKEN) { console.warn('[pipeline-close] No GH_TOKEN — local only'); return; }

  const apiBase = 'https://api.github.com';
  const owner = 'gerardosilva';
  const repoName = 'career-ops';
  const apiFilePath = 'data/pipeline.md';

  const getResp = await fetch(`${apiBase}/repos/${owner}/${repoName}/contents/${apiFilePath}?ref=main`, {
    headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: 'application/vnd.github+json' },
  });
  if (!getResp.ok) throw new Error(`GitHub GET failed: ${getResp.status}`);
  const fileInfo = await getResp.json();

  const putResp = await fetch(`${apiBase}/repos/${owner}/${repoName}/contents/${apiFilePath}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `data: close pipeline item — ${reason}`,
      content: Buffer.from(newContent).toString('base64'),
      sha: fileInfo.sha,
      branch: 'main',
      committer: { name: 'career-ops-bot', email: 'career-ops-bot@gerardosilva.dev' },
    }),
  });
  if (!putResp.ok) { const err = await putResp.text(); throw new Error(`GitHub PUT failed: ${err}`); }
  const result = await putResp.json();
  const newSha = result.commit?.sha || '';
  if (newSha && existsSync(LAST_SHA_FILE)) writeFileSync(LAST_SHA_FILE, newSha);
  console.log(`[pipeline-close] ${newSha.slice(0, 7)} — ${reason}`);
}

// ── Remote sync + Telegram ────────────────────────────────────────────────

const TG_TOKEN = '8526817820:AAFw4JBY0dDwfB0BkyrMyl04uBV4Qh2xopo';
const TG_CHAT  = '11000002';
const LAST_SHA_FILE = join(repoRoot, 'data', '.last-notified-sha');

function sendTelegram(pendingCount, newItems) {
  const script = `
import urllib.request, urllib.parse, json
TG_TOKEN = "${TG_TOKEN}"
TG_CHAT  = "${TG_CHAT}"
pending   = ${pendingCount}
new_items = ${JSON.stringify(newItems)}
lines = ["\U0001F4E1 Career-Ops — nuevos en pipeline", "", f"\U0001F539 {pending} oportunidades en cola"]
if new_items:
    lines.append("")
    lines.append("Recién añadidas:")
    for item in new_items:
        lines.append(f"  • {item}")
message = "\\n".join(lines)
data = urllib.parse.urlencode({"chat_id": TG_CHAT, "text": message}).encode()
req = urllib.request.Request(f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage", data=data)
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        result = json.loads(resp.read())
        print("Telegram:", "OK" if result.get("ok") else result)
except Exception as e:
    print("Telegram failed:", e)
`;
  const r = spawnSync('python3', ['-c', script], { cwd: repoRoot, encoding: 'utf8' });
  console.log('[sync] Telegram:', (r.stdout || r.stderr || '').trim());
}

function syncFromRemote() {
  try {
    execSync('/usr/bin/git fetch origin main', { cwd: repoRoot, stdio: 'pipe' });
    const remoteSha = execSync('/usr/bin/git rev-parse origin/main', { cwd: repoRoot, stdio: 'pipe' })
      .toString().trim();
    const lastSha = existsSync(LAST_SHA_FILE)
      ? readFileSync(LAST_SHA_FILE, 'utf8').trim()
      : '';

    // Pull fresh data files from origin/main into local working copy
    for (const f of ['data/pipeline.md', 'data/scan-history.tsv', 'data/applications.md']) {
      try {
        const content = execSync(`/usr/bin/git show origin/main:${f}`, { cwd: repoRoot, stdio: 'pipe' });
        writeFileSync(join(repoRoot, f), content);
      } catch { /* file may not exist on remote yet */ }
    }

    // Only notify when there are NEW scan commits since we last alerted
    if (lastSha && lastSha !== remoteSha) {
      let newScanLines = '';
      try {
        newScanLines = execSync(
          `/usr/bin/git log origin/main --oneline --grep="^scan:" "${lastSha}..origin/main"`,
          { cwd: repoRoot, stdio: 'pipe' }
        ).toString().trim();
      } catch { /* no commits or range not found */ }

      if (newScanLines) {
        console.log('[sync] New scan commits detected — sending Telegram notification');
        const pending  = readPendingPipeline();
        const tsv      = existsSync(join(repoRoot, 'data', 'scan-history.tsv'))
          ? readFileSync(join(repoRoot, 'data', 'scan-history.tsv'), 'utf8').split('\n')
          : [];
        const recent = tsv
          .filter((l) => l.endsWith('\tadded'))
          .slice(-5)
          .map((l) => { const p = l.split('\t'); return p[3] ? `${p[2]} — ${p[3]}` : p[0]; })
          .filter(Boolean);
        sendTelegram(pending.length, recent);
      }
    }

    if (lastSha !== remoteSha) {
      writeFileSync(LAST_SHA_FILE, remoteSha);
      console.log(`[sync] Updated to origin/main ${remoteSha.slice(0, 7)}`);
    }
  } catch (e) {
    console.error('[sync] Error:', e.message);
  }
}

// Sync on startup (after 20 s to let startup settle) and every 15 min
setTimeout(syncFromRemote, 20_000);
setInterval(syncFromRemote, 15 * 60 * 1000);

// ─────────────────────────────────────────────────────────────────────────────

server.listen(port, '::', () => {
  console.log(`Career Ops dashboard running at http://localhost:${port}`);
  console.log(`Repo root: ${repoRoot}`);
});
