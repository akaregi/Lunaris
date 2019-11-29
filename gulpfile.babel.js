import { src, dest, parallel } from 'gulp'

// Common
import fs from 'fs';
import path from 'path'

// Gulp
import data from 'gulp-data'
import rename from'gulp-rename'

// HTML
import pug from 'gulp-pug'

import MarkdownIt from 'markdown-it'
import markdown_it_div from 'markdown-it-div'
import markdown_it_def from 'markdown-it-deflist'

const markdown = new MarkdownIt({
        html: true,
        breaks: true,
        linkify: true,
        typographer: true
    })
    .use(markdown_it_div)
    .use(markdown_it_def)

const dir = path.normalize(__dirname + '/src/docs/')
const files = fs.readdirSync(dir)

export const hymms = done => {
    // Build hymmnos markdown
    files.forEach(file => {
        // Ignore _index.md
        if (file === "_index.md") {
            return;
        }

        // File name, EXEC_AR=LUSYE
        const fileName = file.replace('.md', '')

        // File path, src/docs/EXEC_AR=LUSYE.md
        const filePath = dir + file

        // Document name, e.g. "EXEC_AR=LUSYE/."
        const docName = fileName + '/.'

        // Document url, exec_ar_lusye
        const docUrl = fileName.replace('=', '_').toLowerCase()

        // Document path, e.g. hymm/exec_ar_lusye
        const docPath = 'hymm/' + docUrl

        src('src/views/template.pug')
            .pipe(rename(docUrl + '.html'))
            .pipe(data(() => {
                return {
                    base: "../",
                    url: docPath,
                    title: docName,
                    text: markdown.render(fs.readFileSync(filePath).toString())
                }
            }))
            .pipe(pug())
            .pipe(dest('dist/hymm/'))
    })

    done()
}

export const index = done => {
    // Build Index.html
    const filesMap = files
        .filter(file => file !== "_index.md")
        .map(file => file.replace('.md', ''))

    src('src/views/index.pug')
        .pipe(data(() => {
            return {
                base: "",
                url: "",
                files: filesMap,
                title: "Lunaris",
                text: markdown.render(fs.readFileSync(dir + "_index.md").toString())
            }
        }))
        .pipe(pug())
        .pipe(dest('dist/'))

    done()
}

export const build = parallel(index, hymms)
export default build
