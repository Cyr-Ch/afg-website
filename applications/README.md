# Munich Hub Applications

Submitted applications are stored automatically by the Cloudflare Worker at:

- `applications/submissions/*.json` for applicant data
- `applications/cv/*.pdf` for uploaded CV files

## Required environment variables

Set these as Cloudflare Worker secrets/variables:

- `GITHUB_TOKEN` (repo write permissions)
- `GITHUB_OWNER` (e.g. your org or username)
- `GITHUB_REPO` (this repository name)
- `GITHUB_BRANCH` (optional, defaults to `main`)
- `ADMIN_DASHBOARD_KEY` (required to access `admin.html`)
- `ALLOWED_ORIGIN` (recommended: your GitHub Pages URL, e.g. `https://<user>.github.io`)

## Security notes

- Never expose `GITHUB_TOKEN` in frontend code.
- Never expose `ADMIN_DASHBOARD_KEY` in frontend code.
- Keep this folder private if applications include personal data.

## Admin dashboard

- Open `admin.html` to review applications.
- Enter the key from `ADMIN_DASHBOARD_KEY` when prompted.
