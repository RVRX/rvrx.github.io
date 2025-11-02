# RVRX.dev Website
Eleventy-based static site generator for my primary domain and its blog.

Dependencies: NodeJS (& NPM).
After cloning, run `npm install` in root repository folder. Run `npm start` or `npm run build` to build the site.

## Project Structure
- `docs/` is the directory that should be served to the web (output directory)
- New markdown posts should be placed into `staging/` in their own directories
- `_includes/` contains Nunjucks templates and layouts
- `.eleventy.cjs` is the Eleventy configuration file

## Writing new blog posts
New blog post files are to be written in markdown with YAML frontmatter and placed into the `staging/` folder at the root of this repo, each in its own directory. Running `npm start` will convert these files to HTML and place them into the `docs/blog/` directory.

Post files should use YAML frontmatter like this:
```yaml
---
title: "Post Title"
subtitle: "Post Subtitle"
desc: "Post description for SEO"
published: true
datePosted: "2024-01-01T00:00:00.000Z"
dateEdited: "2024-01-01T00:00:00.000Z"
tags:
  - tag1
  - tag2
color: "#7A9CA2"
---
```

## Converting from old format
If you have posts in the old JSON frontmatter format (with `<!--# START POST #-->` separator), run:
```bash
node convert-posts.js
```

This will convert all posts in `staging/` from JSON frontmatter to YAML frontmatter format.

## Building
- `npm start` or `npm run build` - Build the site to `docs/`
- `npm run serve` - Build and serve with hot reload on `http://localhost:8080`

## Dev-notes
This site uses Eleventy with markdown-it and the same markdown plugins that were previously configured. The template engine is Nunjucks (built into Eleventy).

### Useful Links for Dev
https://www.11ty.dev/docs/
https://mozilla.github.io/nunjucks/templating.html
https://markdown-it.github.io/markdown-it/
python3 -m http.server 8080
