#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILL_SRC="$REPO_ROOT/skills/career-ops"

mkdir -p "$HOME/.codex/skills" "$HOME/.openclaw/skills"
ln -sfn "$SKILL_SRC" "$HOME/.codex/skills/career-ops"
ln -sfn "$SKILL_SRC" "$HOME/.openclaw/skills/career-ops"

echo "Linked skill:"
echo "  Codex    -> $HOME/.codex/skills/career-ops"
echo "  OpenClaw -> $HOME/.openclaw/skills/career-ops"
