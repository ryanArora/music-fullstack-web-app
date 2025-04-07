# `music`

music app, similar to Spotify and Youtube Music. I made most of it over the weekend with Cursor to test the new `claude-3.7-sonnet-thinking` model.

The model showed high initiative. With the combination of Cursor's Iterate on Lints feature and the scaffhold's end-to-end typesafety, the model was able to fix most of its obvious mistakes before stopping.

However, the model often stopped after outputting code with major usability issues.

## Development

### First Time

```bash
nvm install && nvm use && corepack enable
pnpm install
pnpm generate-env
```

### After

```bash
docker compose up
pnpm dev
```
