import _ from 'lodash'

// File IO
import fs  from 'fs';


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
import katex from 'katex'
import underline from 'markdown-it-underline'
import 'katex/dist/contrib/mhchem.js' // TODO: added .js, as node wasn't finding it otherwise?
import twemoji from 'twemoji'
import plantuml from 'plantuml' // TODO: was from './markdown/plantuml'

//Nunjucks (Template Engine)
import nunjucks from 'nunjucks'

// Mermaid
import mermaid from 'mermaid'


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
      return `<pre class="line-numbers"><code class="language-${lang}">${_.escape(str)}</code></pre>`
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


// Prism (Syntax Highlighting)
import Prism from 'prismjs'

generatePostFromMd('public/tmp/post.md', 'public/tmp/out.html');


/**
 * Generates a blog post page from a markdown file.
 * The MD file must begin with a JSON listing of the post's meta-data
 **/
function generatePostFromMd(filePathIn, filePathOut) {

  // const post = {
  //   "title": "post title",
  //   "subtitle": "post subtitle",
  //   "desc": "SEO description",
  //   "published": false,
  //   "dateEdited": 0,
  //   "datePosted": 0,
  //   "tags": [tag1, tag2, ...]
  // }

    fs.readFile(filePathIn, 'utf8', (err, file_data) => {
        if (err) {
            console.error(err);
            return;
        }
        // EXTRACT META-DATA FROM POST
        var splitFileData = file_data.split('<!--# START POST #-->');
        var post = JSON.parse(splitFileData[0]);
        check_post_fields(post, filePathIn);  // send warnings if fields are missing
        console.debug('metadata extracted');

        // Extract Markdown
        var postHTMLBody = md.render(splitFileData.slice(1).join('')); // slice off metadata section, join all remaining sections
        post.body = postHTMLBody;
        console.debug('markdown extracted');

        // apply input to template
        nunjucks.configure('views', { autoescape: false });
        var finalRender = nunjucks.render('post.njk', { post: post });
        console.debug('template applied');


        // save to final .html file
        fs.writeFile(filePathOut, finalRender, err => {
        if (err) {
          // TODO, handle this error somehow. Error counter?
          console.error(err);
        }
        // file written successfully
        console.debug('HTML file written')


        console.log('Task generatePostFromMd finished: ' + new Date().toLocaleTimeString());
        });
    });
}


/**
 * Check for missing fields in a post object
 * TODO: could be moved into an object function
 **/
function check_post_fields(post, filePathIn) {
  if (!post.title) {console_warn("MISSING title (" + filePathIn + ")");}
  if (!post.subtitle) {console_warn("MISSING subtitle (" + filePathIn + ")");}
  if (!post.desc) {console_warn("MISSING desc (" + filePathIn + ")");}
  if (!post.published) {console_warn("MISSING published (" + filePathIn + ")");}
  // if (!post.dateEdited) {console_warn("MISSING dateEdited (" + filePathIn + ")");}
  if (!post.datePosted) {console_warn("MISSING datePosted (" + filePathIn + ")");}
  if (!post.tags) {console_warn("MISSING tags (" + filePathIn + ")");}


}

function console_warn(argument) {
  console.warn("\x1b[33m" + argument + "\x1b[0m");
}




