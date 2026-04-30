#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

exec codex \
  -C "${repo_root}" \
  -c 'mcp_servers.penpot.url="http://localhost:4401/mcp"' \
  -c 'mcp_servers.penpot.startup_timeout_sec=30' \
  -c 'mcp_servers.penpot.tool_timeout_sec=120' \
  "$@"
