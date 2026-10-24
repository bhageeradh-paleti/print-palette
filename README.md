# Print Paint Mixer

Offline-friendly web tool to suggest **volume ratios** when mixing **Matou 24** acrylic paints for **mini** painting on **colored filament** (no primer).

## Features

- Target color via **hex** or **image color picker**
- Model **base filament color** and **coverage** slider (how much the plastic shows through)
- Best **2-paint** and **3-paint** recipes with simple step-by-step instructions
- **“Not in your set”** hint when a common reference tube would match better
- **Feedback buttons** (too dark, more blue, …) stored locally to nudge tube calibration
- **Download / load** recipes as `.paint-mix.json` files
- Works **offline** after first load (static export + service worker cache)

## Run locally

```bash
npm install
npm run dev -- -p 43123
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

## Production static build

```bash
npm run build
npx serve out -l 43123
```

## GitHub Pages (public link)

The repo includes a workflow: **Deploy to GitHub Pages** (`.github/workflows/deploy-github-pages.yml`).

### One-time setup

1. Create a GitHub repository named **`print-palette`** (or any name — if different, set `GH_PAGES_REPO` when building).
2. Push this project to GitHub:

   ```bash
   git remote add origin https://github.com/bhageeradh-paleti/print-palette.git
   git push -u origin main
   ```

3. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. After the workflow runs, open:

   **`https://bhageeradh-paleti.github.io/print-palette/`**

Each push to `main` redeploys automatically.

### Test the Pages build locally

```bash
set GITHUB_PAGES=true
set GITHUB_REPOSITORY=bhageeradh-paleti/print-palette
npm run build
npx serve out -l 43123
```

Then visit `http://127.0.0.1:43123/print-palette/` (path must include the repo name).

## Calibrating your tubes

Default hex values are **estimates** for standard pigment names. For best results:

1. Paint a small swatch of each tube on the **same filament** you use for minis.
2. Photograph in consistent light and set each tube’s hex under **My tubes**.

Ratios are **parts by volume** (same for brush and airbrush; thin for spraying without changing the mix ratio).

## Limits

- Opaque acrylic mixing is approximated in software — always test on a spare surface.
- Metallics, heavy glazes, and varnish shifts are not fully modeled.
