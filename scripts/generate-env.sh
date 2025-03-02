#!/bin/sh
set -euo pipefail

read -p "Enter your Discord client ID: " DISCORD_CLIENT_ID
read -p "Enter your Discord client secret: " DISCORD_CLIENT_SECRET

POSTGRES_PASSWORD=$(openssl rand -hex 32)
NEXTAUTH_SECRET=$(openssl rand -hex 32)

cat << EOF
POSTGRES_URL=postgres://postgres:$POSTGRES_PASSWORD@localhost:5432/postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=postgres
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
DISCORD_CLIENT_ID=$DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET=$DISCORD_CLIENT_SECRET
EOF