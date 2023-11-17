import _ from 'lodash'

// File IO
import fs from 'fs';

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


// search for posts in staging directory
const stagingPath = 'staging/';
var stagedPosts = fs.readdirSync(stagingPath);  // filename of each staged post
for (var i = stagedPosts.length - 1; i >= 0; i--) {
  console.debug(stagedPosts[i]);
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
console.log('stagedPosts');
console.log(stagedPosts);

// for each staged post generate blog HTML, and take note of post tags
var allPostsWithTags = [];
var allPosts = [];
for (var i = stagedPosts.length - 1; i >= 0; i--) {
  const postStagedPath = stagingPath + stagedPosts[i];  // public/[staging]/*/*.md
  const postPublishedPath = stagedPosts[i].substring(0, stagedPosts[i].lastIndexOf("/")) + '/';  // public/[blog]/*/*.html --> ../[blog]/*/
  console.log("postPublishedPath");
  console.log(postPublishedPath);
  const ret = generatePostFromMd(postStagedPath, postPublishedPath);
  allPosts[i] = ret;  // TODO: probably only need one post array, should get rid of allPostsWithTags
  if ((ret !== 7) && (ret.tags)) { // if marked as published & has tags
    allPostsWithTags[i] = ret;
    // TODO, copy finished mds to public
    // ^TODO, compare modified dates of public vs staging md? Only build updated ones? Ask before overwrite?
  }

}

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

// generate tag pages (based off only the pages that have tags), TODO, use allPosts and Nunjucks.reject(page.tag === null)
generateTagPagesFromPageMetaData(allPostsWithTags);

// generate blog homepage (based off all pages [sorted by date])
generateBlogIndexFromPageMetaData(allPosts.sort((a,b) => b.datePosted - a.datePosted));


function generateTagPagesFromPageMetaData(pageMetaDataArray) {
  // gather unique tags...
  var uniqueTags = [];
  // generate tag pages for each post by using the returned meta, data
  for (var i = allPostsWithTags.length - 1; i >= 0; i--) {  // for each post
    const page = allPostsWithTags[i];
    for (var j = page.tags.length - 1; j >= 0; j--) {  // for each tag
      const tag = page.tags[j];
      if (!uniqueTags.includes(tag)) {uniqueTags.push(tag)}
    }
  }

  console.debug('unique tags: ' + uniqueTags)


  // for each tag, build a page
  nunjucks.configure('views', { autoescape: false });
  for (var i = uniqueTags.length - 1; i >= 0; i--) {
    const uniqueTag = uniqueTags[i];
    var finalRender = nunjucks.render('tag.njk', { tagName: uniqueTag, posts: pageMetaDataArray, blogPath: process.env.BLOG_DIR.toString() });

    // save to final .html file
    try {
      // create dirs
      const tagDir = blogDir + 'tags/' + uniqueTag;
      if (!fs.existsSync(tagDir)){
          fs.mkdirSync(tagDir, { recursive: true }, (err) => {
            if (err) throw err;
          })

      }
      const tagFilePath = tagDir + '/index.html';
      fs.writeFileSync(tagFilePath, finalRender);
      // file written successfully
      console.log("GENERATING TAG: " + uniqueTag + " ---> " + tagFilePath);
    } catch (err) {
      console.error(err);
      // TODO: Handle error
    }
  }
}


// TODO: should be a single function for saving templates. generatePage(*.njk, templateVars[], filePath);
function generateBlogIndexFromPageMetaData(pageMetaDataArray) {
  console.log("generateBlogIndexFromPageMetaData:")
  console.log(pageMetaDataArray);

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
 * Writes an HTML post to file.
 * Uses nunjucks template "views/post.njk"
 *
 * @param filePathIn ex: "staging/my-blog-post/something.md"
 * @param postFolder ex: "my-blog-post/". This will output the file at PUBLIC_DIR/BLOG_DIR/my-blog-post/index.html
 * @returns {post|number} post object see createPostObjectFromFile()  |OR|  1 if read error
 */
function generatePostFromMd(filePathIn, postFolder) {

  // const post = {
  //   "title": "post title",
  //   "subtitle": "post subtitle",
  //   "desc": "SEO description",
  //   "published": false,
  //   "dateEdited": 0,
  //   "datePosted": 0,
  //   "tags": [tag1, tag2, ...]
  // }

  console.log("\nGENERATING POST: " + filePathIn + " ---> " + blogDir + postFolder);


  var fileContents;
  try {
    fileContents = fs.readFileSync(filePathIn, 'utf8');
    console.debug('file read');
  } catch (err) {
    console.error(err);
    return 1;
  }


  var post = createPostObjectFromFile(fileContents);
  console.debug('data extracted');
  if (post.published === false) {console.log('post not published, skipping'); return 7;}

  // apply input to template
  nunjucks.configure('views', { autoescape: false });
  var finalRender = nunjucks.render('post.njk', { post: post, body: md.render(post.rawMarkdown) });
  post.rawMarkdown = null;  // remove bloat
  console.debug('template applied');


  // save to final index.html file
  try {
    
    //mkdir
    fs.mkdirSync(blogDir + postFolder, { recursive: true }, (err) => {
      if (err) throw err;
    })

    fs.writeFileSync(blogDir + postFolder + 'index.html', finalRender);
    // file written successfully
    console.debug('HTML file written')

    // copy all other assets over
    // all items in filePathin, except the .md, should be copied over to postFolder
    console.log("filePathIn: "+ filePathIn);
    console.log("postFolder: "+ blogDir + postFolder);
    const directoryIn = filePathIn.substring(0, filePathIn.lastIndexOf("/")) + '/';
    var postAssets = fs.readdirSync(directoryIn).filter((asset) => !asset.endsWith('.md'));
    process.stdout.write('postAssets');
    console.log(postAssets);
    for (var i = postAssets.length - 1; i >= 0; i--) {
      postAssets[i];
      fs.copyFileSync(directoryIn + postAssets[i], blogDir + postFolder + postAssets[i]);
      console.log("copy: '" + directoryIn + postAssets[i] + "'' to '" + blogDir + postFolder + postAssets[i] + "'");
    }
    


  } catch (err) {
    console.error(err);
  }


  console.debug('Task generatePostFromMd finished: ' + new Date().toLocaleTimeString());
  post.body = null;
  post._path = "/" + process.env.BLOG_DIR + postFolder;  // destination path for the post
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





