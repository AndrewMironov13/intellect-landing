#!/usr/bin/env bash
# Деплой текущего main на Timeweb App Platform через MCP Timeweb (двухшаговое подтверждение).
# Нужен TIMEWEB_TOKEN в окружении (лежит в ~/.zshrc). Использование: scripts/deploy.sh [sha]
set -euo pipefail
APP_ID=257841
SHA="${1:-$(git rev-parse HEAD)}"
[ -n "${TIMEWEB_TOKEN:-}" ] || { echo "TIMEWEB_TOKEN не задан: source ~/.zshrc"; exit 1; }
U=https://api.timeweb.cloud/api/v1/mcp/search
call() { curl -s -m 60 -H "Authorization: Bearer $TIMEWEB_TOKEN" -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' "$U" -d "$1" | sed 's/^data: //' | grep '^{' | python3 -c 'import sys,json; d=json.loads(sys.stdin.read()); print(d["result"]["content"][0]["text"])'; }
args() { printf '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"execute_tool","arguments":{"tool_id":"create_app_deploy","arguments":{"app_id":%s,"commit_sha":"%s"%s}}}}' "$APP_ID" "$SHA" "$1"; }
TOK=$(call "$(args '')" | grep -oE '[0-9a-f-]{36}' | head -1)
[ -n "$TOK" ] || { echo "не получила confirm_token"; exit 1; }
call "$(args ",\"confirm_token\":\"$TOK\"")"
echo "деплой $SHA запущен; статус: панель Timeweb → Cute Grosbeak → Деплой"
