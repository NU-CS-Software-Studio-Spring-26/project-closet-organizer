#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/back-end"
FRONTEND_DIR="$ROOT_DIR/front-end"
BACKEND_HOST="${BACKEND_HOST:-127.0.0.1}"
BACKEND_PORT="${BACKEND_PORT:-3000}"
FRONTEND_HOST="${FRONTEND_HOST:-127.0.0.1}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

BACKEND_PID=""
FRONTEND_PID=""

load_env_file() {
  local env_file="$1"
  local line
  local key
  local value

  if [[ ! -f "$env_file" ]]; then
    return
  fi

  echo "Loading environment from ${env_file#$ROOT_DIR/}"

  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"

    [[ -z "${line//[[:space:]]/}" ]] && continue
    [[ "$line" =~ ^[[:space:]]*# ]] && continue

    if [[ "$line" =~ ^[[:space:]]*(export[[:space:]]+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      key="${BASH_REMATCH[2]}"
      value="${BASH_REMATCH[3]}"

      value="${value#"${value%%[![:space:]]*}"}"
      value="${value%"${value##*[![:space:]]}"}"

      if [[ "$value" =~ ^\"(.*)\"$ ]]; then
        value="${BASH_REMATCH[1]}"
      elif [[ "$value" =~ ^\'(.*)\'$ ]]; then
        value="${BASH_REMATCH[1]}"
      fi

      export "$key=$value"
      continue
    fi

    echo "Warning: skipping invalid env line in ${env_file#$ROOT_DIR/}: $line" >&2
  done < "$env_file"
}

kill_matching_processes() {
  local pattern="$1"
  local service_name="$2"
  local pids

  pids="$(pgrep -f "$pattern" 2>/dev/null | sort -u || true)"
  if [[ -z "$pids" ]]; then
    return
  fi

  echo "Stopping existing ${service_name} process(es): ${pids}"
  while IFS= read -r pid; do
    [[ -z "$pid" ]] && continue
    kill "$pid" 2>/dev/null || true
  done <<< "$pids"
}

kill_processes_on_port() {
  local port="$1"
  local service_name="$2"
  local pids

  pids="$(lsof -ti "tcp:${port}" 2>/dev/null | sort -u || true)"
  if [[ -z "$pids" ]]; then
    return
  fi

  echo "Stopping existing ${service_name} process(es) on port ${port}: ${pids}"
  while IFS= read -r pid; do
    [[ -z "$pid" ]] && continue
    kill "$pid" 2>/dev/null || true
  done <<< "$pids"

  for _ in {1..10}; do
    if ! lsof -ti "tcp:${port}" >/dev/null 2>&1; then
      return
    fi
    sleep 1
  done

  pids="$(lsof -ti "tcp:${port}" 2>/dev/null | sort -u || true)"
  if [[ -n "$pids" ]]; then
    echo "Force stopping stubborn ${service_name} process(es) on port ${port}: ${pids}"
    while IFS= read -r pid; do
      [[ -z "$pid" ]] && continue
      kill -9 "$pid" 2>/dev/null || true
    done <<< "$pids"
  fi
}

cleanup() {
  trap - EXIT INT TERM

  if [[ -n "${FRONTEND_PID}" ]] && kill -0 "${FRONTEND_PID}" 2>/dev/null; then
    kill "${FRONTEND_PID}" 2>/dev/null || true
  fi

  if [[ -n "${BACKEND_PID}" ]] && kill -0 "${BACKEND_PID}" 2>/dev/null; then
    kill "${BACKEND_PID}" 2>/dev/null || true
  fi

  wait "${FRONTEND_PID}" 2>/dev/null || true
  wait "${BACKEND_PID}" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

if [[ ! -d "$BACKEND_DIR" || ! -d "$FRONTEND_DIR" ]]; then
  echo "Expected back-end/ and front-end/ directories under $ROOT_DIR" >&2
  exit 1
fi

if [[ ! -x "$BACKEND_DIR/bin/dev" ]]; then
  echo "Missing executable backend launcher at $BACKEND_DIR/bin/dev" >&2
  exit 1
fi

if [[ ! -f "$FRONTEND_DIR/package.json" ]]; then
  echo "Missing frontend package.json at $FRONTEND_DIR/package.json" >&2
  exit 1
fi

load_env_file "$ROOT_DIR/.env"
load_env_file "$ROOT_DIR/.env.local"
load_env_file "$BACKEND_DIR/.env"
load_env_file "$BACKEND_DIR/.env.local"
load_env_file "$FRONTEND_DIR/.env"
load_env_file "$FRONTEND_DIR/.env.local"

kill_matching_processes "$FRONTEND_DIR/node_modules/.bin/vite" "frontend dev server"
kill_processes_on_port "$BACKEND_PORT" "backend"
kill_processes_on_port "$FRONTEND_PORT" "frontend"

echo "Starting backend on http://${BACKEND_HOST}:${BACKEND_PORT}"
(
  cd "$BACKEND_DIR"
  FRONTEND_HOST="$FRONTEND_HOST" FRONTEND_PORT="$FRONTEND_PORT" exec ./bin/dev -b "$BACKEND_HOST" -p "$BACKEND_PORT"
) &
BACKEND_PID=$!

echo "Starting frontend on http://${FRONTEND_HOST}:${FRONTEND_PORT}"
(
  cd "$FRONTEND_DIR"
  BACKEND_HOST="$BACKEND_HOST" BACKEND_PORT="$BACKEND_PORT" exec npm run dev -- --host "$FRONTEND_HOST" --port "$FRONTEND_PORT" --strictPort
) &
FRONTEND_PID=$!

echo "Both services are starting."
echo "Frontend: http://${FRONTEND_HOST}:${FRONTEND_PORT}"
echo "Backend:  http://${BACKEND_HOST}:${BACKEND_PORT}"
echo "Press Ctrl+C to stop both."

while true; do
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    wait "$BACKEND_PID"
    exit $?
  fi

  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    wait "$FRONTEND_PID"
    exit $?
  fi

  sleep 1
done
