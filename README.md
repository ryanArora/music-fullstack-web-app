# `music`

music app, similar to Spotify and Youtube Music. I made most of it over the weekend with Cursor to test the new `claude-3.7-sonnet-thinking` model.

The model showed high initiative. With the combination of Cursor's Iterate on Lints feature and the scaffhold's end-to-end typesafety, the model was able to fix most of its obvious mistakes before stopping.

However, the model often stopped after outputting code with major usability issues.

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
