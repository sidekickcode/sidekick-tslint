"use strict";

var stdin = require("easy-stdin");

module.exports = exports = run;

exports._parse = parse;

function run(cb) {
  stdin(function(err, input) {
    if(err) return fail(err);

    try {
      var parsed = parse(input);
    } catch(e) {
      return fail(e);
    }
    cb(parsed);
  });
}

function parse(input) {
  var forAnalyser = {};

  var body = input;

  // the per analyser and per file headers
  var lines = 2;
  while(lines--) {
    var section = parseHeaderSection(body);
    for(var p in section.config) {
      forAnalyser[p] = section.config[p];
    }
    body = section.body;
  }

  forAnalyser.content = body;

  return forAnalyser;
}

function parseHeaderSection(input) {
  var split = input.indexOf("\n");
  if(split === -1) {
    throw Error("Input too short to have header");
  }

  var header = input.substr(0, split);

  try {
    var result = JSON.parse(header);
  } catch(e) {
    throw Error("Couldn't parse header as JSON: '" + header + "': " + e.stack);
  }

  return {
    body: input.substr(split + 1),
    config: result,
  };
}

function fail(err) {
  process.stdout.write(JSON.stringify({ error: err }), "utf8", function() {
    process.exit(1);
  });
}
