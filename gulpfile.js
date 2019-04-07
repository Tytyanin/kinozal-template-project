'use strict';
const { task, series, parallel, src, dest, watch } = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const notify = require('gulp-notify');
const browserSync = require('browser-sync');
const csscomb = require('gulp-csscomb');

const path = {
    scssFolder: './assets/scss',
    scssFiles: './assets/scss/**/*.scss',
    lessFolder: './assets/less',
    lessFiles: './assets/less/**/*.less',
    cssFolder: './assets/css',
    cssFiles: './assets/css/**/*.css',
    htmlFiles: './index.html',
    imgFolder: './assets/img',
    jsFolder: './assets/js',
    jsFiles: './assets/js/**/*.js',
};

const plugins = [
    autoprefixer({ browsers: ['last 5 versions', '> 0.1%'], cascade: true }),
    mqpacker()
];

function comb () {
    return src(path.scssFiles)
        .pipe(csscomb('../../../.csscomb.json')).on('error', notify.onError(function (error) {
            return 'File: ' + error.message;
        }))
        .pipe(dest(path.scssFolder))
        .on('end', () => console.log('   ---------------   Причесывание кода выполнено'))
}

function scss() {
    return src(path.scssFiles)
        .pipe(sass({ outputStyle: 'expanded' })
            .on('error', sass.logError))
        .pipe(postcss(plugins))
        .pipe(csscomb())
        .pipe(notify({ message: 'Успешно откомпилирован!', sound: false }))
        .pipe(dest(path.cssFolder)
            .on('end', () => console.log('   ---------------  Компиляция SCSS --> style.css')))
        .pipe(browserSync.reload({ stream: true }));
}

function scssDev() {
    return src(path.scssFiles)
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'expanded' })
            .on('error', sass.logError))
        .pipe(postcss(plugins))
        .pipe(sourcemaps.write())
        .pipe(notify({ message: 'Успешно откомпилирован!', sound: false }))
        .pipe(dest(path.cssFolder)
            .on('end', () => console.log('   ---------------  Компиляция SCSS --> style.css')))
        .pipe(browserSync.reload({ stream: true }));
}


function createStructure() {
    let file = [];
    let scssFiles = [];

    scssFiles[0] = path.scssFolder + '/style.scss';
    scssFiles[1] = path.scssFolder + '/_variables.scss';
    scssFiles[2] = path.scssFolder + '/_skin.scss';
    scssFiles[3] = path.scssFolder + '/_common.scss';
    scssFiles[4] = path.scssFolder + '/_footer.scss';
    scssFiles[5] = path.scssFolder + '/_header.scss';

    file[0] = path.htmlFiles;
    file[1] = path.cssFolder + '/style.css';
    file[2] = path.jsFolder + '/main.js';
    file[3] = scssFiles;

    src('*.*', { read: false })
        .pipe(dest(path.scssFolder))
        .pipe(dest(path.cssFolder))
        .pipe(dest(path.jsFolder))
        .pipe(dest(path.imgFolder));

    return new Promise(resolve => setTimeout(() => {
        for (let i = 0; i < file.length; i++) {
            if (!Array.isArray(file[i])) {
                require('fs').writeFileSync(file[i], '');
                console.log(file[i]);
            } else {
                for (let j = 0; j < file[i].length; j++) {
                    require('fs').writeFileSync(file[i][j], '');
                    console.log(file[i][j]);
                }
            }
        }

        resolve(true);
    }, 1000));
}

async function sync() {
    browserSync.reload();
}

function syncInit () {
    browserSync({
        server: {
            baseDir: './'
        },
        notify: false
    });
}

function watchFiles() {
    syncInit();
    watch(path.scssFiles, series(scss));
    watch(path.lessFiles, sync);
    watch(path.jsFiles, sync);
    watch(path.cssFiles, sync);
    watch(path.htmlFiles, sync);
}

task('cs', createStructure);
task('scss', scss);
task('combScss', comb);
task('devMap', scssDev);
task('watch', watchFiles);