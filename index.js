"use strict";

const sidekickAnalyser = require("sidekick-analyser");
const fs = require('fs');
const path = require('path');

const stripJsonComments = require("strip-json-comments");

const Linter = require('tslint');

const configFileName = 'tslint.json';
const annotationDefaults = {analyserName: 'sidekick-tslint'};
const LOG_FILE = path.join(__dirname, '/debug.log');

//log to file as any stdout will be reported to the analyser runner
function logger(message) {
  fs.appendFile(LOG_FILE, message + '\n');
}

if(require.main === module) {
  execute();
}
module.exports = exports = execute;

function execute() {
  logger('before parse');
  sidekickAnalyser(function(setup) {
    var config;

    logger('after parse');

    var conf = (setup.configFiles || {})[configFileName];
    if(conf) {
      try {
        config = JSON.parse(stripJsonComments(conf));
      } catch(e) {
        // FIXME need some way of signalling
        console.error("can't parse config");
        console.error(e);
      }
    }

    if(!config) {
      config = {};
    }

    logger(JSON.stringify(config));

    var results = run(setup.content, config, setup.fileName);
    console.log(JSON.stringify({ meta: results }));
  });
}

module.exports._testRun = run;
function run(content, config, fileName) {
  try {
    var options = {
      formatter: "json",
      configuration: config
    };

    var tslint = new Linter(fileName, content, options);
    var errors = tslint.lint();
    return errors.failures.map(format);

  } catch (err) {
    console.error("failed to analyse");
    console.log({ error: err });
    process.exit(1);
  }
}

function format(error) {
  return {
    analyser: annotationDefaults.analyserName,
    location: {
      startLine: error.startPosition.lineAndCharacter.line,
      endLine: error.endPosition.lineAndCharacter.line,
      startCharacter: error.startPosition.lineAndCharacter.character,
      endCharacter: error.endPosition.lineAndCharacter.character,
    },
    message: error.failure,
    kind: error.ruleName,
  };
}
