import _ from 'lodash'

// File IO
import fs from 'fs';
import path from 'node:path';

// dotenv
import 'dotenv/config'


// Markdown-it
import MarkdownIt from 'markdown-it'
import mdAttrs from 'markdown-it-attrs'
import mdDecorate from 'markdown-it-decorate'
import mdEmoji from 'markdown-it-emoji'
import mdTaskLists from 'markdown-it-task-lists'
import mdExpandTabs from 'markdown-it-expand-tabs'
import mdAbbr from 'markdown-it-abbr'
import mdSup from 'markdown-it-sup'
import mdSub from 'markdown-it-sub'
import mdMark from 'markdown-it-mark'
import mdMultiTable from 'markdown-it-multimd-table'
import mdFootnote from 'markdown-it-footnote'
import mdImsize from 'markdown-it-imsize'
import mdAnchor from 'markdown-it-anchor'
import underline from 'markdown-it-underline'
import 'katex/dist/contrib/mhchem.js' // TODO: added .js, as node wasn't finding it otherwise?
import plantuml from 'plantuml' // TODO: was from './markdown/plantuml'
//Nunjucks (Template Engine)
import nunjucks from 'nunjucks'

// Mermaid
import mermaid from 'mermaid'
// Prism (Syntax Highlighting)


// markdown-it Config [[ NOTE: Copied from Wiki.JS setup ]]
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typography: true,
  highlight(str, lang) {
    if (lang === 'diagram') {
      return `<pre class="diagram">` + Buffer.from(str, 'base64').toString() + `</pre>`
    } else if (['mermaid', 'plantuml'].includes(lang)) {
      return `<pre class="codeblock-${lang}"><code>${_.escape(str)}</code></pre>`
    } else {
      return `<pre><code class="language-${lang}">${_.escape(str)}</code></pre>`
    }
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
  .use(mdAnchor, {permalink: mdAnchor.permalink.linkInsideHeader({ placement: 'before' })})


const PUBLIC_DIR = process.env.PUBLIC_DIR;
const BLOG_DIR = path.join(PUBLIC_DIR, process.env.BLOG_DIR);
const STAGING_DIR = path.normalize(process.env.STAGING_DIR);

// Post class definition
class Post {
  constructor(postPath) {
    this.postPath = path.resolve(postPath);
    console_debug("new post:");
    console_debug(this.postPath);
    console_debug("\n");
    this.containingDir = path.dirname(this.postPath);
    Object.assign(this, parseRawPostContents(this.getPostContentsFromDisk(postPath), true));
    this.datePosted = new Date(this.datePosted);  // convert post date string into Date object
    this.dateEdited = this.dateEdited ? new Date(this.dateEdited) : this.datePosted;
    this._short_date = this.datePosted.toLocaleString('default', {month: 'short', year: 'numeric'});  // define shorter plaintext date in format: "Mon #"
    this.tags = this.tags ? this.tags : [];
  }


  //getter
  get bodyMD() {
    // gets entire file contents from this post, cuts off the top JSON and joins the rest together
    return this.getPostContentsFromDisk(this.postPath).split('<!--# START POST #-->').slice(1).join('');
  }

  //getter
  get bodyHTML() {
    // apply Nunjucks template to markdown
    nunjucks.configure('views', { autoescape: false });
    return nunjucks.render('post.njk', { post: this, body: md.render(this.bodyMD) });
  }

  //getter
  get filename() {
    return path.basename(this.postPath);
  }

  //getter
  get parentDir() {
    return path.basename(path.dirname(this.postPath));
  }

  //getter
  get publishingDir() {
    return path.join(BLOG_DIR + this.parentDir);
  }

  //getter (relative path for tag pages)
  get _path() {
    return path.join('/', process.env.BLOG_DIR, this.parentDir);
  }

  //method
  getPostContentsFromDisk(filePathIn) {
    var fileContents;
    try {
      fileContents = fs.readFileSync(filePathIn, 'utf8');
      return fileContents;
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }
}




// get paths to staged markdown files
console.log("~ Collecting posts...");
var stagedPosts = fs.readdirSync(path.resolve(STAGING_DIR), { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(folder => {  // get first *.md in folder
    var folderContents = fs.readdirSync(path.join(folder.path, folder.name));
    var markdownFileIndex = folderContents.findIndex((element) => element.endsWith(".md")); // find first index that passes func
    return markdownFileIndex === -1 ? null : path.join(folder.name, folderContents[markdownFileIndex]);  // return filename or null if no *md
  })
  .filter(files => !!files); // filter out null/undefined


// convert paths to actual posts
console_debug("START converting paths to Posts");
stagedPosts = stagedPosts.map((postFileName) => new Post(path.join('staging/' + postFileName)));
console_debug("DONE converting paths to Posts");

// filter out unpublished posts
console_debug("START filter out unpublished");
stagedPosts = stagedPosts.filter((post) => post.published);
console_debug("DONE filter out unpublished");

// publish posts
console.log("~ Sending posts to publisher...");
stagedPosts.forEach((post) => publishPost(post));

// create tag pages
console.log("~ Sending posts to tag builder...");
createTagPages(stagedPosts);

// create blog homepage (from sorted posts)
console.log("~ Sending posts to homepage builder...");
generateBlogIndexFromPosts(stagedPosts.sort((a,b) => b.datePosted - a.datePosted));

console_debug(stagedPosts);

console.log("~ Done");


/**
 * Converts the given post from MD to HTML and publishes it to its Post.publishingDir
 *
 * SAVE LOCATION: "$Post.publishingDir/index.html"
 * @param aPost a Post object
 */
function publishPost(aPost) {

  process.stdout.write('[publishPost]: ' + aPost.parentDir + ' --> ');

  try {

    // create this post's publishing directory if it doesnt exist
    fs.mkdirSync(aPost.publishingDir, { recursive: true }, (err) => {
      if (err) throw err;
    })

    // create index.html
    fs.writeFileSync(path.join(aPost.publishingDir + '/index.html'), aPost.bodyHTML);

    // copy all other assets over
    // all items in containing directory, except the .md, should be copied over to postFolder
    var postAssets = fs.readdirSync(aPost.containingDir).filter((asset) => !asset.endsWith('.md'));
    postAssets = postAssets.map((x) => '/' + x); // add forward slash to start
    console_debug(postAssets);
    for (var i = postAssets.length - 1; i >= 0; i--) {
      fs.copyFileSync(path.join(aPost.containingDir + postAssets[i]), aPost.publishingDir + postAssets[i]);
      // console.log("copy: '" + aPost.containingDir + postAssets[i] + "' to '" + aPost.publishingDir + postAssets[i] + "'");
    }

    console.log(path.join(aPost.publishingDir + '/index.html'));
  } catch (err) {
    console_warn("ERROR!");
    console.error(err);
  }
}

/**
 * For each unique tag, creates a page listing posts with said tag
 *
 * SAVE LOCATION: "$BLOG_DIR/tags/[unique_tag]"
 * @param posts Post[]
 */
function createTagPages(posts) {
  // get all unique tags
  var tags = posts.map((x) => x.tags); // posts -> tags conversion
  tags = [].concat(...tags);  // 2D to 1D array conversion
  tags = [...new Set(tags)];  // strip duplicates
  // remove undefined tags
  console.log(tags);


  nunjucks.configure('views', { autoescape: false });
  tags.forEach((tag) => {
    // render template
    var finalRender = nunjucks.render('tag.njk', { tagName: tag, posts: posts, blogPath: process.env.BLOG_DIR.toString() });
    // save to file
    try {
      // create dirs
      const tagDir = path.join(BLOG_DIR, '/tags/', tag);
      if (!fs.existsSync(tagDir)){
          fs.mkdirSync(tagDir, { recursive: true }, (err) => {
            if (err) throw err;
          })

      }
      const tagFilePath = path.join(tagDir + '/index.html');
      fs.writeFileSync(tagFilePath, finalRender);
      // file written successfully
      console.log("[createTagPages]: " + tag + " ---> " + path.dirname(tagFilePath));
    } catch (err) {
      console.error(err);
      // TODO: Handle error
    }
  });
}

/**
 * Creates the blog index (list of blog posts) from the given Posts
 *
 * SAVE LOCATION: "$BLOG_DIR/index.html"
 * @param postList Post[]
 */
function generateBlogIndexFromPosts(postList) {

  // Render Template
  nunjucks.configure('views', { autoescape: false });
  var finalRender = nunjucks.render('blog-index.njk', { posts: postList });
  console_debug('template applied');


  // save to final .html file
  try {
    fs.writeFileSync(path.join(BLOG_DIR, '/index.html'), finalRender);
    // file written successfully
    console_debug('HTML file written')
  } catch (err) {
    console_warn('failed to generate blog index!');
    console.error(err);
  }
  
}


/**
 * Parses the contents of a post's raw text to find JSON objects
 * @param fileContents raw text contents of a post
 * @param metaDataOnly return only JSON metadata without markdown contents
 * @returns {*} JSON contents as object + raw body as *.rawMarkdown
 */
function parseRawPostContents(fileContents, metaDataOnly = false) {

  var post; // what we will return


  if (metaDataOnly) { // EXTRACT only META-DATA FROM POST
    post = JSON.parse(fileContents.split('<!--# START POST #-->')[0]);

  } else { // EXTRACT META-DATA FROM POST and MARKDOWN
    var fileContentsBySection;
    fileContentsBySection = fileContents.split('<!--# START POST #-->');
    post = JSON.parse(fileContentsBySection[0])
    post.rawMarkdown = fileContentsBySection.slice(1).join('');  // cut off the first section and join the rest into one, this is the remaining section.
  }

  check_post_fields(post);  // send warnings if fields are missing

  return post;
}

/**
 * Check for missing fields in a post object
 * TODO: could be moved into an object function
 **/
function check_post_fields(post) {
  if (!post.title) {console_warn("MISSING title");}
  if (!post.subtitle) {console_warn("MISSING subtitle for " + post.title);}
  if (!post.desc) {console_warn("MISSING desc");}
  if (typeof post.published == 'undefined') {console_warn("MISSING published for " + post.title);}
  if (!post.datePosted) {console_warn("MISSING datePosted");}
}

function console_warn(argument) {
  console.warn("\x1b[33m" + argument + "\x1b[0m");
}

function console_debug(argument) {
  if (process.env.debug) {
    console.debug(argument);  
  }
}