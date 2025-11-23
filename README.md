# Eleventy Blog

A static blog built with [Eleventy](https://www.11ty.dev/) (11ty), featuring tag support, syntax highlighting, and a clean, simple design.

## Features

- 🎨 Clean, responsive design
- 🏷️ Tag-based post organization
- 💻 Syntax highlighting for code blocks
- 📝 Markdown-based content
- 🚀 Fast static site generation

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd rvrx.dev-refactor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Development Server

Start a local development server with auto-reload:

```bash
npm run dev
```

Or use the serve command:

```bash
npm run serve
```

The site will be available at `http://localhost:8080` (or the port shown in the terminal).

### Build for Production

Generate the static site:

```bash
npm run build
```

The output will be in the `_site` directory.

## Project Structure

```
.
├── src/                    # Source files
│   ├── _includes/         # Template includes (see below)
│   ├── css/               # Stylesheets
│   ├── font/              # Web fonts
│   ├── img/               # Images
│   ├── posts/             # Blog posts (Markdown files)
│   ├── tags/              # Tag pages
│   ├── index.njk          # Home page template
│   └── tags.njk           # Tags listing template
├── _site/                 # Generated static site (not in git)
├── eleventy.config.js     # Eleventy configuration
└── package.json           # Dependencies and scripts
```

## Creating Blog Posts

Create a new Markdown file in the `src/posts/` directory. Each post should include front matter with metadata:

```markdown
---
title: Your Post Title
description: A brief description of the post
tags:
  - tag1
  - tag2
date: 2024-01-15
layout: post.njk
---

Your post content goes here in Markdown format.

You can use code blocks with syntax highlighting:

javascript
function example() {
  console.log("Hello, world!");
}

```

### Front Matter Fields

- `title` (required): The post title
- `description` (optional): A short description shown on listing pages
- `tags` (optional): Array of tags for categorizing posts
- `date` (optional): Publication date in `YYYY-MM-DD` format
- `layout` (required): Should be `post.njk` for individual posts

## The `_includes` Directory

The `_includes` directory contains reusable template files that are used across your site. Eleventy automatically looks for templates in this directory when you reference them in your front matter or templates.

### How It Works

In your Eleventy configuration (`eleventy.config.js`), the `_includes` directory is specified as the includes directory:

```javascript
dir: {
  input: "src",
  output: "_site",
  includes: "_includes"  // This tells Eleventy where to find templates
}
```

When you set `layout: base.njk` in your front matter, Eleventy looks for `base.njk` in the `_includes` directory.

### Templates Included

#### `base.njk`

The base layout template that wraps all pages on your site. It includes:

- HTML document structure (`<html>`, `<head>`, `<body>`)
- Meta tags and title
- Site header with navigation
- Links to CSS files
- A `<main>` block where page content is injected via `{{ content | safe }}`

**Usage:** Set `layout: base.njk` in your page's front matter to use this base template.

#### `post.njk`

A layout template specifically designed for individual blog posts. It includes:

- An `<article>` wrapper
- Post title (`<h1>`)
- Post date (formatted)
- Tags list with links
- The post content

**Usage:** Set `layout: post.njk` in your post's front matter. The `post.njk` template itself uses `base.njk`, so posts get both layouts (nested).

### Template Inheritance

Eleventy supports template inheritance. For example:

1. A blog post sets `layout: post.njk` in its front matter
2. `post.njk` has `layout: base.njk` at the top (in its front matter)
3. This creates a chain: `post content` → `post.njk` → `base.njk`

This allows you to create specialized layouts while maintaining a consistent base structure.

### Creating Custom Templates

You can create additional templates in `_includes/` for different page types:

1. Create a new `.njk` file in `src/_includes/`
2. Reference it in your page's front matter: `layout: your-template.njk`
3. Use Nunjucks syntax to structure your template
4. Include `{{ content | safe }}` where you want page content to appear

## Configuration

The site is configured in `eleventy.config.js`:

- **Syntax Highlighting**: Uses `@11ty/eleventy-plugin-syntaxhighlight` for code block highlighting
- **Date Filter**: Custom date filter for formatting dates
- **Posts Collection**: Automatically collects all Markdown files from `src/posts/`
- **Asset Copying**: CSS, images, and fonts are automatically copied to the output directory

## Customization

### Styling

Edit the CSS files in `src/css/`:
- `home.css` - Home page styles
- `listing.css` - Post listing styles
- `post.css` - Individual post styles
- `sidebar.css` - Sidebar styles
- `syntax-highlight.css` - Code syntax highlighting styles

### Templates

Modify the templates in `src/_includes/` to change the site structure and layout.

### Configuration

Update `eleventy.config.js` to:
- Add new collections
- Configure plugins
- Set up filters or shortcodes
- Modify build settings

## License

MIT

