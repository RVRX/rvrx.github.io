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


const blogDir = process.env.PUBLIC_DIR + process.env.BLOG_DIR;
const PUBLIC_DIR = process.env.PUBLIC_DIR;
const BLOG_DIR = path.join(PUBLIC_DIR, process.env.BLOG_DIR);

// Post class definition
class Post {
  constructor(postPath) {
    this.postPath = path.resolve(postPath);
    this.containingDir = path.dirname(this.postPath);
    const foobar = createPostObjectFromFile(this.getFileContents(postPath), true);
    Object.assign(this, foobar);
  }


  //getter
  get bodyMD() {
    var fileContentsBySection;
    fileContentsBySection = this.getFileContents(this.postPath).split('<!--# START POST #-->');
    return fileContentsBySection.slice(1).join('');
  }

  //getter
  get bodyHTML() {
    // apply Nunjucks template to markdown
    nunjucks.configure('views', { autoescape: false });
    var finalRender = nunjucks.render('post.njk', { post: this, body: md.render(this.bodyMD) });
    // console.debug('bodyHTML generated');
    return finalRender;
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

  //getter
  get _path() {
    return path.join(this.parentDir);
  }

  //method
  getFileContents(filePathIn) {
    var fileContents;
    try {
      fileContents = fs.readFileSync(filePathIn, 'utf8');
      return fileContents;
    } catch (err) {
      console.error(err);
      return -1;
    }
  }
}




// search for posts in staging directory
const stagingPath = 'staging/';
var stagedPosts = fs.readdirSync(stagingPath);  // filename of each staged post
// var stagedPosts = fs.readdirSync(stagingPath, { withFileTypes: true });  // filename of each staged post
for (var i = stagedPosts.length - 1; i >= 0; i--) {
  var aPostAndItsAssets = fs.readdirSync(stagingPath + stagedPosts[i]);
  // get md name
  const isMarkdownFile = (element) => element.endsWith(".md");
  var markdownFileIndex = aPostAndItsAssets.findIndex(isMarkdownFile);
  if (markdownFileIndex === -1) {
    console.error('Markdown file not found in staging directory, skipping');
    console_warn('Markdown file not found in staging directory, skipping');
    exit(1);
  }
  stagedPosts[i] = stagedPosts[i] + '/' + aPostAndItsAssets[markdownFileIndex];
}
console.log('stagedPosts:');
console.log(stagedPosts);



// convert to actual posts
stagedPosts = stagedPosts.map((x) => new Post('staging/' + x))
// console.log(stagedPosts);


// publish all posts
stagedPosts.forEach((post) => publishPost(post));

// create tag pages
createTagPages();

/**
 * Copies post and its 'assets' to the out directory
 **/
function publishPost(aPost) {

  process.stdout.write('GENERATING POST: ' + aPost.title + ' ... ');

  try {

    // create this post's publishing directory if it doesnt exist
    fs.mkdirSync(aPost.publishingDir, { recursive: true }, (err) => {
      if (err) throw err;
    })

    // create index.html
    fs.writeFileSync(path.join(aPost.publishingDir + '/index.html'), aPost.bodyHTML);

    // copy all other assets over
    // all items in filePathin, except the .md, should be copied over to postFolder
    // console.log("filePathIn: "+ filePathIn);
    // console.log("postFolder: "+ aPost.publishingDir);
    // const directoryIn = filePathIn.substring(0, filePathIn.lastIndexOf("/")) + '/';
    var postAssets = fs.readdirSync(aPost.containingDir).filter((asset) => !asset.endsWith('.md'));
    postAssets = postAssets.map((x) => '/' + x); // add forward slash to start
    // console.log(postAssets);
    for (var i = postAssets.length - 1; i >= 0; i--) {
      postAssets[i];
      fs.copyFileSync(path.join(aPost.containingDir + postAssets[i]), aPost.publishingDir + postAssets[i]);
      // console.log("copy: '" + aPost.containingDir + postAssets[i] + "' to '" + aPost.publishingDir + postAssets[i] + "'");
    }

    console.log("DONE!")
  } catch (err) {
    console_warn("ERROR!");
    console.error(err);
  }
}

/**
 * create tag-pages
 **/
function createTagPages() {
  // get all unique tags
  var tags = stagedPosts.map((x) => x.tags); // posts -> tags conversion
  tags = [].concat(...tags);  // 2D to 1D array conversion
  tags = [...new Set(tags)];  // strip duplicates
  console.log(tags);


  nunjucks.configure('views', { autoescape: false });
  tags.forEach((tag) => {
    // render template
    var finalRender = nunjucks.render('tag.njk', { tagName: tag, posts: stagedPosts, blogPath: process.env.BLOG_DIR.toString() });
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
      console.log("GENERATING TAG: " + tag + " ---> " + tagFilePath);
    } catch (err) {
      console.error(err);
      // TODO: Handle error
    }
  });

