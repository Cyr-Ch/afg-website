# Cloudflare Worker API Setup

This Worker powers:

- `POST /submit-application`
- `GET /list-applications`

for the GitHub Pages frontend.

## 1) Install and login

```bash
npm install -g wrangler
wrangler login
```

## 2) Configure worker

From the `cloudflare` folder:

```bash
wrangler secret put GITHUB_TOKEN
wrangler secret put ADMIN_DASHBOARD_KEY
```

Set non-secret vars in Cloudflare dashboard (Worker settings -> Variables):

- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_BRANCH` (optional, defaults to `main`)
- `ALLOWED_ORIGIN` (your GitHub Pages origin)

For local `wrangler dev`, copy `.dev.vars.example` to `.dev.vars` and fill secret values:

```bash
cp .dev.vars.example .dev.vars
```

## 3) Deploy

```bash
wrangler deploy
```

Copy the deployed URL (example: `https://afg-munich-applications-api.<subdomain>.workers.dev`).

## 4) Connect frontend

Edit `scripts/config.js`:

```js
window.APP_CONFIG = {
  apiBaseUrl: 'https://afg-munich-applications-api.<subdomain>.workers.dev'
};
```

Then push your site changes to GitHub Pages.
