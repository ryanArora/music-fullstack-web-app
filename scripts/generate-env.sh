#!/bin/sh
set -euo pipefail

POSTGRES_PASSWORD=$(openssl rand -hex 32)

cat << EOF
POSTGRES_URL=postgres://postgres:$POSTGRES_PASSWORD@localhost:5432/postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=postgres
EOF