#!/usr/bin/env bash
set -euo pipefail

PORT="${PLAYWRIGHT_PORT:-$((4500 + RANDOM % 1000))}"

kill_port() {
  if command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -ti "tcp:${PORT}" || true)"
    if [ -n "${pids}" ]; then
      kill ${pids} || true
    fi
  fi
}

kill_port

cleanup() {
  kill_port
}
trap cleanup EXIT

npm run build
PLAYWRIGHT_PORT="${PORT}" npx playwright test e2e/looper.spec.ts
