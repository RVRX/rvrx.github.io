# RVRX.dev Website
Markdown to HTML website suite for my primary domain and its blog.

Dependencies: NodeJS (& NPM).
After cloning, run `npm install` in root repository folder. Run `npm start` to build new changes.

## Project Structure
- `public/` is the directory that should be served to the web
- New markdown posts should be placed into `staging/`
- `views/` contains Nunjucks templates
- `server.js` is the main NodeJS script that builds the site

## Writing new blog posts
New blog post files are to be written in markdown and placed into the `staging/` folder at the root of this repo. Running `npm start` will convert these files to markdown, and place them into the `public/blog/`  directory.


## Dev-notes
For a while I was using my personal WikiJS wiki to write my blogs, then copy and paste bits and pieces of the HTML that would generate into a rough template of what a 'blog post' looked like on my website. Therefore, to try and keep the process somewhat similar a lot of the tech stack was lifted straight from WikiJS' dependencies. The markdown-it configuration and plugins are lifted wholesale (yes, with much unneeded and improperly setup bloat for my use-case) from WikiJS' use. NodeJS was used for the same reason. I use Prism differently than how WikiJS did as I'm carrying it over from the old blog implementation, and didn't want to break it just yet. I personally chose Nunjucks for the template engine, as it makes the process of showing the built markdown into a post a tad easier.


### Useful Links for Dev
https://mozilla.github.io/nunjucks/templating.html
https://nodejs.org/en/learn/manipulating-files/working-with-folders-in-nodejs
https://markdown-it.github.io/markdown-it/

