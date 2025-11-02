const MarkdownIt = require('markdown-it');
const mdAttrs = require('markdown-it-attrs');
const mdDecorate = require('markdown-it-decorate');
const mdEmoji = require('markdown-it-emoji');
const mdTaskLists = require('markdown-it-task-lists');
const mdExpandTabs = require('markdown-it-expand-tabs');
const mdAbbr = require('markdown-it-abbr');
const mdSup = require('markdown-it-sup');
const mdSub = require('markdown-it-sub');
const mdMultiTable = require('markdown-it-multimd-table');
const mdMark = require('markdown-it-mark');
const mdFootnote = require('markdown-it-footnote');
const mdImsize = require('markdown-it-imsize');
const mdAnchor = require('markdown-it-anchor');
const underline = require('markdown-it-underline');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

module.exports = function(eleventyConfig) {
  // Add syntax highlighting plugin
  eleventyConfig.addPlugin(syntaxHighlight);

  // Configure markdown-it with all plugins
  const md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typography: true,
    // Only handle special cases; the syntax highlighting plugin handles regular code blocks
    highlight(str, lang) {
      if (lang === 'diagram') {
        return `<pre class="diagram">` + Buffer.from(str, 'base64').toString() + `</pre>`;
      } else if (['mermaid', 'plantuml'].includes(lang)) {
        return `<pre class="codeblock-${lang}"><code>${_.escape(str)}</code></pre>`;
      }
      // Return standard format with language class - the syntax highlighting plugin will process it
      if (lang) {
        return `<pre><code class="language-${lang}">${_.escape(str)}</code></pre>`;
      }
      return `<pre><code>${_.escape(str)}</code></pre>`;
    }
  })
    .use(mdAttrs, {
      allowedAttributes: ['id', 'class', 'target']
    })
    .use(mdDecorate)
    .use(underline)
    .use(mdEmoji)
    .use(mdTaskLists, { label: false, labelAfter: false })
    .use(mdExpandTabs)
    .use(mdAbbr)
    .use(mdSup)
    .use(mdSub)
    .use(mdMultiTable, { multiline: true, rowspan: true, headerless: true })
    .use(mdMark)
    .use(mdFootnote)
    .use(mdImsize)
    .use(mdAnchor, {permalink: mdAnchor.permalink.linkInsideHeader({ placement: 'before' })});

  // Set markdown-it as the markdown processor
  eleventyConfig.setLibrary('md', md);

  // Copy static assets from docs directory
  eleventyConfig.addPassthroughCopy('docs/img');
  eleventyConfig.addPassthroughCopy('docs/font');
  // Removed: prismjs passthrough (no longer needed)
  eleventyConfig.addPassthroughCopy('docs/*.css');
  eleventyConfig.addPassthroughCopy('docs/*.html');
  eleventyConfig.addPassthroughCopy('docs/*.js');
  eleventyConfig.addPassthroughCopy('docs/*.ico');
  eleventyConfig.addPassthroughCopy('docs/*.png');
  eleventyConfig.addPassthroughCopy('docs/*.txt');
  eleventyConfig.addPassthroughCopy('docs/*.webmanifest');
  eleventyConfig.addPassthroughCopy('docs/docs');
  eleventyConfig.addPassthroughCopy('CNAME');
  
  // Copy assets from staging post directories
  // This will copy non-markdown files from staging directories
  eleventyConfig.addPassthroughCopy({
    'staging/**/*.jpg': 'blog/',
    'staging/**/*.jpeg': 'blog/',
    'staging/**/*.png': 'blog/',
    'staging/**/*.gif': 'blog/',
    'staging/**/*.webp': 'blog/',
    'staging/**/*.avif': 'blog/',
    'staging/**/*.pdf': 'blog/',
    'staging/**/*.css': 'blog/',
    'staging/**/*.js': 'blog/',
  });
  
  eleventyConfig.setEscapeMarkdown(false);

  // Configure collections
  eleventyConfig.addCollection('posts', function(collectionApi) {
    const posts = collectionApi.getFilteredByGlob('staging/**/*.md')
      .filter(post => post.data.published !== false);
    
    // Set permalink for each post based on its directory
    posts.forEach(post => {
      const pathParts = post.inputPath.split('/');
      const postDir = pathParts[pathParts.length - 2]; // Directory name containing the post
      if (!post.data.permalink) {
        post.data.permalink = `/blog/${postDir}/index.html`;
        post.data.layout = 'post.njk';
      }
    });
    
    return posts.sort((a, b) => {
      const dateA = new Date(a.data.datePosted || 0);
      const dateB = new Date(b.data.datePosted || 0);
      return dateB - dateA;
    });
  });

  // Get all unique tags
  eleventyConfig.addCollection('allTags', function(collectionApi) {
    const posts = collectionApi.getFilteredByGlob('staging/**/*.md')
      .filter(post => post.data.published !== false);
    const tags = new Set();
    posts.forEach(post => {
      if (post.data.tags && Array.isArray(post.data.tags)) {
        post.data.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  });

  // Add custom filters
  eleventyConfig.addFilter('toLocaleDate', function(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('default', { day: 'numeric', month: 'short', year: 'numeric' });
  });

  eleventyConfig.addFilter('shortDate', function(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('default', { month: 'short', year: 'numeric' });
  });

  eleventyConfig.addFilter('random', function(array) {
    if (!Array.isArray(array) || array.length === 0) return '';
    return array[Math.floor(Math.random() * array.length)];
  });

  eleventyConfig.addFilter('size', function(value) {
    if (typeof value === 'string' || Array.isArray(value)) {
      return value.length;
    }
    return 0;
  });

  // Copy assets from staging directories after build
  eleventyConfig.on('eleventy.after', async ({ runMode, outputDir }) => {
    // Copy assets from each staging post directory to its corresponding blog directory
    const stagingDir = path.join(process.cwd(), 'staging');
    const blogDir = path.join(outputDir, 'blog');
    
    if (!fs.existsSync(stagingDir)) return;
    
    const stagingFolders = fs.readdirSync(stagingDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory());
    
    for (const folder of stagingFolders) {
      const sourceDir = path.join(stagingDir, folder.name);
      const targetDir = path.join(blogDir, folder.name);
      
      // Ensure target directory exists
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Copy all non-markdown files
      const files = fs.readdirSync(sourceDir);
      for (const file of files) {
        if (!file.endsWith('.md')) {
          const sourcePath = path.join(sourceDir, file);
          const targetPath = path.join(targetDir, file);
          if (fs.statSync(sourcePath).isFile()) {
            fs.copyFileSync(sourcePath, targetPath);
          }
        }
      }
    }
  });

  // Return configuration
  return {
    dir: {
      input: '.',
      output: 'docs',
      includes: '_includes',
      layouts: '_includes',
      data: '_data'
    },
    templateFormats: ['md', 'njk', 'html'],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk'
  };
};

