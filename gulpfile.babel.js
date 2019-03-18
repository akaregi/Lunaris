const gulp = require('gulp')

// Common
const fs = require('fs');
const path = require('path')

// Gulp
const data = require('gulp-data')
const rename = require('gulp-rename')

// HTML
const pug = require('gulp-pug')
const markdown = require('markdown-it')({
        html: true,
        breaks: true,
        linkify: true,
        typographer: true
    })
    .use(require('markdown-it-div'))
    .use(require('markdown-it-deflist'))

// CSS
const sass = require('gulp-sass')

const postcss = require('gulp-postcss')
const cssnano = require('cssnano')
const importer = require('postcss-import')
const autoprefixer = require('autoprefixer')

// JavaScript
const babel = require('gulp-babel')

gulp.task('html', done => {
    const dir = path.normalize(__dirname + '/src/docs/')
    const files = fs.readdirSync(dir)

    // Build hymmnos markdown
    files.forEach(file => {
        // Ignore _index.md
        if (file === "_index.md") {
            return;
        }

        console.time(file.padEnd(36))

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

        gulp.src('src/views/template.pug')
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
            .pipe(gulp.dest('dist/hymm/'))

        console.timeEnd(file.padEnd(36))
    });

    // Build Index.html
    const filesMap = files
        .filter(file => file !== "_index.md")
        .map(file => file.replace('.md', ''))

    gulp.src('src/views/index.pug')
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
        .pipe(gulp.dest('dist/'))

    done()
})

gulp.task('pug', gulp.parallel('html'))

gulp.task('css', done => {
    gulp.src('src/scss/*.scss')
        .pipe(sass())

        .pipe(postcss([
            importer(),
            autoprefixer(),
            cssnano()
        ]))

        .pipe(gulp.dest('dist/css/'))

    done()
})

gulp.task('js', done => {
    gulp.src('src/js/app.js')
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(gulp.dest('dist/js'))

    done()
})

gulp.task('image', done => {
    gulp.src('src/images/*.*')
        .pipe(gulp.dest('dist/images/'))

    // gulp.src('src/icons/*.*')
    //     .pipe(gulp.dest('dist/icons/'))

    done()
})

gulp.task('misc', done => {
    gulp.src('src/manifest.json')
        .pipe(gulp.dest('dist/'))

    done()
})

gulp.task('build', gulp.parallel('html', 'css', 'js', 'image', 'misc'))
