#!/usr/bin/env node
var fs = require('fs');
var { execSync } = require('child_process');

var readmePath = 'README.md'
var autodoc = execSync('c-3po doc').toString();

var readMe = fs.readFileSync(readmePath);
var beginCommandsPos = readMe.indexOf('<!--- BEGIN COMMANDS --->');
var endCommandsPos = readMe.indexOf('<!--- END COMMANDS --->');
fs.writeFileSync(readmePath, readMe.slice(0, beginCommandsPos) + autodoc + readMe.slice(endCommandsPos));
