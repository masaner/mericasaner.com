---
name: publish-blog-post
description: >
  Publish a technical engineering blog post to mericasaner.com. Use when importing
  a Markdown draft from another workspace, creating a new engineering article,
  or validating blog frontmatter, Markdown conventions, and static build output.
---

# Publish a Blog Post to `mericasaner.com`

Use this workflow whenever a new technical draft (e.g. from an open-source project repo) needs to be imported and published to `/blog/<slug>` (and `/tr/blog/<slug>`).

## 1. File Location & Naming

- **Directory:** `src/content/blog/`
- **Filename:** `<slug>.md` (or `.mdx`), matching the frontmatter `slug` field in kebab-case (for example: `src/content/blog/apex-guard-clauses.md`).
- **Schema Source of Truth:** [`src/content.config.ts`](../../../src/content.config.ts) (`blog` collection).

## 2. Required & Optional Frontmatter Schema

Every post is validated at build time by Astro's Zod schema (`npm run check` / `npm run build` will fail with a descriptive error if a field is missing or malformed):

```yaml
---
title: 'Human-Readable Article Title'
slug: 'url-friendly-kebab-slug'
date: '2026-11-15'
summary: '1-2 sentence technical overview used on /blog cards and SEO meta descriptions.'
tags: ['Salesforce', 'Apex', 'Open Source']
repoUrl: 'https://github.com/masaner/example-repo' # Optional
series: 'ApexGuard' # Optional: series identifier
category: 'ApexGuard · Overview' # Optional: groups pages in the left sidebar
sidebarTitle: 'Short Sidebar Title' # Optional: concise label in left sidebar & pagination
order: 1 # Optional integer: controls explicit order within the sidebar
showInIndex: true # Optional (defaults to true; set false for series sub-guides shown in the article sidebar)
draft: false # Optional (defaults to false; set true to hide from build)
---
```

| Field          | Type       | Required | Validation / Behavior                                                                                                    |
| -------------- | ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `title`        | `string`   | Yes      | Non-empty. Rendered as `<h1>` on `/blog/[slug]` and `<title>` / `og:title`.                                              |
| `slug`         | `string`   | Yes      | Non-empty kebab-case URL segment. Route becomes `/blog/<slug>` and `/tr/blog/<slug>`.                                    |
| `date`         | `string`   | Yes      | Must match `YYYY-MM-DD` (e.g. `2026-11-15`). Posts on `/blog` are sorted newest-first.                                   |
| `summary`      | `string`   | Yes      | Non-empty. Shown on `/blog` cards, under the post `<h1>`, and in SEO `description` / `og:description`.                   |
| `tags`         | `string[]` | No       | Defaults to `[]`. Displayed as pills on `/blog` and `/blog/[slug]`, and emitted as `article:tag` meta tags.              |
| `repoUrl`      | `URL`      | No       | Must be a valid URL. Renders the **"View Source on GitHub"** CTA button in the post header and `codeRepository` JSON-LD. |
| `series`       | `string`   | No       | Optional series identifier for multi-part documentation or article series.                                               |
| `category`     | `string`   | No       | Optional left-sidebar group heading (defaults to `series` or `'Articles'`).                                              |
| `sidebarTitle` | `string`   | No       | Optional shorter title rendered in the left sidebar navigation and Previous/Next pagination cards.                       |
| `order`        | `number`   | No       | Optional integer sort key (`order` ascending first, then `date` descending) inside series sidebar navigation.            |
| `showInIndex`  | `boolean`  | No       | Defaults to `true`. Set `false` on companion sub-guides so `/blog` only displays the main flagship card.                 |
| `draft`        | `boolean`  | No       | Defaults to `false`. Draft posts (`draft: true`) are excluded from `/blog` and static route generation.                  |

## 3. Markdown Formatting Conventions

1. **Heading Hierarchy:** Start body headings at `##` (H2) and use `###` / `####` for subsections. Do **not** include an `#` (H1) in the Markdown body—the post header renders `frontmatter.title` as the page's single `<h1>`.
2. **Code Blocks & Language Tags:** Always specify a language identifier on fenced code blocks (` ```apex `, ` ```python `, ` ```bash `, ` ```ts `, ` ```json `, ` ```yaml `, ` ```mermaid `). Astro compiles them via Shiki (dual light/dark themes), and [`src/utils/rehype-blog-enhancements.mjs`](../../../src/utils/rehype-blog-enhancements.mjs) automatically wraps every `<pre>` with a language header bar and a one-click **Copy** button.
3. **Tables:** Use standard GFM Markdown pipe tables with a header row. The Sätteri HAST plugin automatically wraps every `<table>` in an accessible scrollable `.table-wrapper` (`role="region"`, `tabindex="0"`) and injects `data-label` attributes onto `<td>` cells for responsive stacked cards on narrow viewports.
4. **Blockquotes & Callouts:** Standard Markdown blockquotes (`> ...`) render with an SLDS Cosmos left accent bar and subtle surface container.
5. **Absolute Repository Links:** When importing a draft written inside another project's `docs/` folder, convert all relative file links (such as `../force-app/.../Guard.cls` or `../ROADMAP.md`) into full GitHub URLs (`https://github.com/masaner/<repo>/blob/main/...`) so links work on the live website instead of 404ing.
6. **Reading Time:** Computed automatically from word count (`Math.max(1, Math.ceil(words / 200))`); do not hardcode reading time in frontmatter.

## 4. One-Command Publish & Verification

Ensure Node 24 (`.nvmrc`) is active, then drop the post into `src/content/blog/<slug>.md` and run:

```bash
npm run format && npm run check && npm run build
```

To verify locally before deploying or pushing:

- Confirm `dist/blog/index.html` lists the new post card in reverse chronological order.
- Confirm `dist/blog/<slug>/index.html` and `dist/tr/blog/<slug>/index.html` were generated without errors.
- Deploy to Cloudflare Workers Static Assets with `npm run deploy` (or push to `main` for CI validation and Cloudflare Git integration deployment).
