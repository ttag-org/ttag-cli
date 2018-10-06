#!/usr/bin/env node
var fs = require('fs');
var { execSync } = require('child_process');

var readmePath = 'README.md'
var BEGINTAG = '<!--- BEGIN COMMANDS --->'
var ENDTAG = '<!--- END COMMANDS --->'

var autodoc = execSync('./bin/ttag doc').toString();

var readMe = fs.readFileSync(readmePath);
var beginCommandsPos = readMe.indexOf(BEGINTAG) + BEGINTAG.length;
var endCommandsPos = readMe.indexOf(ENDTAG);
fs.writeFileSync(
    readmePath, (
        readMe.slice(0, beginCommandsPos) +
        '\n\n' +
        autodoc +
        readMe.slice(endCommandsPos)
    )
);
