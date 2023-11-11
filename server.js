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


// markdown-it Config
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



// // careful, readfile() is synchronous!
// fs.readFile('./tmp/post.md', 'utf8', (err, file_data) => {
//   if (err) {
//     console.error(err);
//     return;
//   }

//     const post = {};

//     post.title = "Dynamic DNS";
//     post.desc = "Dynamic DNS to resolve the server IP reliably from outside the network";
//     post.published = true;
//     post.dateEdited = Date.now();
//     post.datePosted = Date.now();
//     post.tags = ["tag1", "tag2"];
//     // console.log(post);



//     // EXTRACT META-DATA FROM POST
//     var splitFileData = file_data.split('<!--# START POST #-->');
//     var extractedPostMetadata = JSON.parse(splitFileData[0]);
//     console.debug('metadata extracted');

//     // Extract Markdown
//     var postHTMLBody = md.render(splitFileData.slice(1).join('')); // slice off metadata section, join all remaining sections
//     console.debug('markdown extracted');

//     // apply input to template
//     nunjucks.configure('views', { autoescape: true });
//     var finalRender = nunjucks.render('post.njk', { post: extractedPostMetadata });
//     console.debug('template applied');


//     // save to final .html file
//     // TODO...
//     fs.writeFile('./tmp/out.html', finalRender, err => {
//     if (err) {
//       console.error(err);
//     }
//     // file written successfully
//     console.debug('HTML file written')
//     });



// });
generatePostFromMd('./tmp/post.md', './tmp/out.html');


function generatePostFromMd(filePathIn, filePathOut) {

    fs.readFile(filePathIn, 'utf8', (err, file_data) => {
        if (err) {
            console.error(err);
            return;
        }
        // EXTRACT META-DATA FROM POST
        var splitFileData = file_data.split('<!--# START POST #-->');
        var extractedPostMetadata = JSON.parse(splitFileData[0]);
        console.debug('metadata extracted');

        // Extract Markdown
        var postHTMLBody = md.render(splitFileData.slice(1).join('')); // slice off metadata section, join all remaining sections
        console.debug('markdown extracted');

        // apply input to template
        nunjucks.configure('views', { autoescape: true });
        var finalRender = nunjucks.render('post.njk', { post: extractedPostMetadata });
        console.debug('template applied');


        // save to final .html file
        // TODO...
        fs.writeFile(filePathOut, finalRender, err => {
        if (err) {
          console.error(err);
        }
        // file written successfully
        console.debug('HTML file written')
        });
    });
}