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


// TODO, read in from file, maybe use templating engine with like {{}} type guys.
const pretext = '<link href="/sidebar.css" rel="stylesheet"><link href="/post.css" rel="stylesheet"><link href="/prismjs/prism.css" rel="stylesheet">\n'


// careful, readfile() is synchronous!
fs.readFile('./blog/unraid-smb-on-linux/index.md', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  // console.log(data);
  md_to_html(data)
});


function md_to_html(argument) {
    var html_output = md.render(argument);
    html_output = pretext + html_output

    // write file
    fs.writeFile('./tmp/out.html', html_output, err => {
    if (err) {
      console.error(err);
    }
    // file written successfully
    });
}
