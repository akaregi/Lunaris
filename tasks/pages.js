const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

const fm = require('front-matter')

const MarkdownIt = require('markdown-it')
const markdown = new MarkdownIt({ html: true, breaks: true, linkify: true, typographer: true })
    .use(require('markdown-it-div')).use(require('markdown-it-deflist'))

const template = require('pug').compileFile(path.resolve('src/views/template.pug'))

if (!fs.existsSync(path.resolve('dist/hymmnos'))) {
    mkdirp(path.resolve('dist/hymmnos'))
}

const files = fs.readdirSync(path.resolve('src/contents/posts'))

for (const file of files) {
    const page = fs.readFileSync(path.resolve('src/contents/posts/' + file)).toString()
    const data = fm(page)

    const url = 'hymmnos/' + file.replace('.md', '').replace(/=/g, '_').toLowerCase()

    const result = template({
        body: markdown.render(data.body),
        attr: data.attributes,
        url: url,
        base: "../"
    })

    fs.writeFile(`dist/${url}.html`, result, err => {
        if (err) {
            console.error(err)
        }
    })
}
