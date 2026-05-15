#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_PORT="${MIMOOPS_PORT:-8787}"
WEB_PORT="${MIMOOPS_WEB_PORT:-5173}"

cd "$ROOT_DIR"

if ! curl -fsS "http://127.0.0.1:${API_PORT}/healthz" >/dev/null 2>&1; then
  MIMOOPS_PORT="$API_PORT" nohup npm run api >/tmp/mimoops-api.log 2>&1 &
fi

if ! curl -fsS "http://127.0.0.1:${WEB_PORT}" >/dev/null 2>&1; then
  nohup npm run dev -- --port "$WEB_PORT" >/tmp/mimoops-web.log 2>&1 &
fi

printf 'MiMoOps API: http://127.0.0.1:%s/api/status\n' "$API_PORT"
printf 'MiMoOps web: http://127.0.0.1:%s\n' "$WEB_PORT"
printf 'Logs: /tmp/mimoops-api.log /tmp/mimoops-web.log\n'
