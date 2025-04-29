# `music`

A music app, similar to Spotify and Youtube Music.

## Development

Open in the repository using the Dev Containers vscode extension. Then:

### First Time

```bash
pnpm generate-env
docker compose up -d
pnpm db:push
pnpm db:seed
pnpm db:scrape       # Add an artist from Youtube Music.
docker compose down
```

### After

```bash
docker compose up    # Start postgres, minio (local S3)
pnpm dev             # Start NextJS
```
