'use strict';

const pluginName = 'gulp-tojst';
const Vinyl = require('vinyl');
const PluginError = require('plugin-error');
const through = require('through');
const assign = require('lodash.assign');
const template = require('lodash.template');

function pluginError(message) {
	return new PluginError(pluginName, message);
}

function getNamespace(namespace) {
	let currentPath = 'this';

	if (namespace !== 'this') {
		namespace
				.split('.')
				.forEach(function (part, index) {
					if (part !== 'this') {
						currentPath += '[' + JSON.stringify(part) + ']';
					}
				});
	}

	return currentPath;
}

const defaults = {
	amd: false,
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

module.exports = function tojst(fileName, settings) {
	if (!fileName) {
		pluginError('Missing fileName.');
	}

	const options = assign({}, defaults, settings || {});
	const files = [];
	let namespace = '';

	function compile(file) {
		const name = options.processName(file.path);
		let contents = template(file.contents.toString(),
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

	function write(file) {
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

	function end() {
		const compiled = files.map(compile);

		//if (!compiled.length) {
		//  this.emit('error', pluginError('Destination not written because compiled files were empty.'));
		//} else {
		if (options.amd) {
			if (options.prettify) {
				compiled.forEach(function (line, index) {
					compiled[index] = '  '.concat(line);
				});
			}
			compiled.unshift('define(function(){');
			if (!options.namespace) {
				compiled.push('  return '.concat(getNamespace(options.namespace), ';'));
			}
			compiled.push('});');
		}

		this.queue(new Vinyl({
			path: fileName,
			contents: Buffer.from(compiled.join(options.separator))
		}));
		//}

		this.queue(null);
	}

	return through(write, end);
}
