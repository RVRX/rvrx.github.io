# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Development server with auto-reload at http://localhost:8080
npm run serve      # Same as dev
npm run build      # Build static site to docs/
```

## Deployment

The site is hosted on **GitHub Pages** at **https://rvrx.dev** (also reachable at https://www.rvrx.dev).

- **Repo**: [RVRX/rvrx.github.io](https://github.com/RVRX/rvrx.github.io)
- **Pages source**: `master` branch, `/docs` directory — GitHub serves the committed `docs/` output directly (build type: `legacy`, no custom Actions workflow)
- **DNS**: `rvrx.dev` has A records → GitHub Pages IPs (185.199.108-111.153); `www.rvrx.dev` has a CNAME → `rvrx.github.io`
- **HTTPS**: enforced; cert covers both `rvrx.dev` and `www.rvrx.dev`

To publish changes: build the site (`npm run build`), commit the updated `docs/` directory, and push to `master`. GitHub's built-in `pages-build-deployment` workflow deploys automatically.

## Architecture

This is a personal blog/portfolio site built with [Eleventy (11ty)](https://www.11ty.dev/) and deployed to GitHub Pages via the `docs/` output directory (not the default `_site/`).

**Source → Build flow:** `src/` → Eleventy → `docs/`

The `docs/` directory is committed to git and served by GitHub Pages. Do not manually edit files in `docs/`.

### Templates

Templates use Nunjucks (`.njk`) with inheritance:

- `src/_includes/base.njk` — outer HTML shell (head, nav, CSS links)
- `src/_includes/post.njk` — blog post wrapper (title, date, tags); sets `layout: base.njk`
- `src/_includes/sidebar.njk` — sidebar component included in base

Blog posts set `layout: post.njk`, which chains to `base.njk` automatically.

### Blog Posts

New posts go in `src/posts/*.md` with this front matter:

```markdown
---
title: Post Title
description: Short description shown on listing pages
tags:
  - tag1
date: YYYY-MM-DD
layout: post.njk
---
```

The `posts` collection is auto-built from `src/posts/*.md` via `eleventyConfig.addCollection` in `eleventy.config.js`.

### Key Config Details (`eleventy.config.js`)

- **Date filter**: Parses dates timezone-safely (string extraction avoids UTC offset issues). Supports `%Y-%m-%d` and `%B %d, %Y` format strings.
- **Markdown**: `markdown-it` with `markdown-it-anchor` (auto heading anchors with `#` permalink) and `markdown-it-attrs` (custom attributes in markdown).
- **Syntax highlighting**: `@11ty/eleventy-plugin-syntaxhighlight` — use fenced code blocks with language identifier.
- **Pass-through copies**: `src/css/`, `src/img/`, `src/font/`, `src/resume.pdf`, favicons, `src/email.txt`, PWA manifest.

### CSS Files

Stylesheets are in `src/css/` and linked from `base.njk`:
- `home.css`, `listing.css`, `post.css`, `sidebar.css`, `syntax-highlight.css`
