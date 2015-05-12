# gulp-tojst [![Build Status](https://travis-ci.org/tambourinecoder/gulp-tojst-concat.png?branch=master)](https://travis-ci.org/tambourinecoder/gulp-tojst)
> A [gulp](http://gulpjs.com/) plugin to compile
[underscore](http://underscorejs.org/#template) / [lodash](http://lodash.com/docs#template)
 into a single file.

Based on the same Grunt plugin https://github.com/gruntjs/grunt-contrib-jst

## Install
Install using [npm](https://npmjs.org/package/gulp-tojst).

    $ npm install gulp-tojst

## Usage
```javascript
var tojst = require('gulp-tojst');

gulp.task('jst', function () {
  gulp.src('templates/**/*.html')
    .pipe(tojst('jst.js', {
      namespace: 'MY.NAME.SPACE',
      separator: '\n',
      prettify: true,
      templateSettings: {
        interpolate: /\{\{(.+?)\}\}/g
      }
    }))
    .pipe(gulp.dest('build/templates'))
})
```

## Options

amd
----------
Type: `boolean`
Default: `false`

Wraps the output file with an AMD define function and returns the compiled template namespace unless namespace has
been explicitly set to false in which case the template function will be returned directly.

prettify
----------
Type: `boolean`
Default: `false`

When doing a quick once-over of your compiled template file, it's nice to see an easy-to-read format that has one
line per template. This will accomplish that.

namespace
----------
Type: `string`
Default: `JST`

The namespace in which the precompiled templates will be assigned. Use dot notation (e.g. App.Templates) for nested
namespaces or false for no namespace wrapping. When false with amd option set true, templates will be returned
directly from the AMD wrapper.

processName
----------
Type: `function`

This option accepts a function which takes one argument (the template filepath) and returns a string which will
be used as the key for the precompiled template object. The example below stores all templates on the default
JST namespace in capital letters.

processContent
----------
Type: `function`

This option accepts a function which takes one argument (the file content) and returns a string which will be used
 as template string. The example below strips whitespace characters from the beginning and the end of each line.

separator
----------
Type: `string`
Default: `\n`

Concatenated files will be joined on this string.

templateSettings
----------
Type: `object`
Default: `{}`

The settings passed to underscore when compiling templates. Accepts the same _.templateSettings options
as the underscore\lodash library.

## License
MIT