  // for each tag, build a page
  // nunjucks.configure('views', { autoescape: false });
  // for (var i = tags.length - 1; i >= 0; i--) {
  //   const uniqueTag = tags[i];
  //   var finalRender = nunjucks.render('tag.njk', { tagName: uniqueTag, posts: pageMetaDataArray, blogPath: process.env.BLOG_DIR.toString() });

  //   // save to final .html file
  //   try {
  //     // create dirs
  //     const tagDir = blogDir + 'tags/' + uniqueTag;
  //     if (!fs.existsSync(tagDir)){
  //         fs.mkdirSync(tagDir, { recursive: true }, (err) => {
  //           if (err) throw err;
  //         })

  //     }
  //     const tagFilePath = tagDir + '/index.html';
  //     fs.writeFileSync(tagFilePath, finalRender);
  //     // file written successfully
  //     console.log("GENERATING TAG: " + uniqueTag + " ---> " + tagFilePath);
  //   } catch (err) {
  //     console.error(err);
  //     // TODO: Handle error
  //   }
  // }
}




/**
 * Generate Blog Homepage
 **/
generateBlogIndexFromPageMetaData(stagedPosts.sort((a,b) => b.datePosted - a.datePosted));


// potential future main thread
/*
 * for each item in "staging/" {
 *   post = createPostObjectFromFile2();
 *   writePost(post);
 * } posts[];
 *
 *  writeTagPages(posts[])
 *  writeBlogIndex(posts[])
 *
 */

function generateBlogIndexFromPageMetaData(pageMetaDataArray) {
  console.log("generateBlogIndexFromPageMetaData:")
  // console.log(pageMetaDataArray);

  // for each post
  // fill template
  // apply input to template
  nunjucks.configure('views', { autoescape: false });
  var finalRender = nunjucks.render('blog-index.njk', { posts: pageMetaDataArray });
  console.debug('template applied');


  // save to final .html file
  try {
    fs.writeFileSync(blogDir + 'index.html', finalRender);
    // file written successfully
    console.debug('HTML file written')
  } catch (err) {
    console.error(err);
  }
  
}


/**
 * Creates a 'post' object from an input file contents
 * @param fileContents :string - of a file as string
 * @param metaDataOnly :boolean - true will remove post.rawMarkdown property
 * @returns {post}:
 *      "title": "post title" (string),
 *      "subtitle": "post subtitle" (string),
 *      "desc": "SEO description" (string),
 *      "published": ready for publication? (boolean),
 *      "dateEdited": dateEdited (Date object), [OPTIONAL]
 *      "datePosted": dateEdited (Date object)
 *      "tags": [tag1, tag2, ...]
 * NO Guarantees are made on the correctness or existence of any fields!
 * Values will be checked and warnings will be printed if absent, but that is all.
 */
function createPostObjectFromFile(fileContents, metaDataOnly = false) {

  var post; // what we will return


  if (metaDataOnly) { // EXTRACT only META-DATA FROM POST
    post = JSON.parse(fileContents.split('<!--# START POST #-->')[0]);

  } else { // EXTRACT META-DATA FROM POST and MARKDOWN
    var fileContentsBySection;
    fileContentsBySection = fileContents.split('<!--# START POST #-->');
    post = JSON.parse(fileContentsBySection[0])
    post.rawMarkdown = fileContentsBySection.slice(1).join('');  // cut off the first section and join the rest into one, this is the remaining section.
  }

  // convert post date string into Date object
  post.datePosted = new Date(post.datePosted);
  // if there is an edited date, convert it as well
  if (post.dateEdited) {
    post.dateEdited = new Date(post.dateEdited);
  }

  // define shorter plaintext date in format: "Mon #"
  post._short_date = post.datePosted.toLocaleString('default', {month: 'short', year: 'numeric'});


  check_post_fields(post);  // send warnings if fields are missing

  return post;
}

/**
 * Check for missing fields in a post object
 * TODO: could be moved into an object function
 **/
function check_post_fields(post) {
  if (!post.title) {console_warn("MISSING title");}
  if (!post.subtitle) {console_warn("MISSING subtitle");}
  if (!post.desc) {console_warn("MISSING desc");}
  if (!post.published) {console_warn("MISSING published");}
  // if (!post.dateEdited) {console_warn("MISSING dateEdited");}
  if (!post.datePosted) {console_warn("MISSING datePosted");}
  if (!post.tags) {console_warn("MISSING tags");}
}

function console_warn(argument) {
  console.warn("\x1b[33m" + argument + "\x1b[0m");
}





