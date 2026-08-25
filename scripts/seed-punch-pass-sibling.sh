#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SQL="$ROOT/scripts/seed-punch-pass-sibling.sql"

if [[ -z "${BOND_DATABASE_URL:-}" && -f "$ROOT/.env.local" ]]; then
	BOND_DATABASE_URL="$(
		grep -E '^BOND_DATABASE_URL=' "$ROOT/.env.local" | tail -n 1 | cut -d= -f2- |
			sed -e 's/^["'\'']//' -e 's/["'\'']$//'
	)"
	export BOND_DATABASE_URL
fi

if [[ -z "${BOND_DATABASE_URL:-}" ]]; then
	echo "Set BOND_DATABASE_URL in the environment or in .env.local" >&2
	exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
	echo "psql is not on PATH" >&2
	exit 1
fi

exec psql "$BOND_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SQL"
