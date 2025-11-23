module.exports = {
  permalink: function(data) {
    // For markdown files in posts directory, use /blog/{{ name }}/
    if (data.page && data.page.inputPath && 
        data.page.inputPath.includes("src/posts/") && 
        data.page.inputPath.endsWith(".md")) {
      return `/blog/${data.page.fileSlug}/`;
    }
    return data.permalink;
  }
};
