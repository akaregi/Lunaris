/**
 * Builds HTML pages = require(Markdown source.
 */

const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

const p = require('pug')

const MarkdownIt = require('markdown-it')
const markdown_it_div = require('markdown-it-div')
const markdown_it_def = require('markdown-it-deflist')

const markdown = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true
})
    .use(markdown_it_div)
    .use(markdown_it_def)

const indexTmpl = p.compileFile('src/views/index.pug')
const hymmnosTmpl = p.compileFile('src/views/template.pug')

const files = fs.readdirSync(path.normalize('src/contents/posts'))

// Individual pages
if (!fs.existsSync('dist')) {
    mkdirp('dist')
}

const result = indexTmpl({
    base: "",
    url: "",
    files: files.map(file => file.replace('.md', '')),
    title: "Lunaris",
    text: markdown.render(fs.readFileSync("src/contents/index.md").toString())
})

fs.writeFileSync("dist/index.html", result)

// Hymmnos pages
if (!fs.existsSync('dist/hymmnos')) {
    mkdirp('dist/hymmnos')
}

for (const file of files) {
    // File's path.
    // e.g. src/docs/EXEC_AR=LUSYE.md
    const filePath = 'src/contents/posts/' + file

    // File's name.
    // e.g. EXEC_AR=LUSYE
    const fileName = file.replace('.md', '')

    // Document's name.
    // e.g. EXEC_AR=LUSYE/.
    const docName = fileName + '/.'

    // Document's URL.
    // e.g. hymmnos/exec_ar_lusye
    const docUrl = 'hymmnos/' + fileName.replace('=', '_').toLowerCase()

    const result = hymmnosTmpl({
        base: "../",
        url: docUrl,
        title: docName,
        text: markdown.render(fs.readFileSync(filePath).toString())
    })

    fs.writeFile(`dist/${docUrl}.html`, result, err => {
        if (err) {
            console.error(err)
        }
    })
}
