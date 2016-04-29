'use strict';

var pluginName = 'gulp-tojst';
var gulpUtil = require('gulp-util');
var through = require('through');
var assign = require('lodash.assign');
var template = require('lodash.template');

function pluginError (message) {
  return new gulpUtil.PluginError(pluginName, message)
}

function getNamespace (namespace) {
  var output = [];
  var currentPath = 'this';

  if (namespace !== 'this') {
    namespace
      .split('.')
      .forEach(function(part, index) {
        if (part !== 'this') {
          currentPath += '[' + JSON.stringify(part) + ']';
          output.push(currentPath + ' = ' + currentPath + ' || {};');
        }
      });
  }

  return currentPath;
}

var defaults = {
  amd: true,
  prettify: false,
  namespace: 'JST',
  processName: function (fileName) {
    return fileName;
  },
  processContent: function (source) {
    return source;
  },
  separator: '\n',
  templateSettings: {}
};

module.exports = function tojst (fileName, settings) {
  if (!fileName) {
    pluginError('Missing fileName.');
  }

  var options = assign({}, defaults, settings || {});
  var files = [];
  var namespace = '';

  function compile (file) {
    var name = options.processName(file.path);
    var contents = template(file.contents.toString(),
      options.templateSettings).source;

    if (options.prettify) {
      contents = contents.replace(/\n/g, '');
    }

    if (options.amd && !options.namespace) {
      return 'return '.concat(contents);
    }

    if (options.namespace) {
      namespace = getNamespace(options.namespace);
    }

    return namespace.concat('[', JSON.stringify(name),
      '] = ', contents, ';');
  }

  function write (file) {
    if (file.isNull()) {
      return;
    }
    if (file.isStream()) {
      return this.emit('error', pluginError('Streaming is not supporting.'));
    }

    if (file.isBuffer()) {
      files.push(file);
    }
  }

  function end () {
    var compiled = files.map(compile);

    if (options.amd) {

      if (options.prettify) {
        compiled.forEach(function(line, index) {
          compiled[index] = '  '.concat(line);
        });
      }

      compiled.unshift('define(function(){\nthis["JST"] = this["JST"] || {};');
          if (!options.namespace) {
            compiled.push('  return '.concat(getNamespace(options.namespace), ';'));
          }
          compiled.push('  \nreturn this["JST"];});');
        }

    this.queue(new gulpUtil.File({
      path: fileName,
      contents: new Buffer(compiled.join(options.separator))
    }));

    this.queue(null);
  }

  return through(write, end);
}
