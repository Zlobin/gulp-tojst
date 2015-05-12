/*global describe, it*/
'use strict';

require('mocha');

var should = require('should');
var tojst = require('../index');

describe('toJst', function () {
  function write (onData, files, settings) {
    files = files || [];
    settings = settings || {};

    var stream = tojst('jst.js', settings);

    stream.on('data', onData);
    files.forEach(stream.write);
    stream.end();
  }

  it('It should return a file with name "jst.js"', function (done) {
    write(function (file) {
      file.path.should.equal('jst.js');
      file.contents.should.be.ok;
      done();
    })
  });
});
