var assert = require('chai').assert;
var expect = require('chai').expect;

var sts = require('../../sidekick-tslint');

var fs = require('fs');
var exec = require("child_process").exec;
var path = require('path');

describe('tslint analyser', function() {

  describe('config', function() {

    var self = this;

    before(function() {
      var configPath = path.join(__dirname, "/../config.json");
      var content = fs.readFileSync(configPath, { encoding: "utf8" });
      self.config = JSON.parse(content);
    });

    function createInput() {
      var filePath = path.join(__dirname, '/fixtures/fixture.ts');
      var fileContent = fs.readFileSync(filePath, { encoding: "utf8" });
      var configFileObj = JSON.parse(fs.readFileSync(__dirname + "/fixtures/tslint.json", {encoding: "utf8"}));

      return JSON.stringify(self.config) + "\n"
          + JSON.stringify({path: __dirname, filePath: 'fixture.ts', configFiles: {'tslint.json' : configFileObj}}) + "\n"
          + fileContent;
    }

    it('config exists for analyser', function() {
      assert.isObject(self.config, 'analyser config is an object');
    });

    it('can run analyser from cli', function(done) {
      runFixture(createInput(),
        function(err, stdout) {
          if(err) return done(err);
          self.stdout = stdout;
          done();
        });
    });

    it('executes run', function(done) {
      var filePath = path.join(__dirname, '/fixtures/fixture.ts');
      var content = fs.readFileSync(filePath, { encoding: "utf8" });

      filePath = path.join(__dirname, '/fixtures/tslint.json');
      var tsConfigObj = JSON.parse(fs.readFileSync(filePath, { encoding: "utf8" }));

      var results = sts._testRun(content, tsConfigObj, 'fixture.ts');
      expect(results.length).to.equal(23);
      done();
    });

    function runFixture(input, cb) {
      var cmd = `node ${path.join(__dirname, '../index.js')} --debug=58335`;
      var child = exec(cmd, cb);
      child.stdin.end(input);
    }
  });
});
