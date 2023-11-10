# Build Process
Type up markdown file on wiki.js, copy generated html for just the blog post, and insert into the `post.html` template.


# Rethinking Build Process
Current build process is maybe worse than the old Python build process. I kinda forget why I decided to move off that... I think there was a failed Jekyll setup in between...

Lessons from last build process
1. Github Actions is messy for this use-case, just don't use it
2. Python setup got messy, but it still could prove clean if well thought out beforehand...


Ideally I keep the current layout, I just create a translator. Biggest change from last builder would be the usage of PrismJS for codeblocks

Maybe take a look at what Wiki.JS uses? (markdown-it). I like its use of a table at the top with tags and other meta-data Ehhh... I don't reeeealy want to use npm/node whatever. Something more universally installed like Python iiiiis nicer. Oh, there is a markdown-it port for python!: [executablebooks/markdown-it-py](https://github.com/executablebooks/markdown-it-py)

WikiJS
1. `markdown-it` with many plugins: https://github.com/requarks/wiki/blob/fd91caff1da1683473fc3b65ecab84a41f4ebb8a/client/components/editor/editor-markdown.vue#L199
2. `PrismJS`
3. npm `mermaid` for markdown charts


yeahhhh... but the python port of markdown-it doesn't seem super maintained these days... Not sure how well it handles python3... plugin support is minimal...

