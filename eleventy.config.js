const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItAttrs = require("markdown-it-attrs");

module.exports = function(eleventyConfig) {
  // Configure markdown-it with anchor plugin
  const markdownLibrary = markdownIt({ html: true })
    .use(markdownItAttrs)
    .use(markdownItAnchor, {
      level: [1, 2, 3, 4, 5, 6], // Apply to all heading levels
      slugify: (str) =>
        str
          .toLowerCase()
          .replace(/[\s]+/g, "-") // Replace spaces with hyphens
          .replace(/[^\w-]+/g, ""), // Remove non-word characters
      permalink: true,
      permalinkBefore: true, // Place permalink before the heading text
      permalinkSymbol: "#",
      permalinkClass: "heading-anchor",
    });

  // Set the custom Markdown library
  eleventyConfig.setLibrary("md", markdownLibrary);

  // Add syntax highlighting plugin
  eleventyConfig.addPlugin(syntaxHighlight, {
    templateFormats: ["md", "njk"],
    alwaysWrapLineHighlights: false,
    preAttributes: {
      tabindex: "0"
    }
  });

  // Add date filter
  eleventyConfig.addFilter("date", function(date, format) {
    if (!date) return "";
    
    // Handle both YYYY-MM-DD and timestamp formats (YYYY-MM-DDTHH:mm:ss)
    // Extract date components directly from string to avoid timezone issues
    let d;
    if (typeof date === 'string') {
      // Match YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss (with optional timezone)
      const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})(?:T|$)/);
      if (dateMatch) {
        const [, year, month, day] = dateMatch;
        d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)); // month is 0-indexed
      } else {
        d = new Date(date);
        if (isNaN(d.getTime())) return "";
      }
    } else {
      d = new Date(date);
      if (isNaN(d.getTime())) return "";
    }
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    
    if (format === '%Y-%m-%d') {
      return `${year}-${month}-${day}`;
    } else if (format === '%B %d, %Y') {
      return `${monthNames[d.getMonth()]} ${d.getDate()}, ${year}`;
    }
    
    return d.toLocaleDateString();
  });

  // Create a collection for posts
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md");
  });

  // Copy CSS to output
  eleventyConfig.addPassthroughCopy("src/css");
  
  // Copy images to output
  eleventyConfig.addPassthroughCopy("src/img");
  
  // Copy fonts to output
  eleventyConfig.addPassthroughCopy("src/font");
  
  // Copy PDF files to output
  eleventyConfig.addPassthroughCopy("src/resume.pdf");

  // favicons
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addPassthroughCopy("src/favicon-16x16.png");
  eleventyConfig.addPassthroughCopy("src/faciton-32x32.png");

  // SEO stuff
  eleventyConfig.addPassthroughCopy("src/android-chrome-192x192.png");
  eleventyConfig.addPassthroughCopy("src/android-chrome-512x512.png");
  eleventyConfig.addPassthroughCopy("src/apple-touch-icon.png");
  eleventyConfig.addPassthroughCopy("src/site.webmanifest");

  // email txt
  eleventyConfig.addPassthroughCopy("src/email.txt");

  // Configure directories
  return {
    dir: {
      input: "src",
      output: "docs",
      includes: "_includes"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
