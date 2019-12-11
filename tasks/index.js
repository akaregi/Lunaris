const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

const fm = require('front-matter')

const MarkdownIt = require('markdown-it')
const markdown = new MarkdownIt({ html: true, breaks: true, linkify: true, typographer: true })
    .use(require('markdown-it-div')).use(require('markdown-it-deflist'))

const template = require('pug').compileFile(path.resolve('src/views/index.pug'))

if (!fs.existsSync(path.resolve('dist'))) {
    mkdirp(path.resolve('dist'))
}

const page = fs.readFileSync(path.resolve('src/contents/index.md')).toString()
const data = fm(page)

const files = fs.readdirSync(path.resolve('src/contents/posts')).map(file => {
    const raw = file.replace('.md', '')

    const path = raw.replace(/=/g, '_').replace('/.', '').toLowerCase()
    const name = raw.search(/EXEC|METHOD|AR/) !== -1 ? raw + "/." : raw

    return  [path, name]
})

const result = template({
    body: markdown.render(data.body),
    attr: data.attributes,
    files: files,
    url: "",
    base: ""
})

fs.writeFileSync(path.resolve('dist/index.html'), result)
