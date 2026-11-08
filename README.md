# mericasaner.com

The personal portfolio website of **Meriç Alper Aşaner** — Senior Salesforce Developer & Integration Engineer.

Engineered with [Astro](https://astro.build), [Cloudflare Workers](https://developers.cloudflare.com/workers/), modern CSS tokens inspired by the **Salesforce Lightning Design System 2.0 (SLDS Cosmos)**, system-aware Light/Dark mode, and full bilingual localization (English & Turkish).

---

## 🚀 Key Highlights

- **Near-Zero JS Footprint:** Built as a static website with Astro, delivering near 100/100 Lighthouse performance.
- **SLDS 2.0 Cosmos Design System:** Features Salesforce's modern design language (Cosmos global styling hooks `--slds-g-*`, clean card architecture, and interactive SLDS Path career progressions).
- **System-Aware Light & Dark Themes:** Fully automated via CSS `color-scheme` and `light-dark()`, with manual tri-state user override (System, Light, Dark) persisted in `localStorage` without FOUC (flash of un-themed content).
- **Bilingual by Design (EN & TR):** English at `/` and Turkish at `/tr/` with canonical `hreflang` alternate tags and auto-generated multi-locale sitemaps.
- **Content-as-Data Architecture:** All content lives in structured, typed YAML collections (`src/content/`). Astro strictly validates dates and bilingual strings at compile time.
- **Mobile-First UX:** Responsive mobile navigation drawer, fluid typography with `clamp()`, and touch targets conforming to WCAG 2.2 AA.

---

## 🛠 Local Development

Ensure you have **Node 22+** (recommended Node 24 via nvm):

```bash
# Pin Node version
nvm use 24

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:4321` in your browser.

---

## 📝 How to Update Your Site

You do **not** need to touch Astro components, HTML, or CSS to keep your site updated over the years. Simply edit the data files in `src/content/`:

| What to Update               | File Location                                                        | Description                                                                               |
| ---------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Bio, Title, Links, Stats** | [`src/content/profile.yaml`](src/content/profile.yaml)               | Update your title, headline, about paragraphs, record card, and social links.             |
| **Work Experience**          | [`src/content/experience/`](src/content/experience/)                 | Add a new `.yaml` file for each new role. Roles are automatically sorted chronologically. |
| **Case Studies**             | [`src/content/projects/`](src/content/projects/)                     | Add or edit projects (Challenge → Contribution → Outcome structure).                      |
| **Certifications**           | [`src/content/certifications.yaml`](src/content/certifications.yaml) | Add newly acquired Salesforce & MuleSoft credentials and verification URLs.               |
| **Skills & Technologies**    | [`src/content/skills.yaml`](src/content/skills.yaml)                 | Add or reorder technologies and tools by domain.                                          |
| **PDF Resumes**              | `public/cv/`                                                         | Drop new versions named `Meric-Asaner-CV-EN.pdf` and `Meric-Asaner-CV-TR.pdf`.            |

Every text field has an `en` and `tr` translation. If you miss a translation or misformat a date, `npm run check` will immediately point out the exact line before anything gets pushed.

---

## 🏗 Build & Quality Checks

```bash
# Typecheck and validate content schema
npm run check

# Build production static bundle in dist/
npm run build

# Preview production build locally
npm run preview

# Format code with Prettier
npm run format
```

---

## ☁️ Deployment (Cloudflare Workers & GitHub)

The project includes a ready-to-deploy [`wrangler.jsonc`](wrangler.jsonc) configured for Cloudflare Workers Static Assets with your custom domain (`mericasaner.com` and `www.mericasaner.com`).

### Deploying via GitHub (Recommended)

1. Push this repository to GitHub: `https://github.com/masaner/mericasaner-site` (or your chosen repo name).
2. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com) → **Compute (Workers) > Create > Import from GitHub**.
3. Select your repository. Set build command to `npm run build` and output directory to `dist`.
4. Cloudflare will automatically build and publish previews on every branch and deploy to `mericasaner.com` on every push to `main`!

### Deploying via CLI

```bash
npx wrangler login
npm run deploy
```

---

## 📜 License

Private personal portfolio of Meriç Alper Aşaner.
