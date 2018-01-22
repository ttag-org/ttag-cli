#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var completionDir = '/etc/bash_completion.d/';
if (fs.existsSync(completionDir)) {
    try {
        fs.copyFileSync(path.join(__dirname, 'c-3po'), path.join(completionDir, 'c-3po'));
    }catch(e) {
        console.warn("Could not install bash completion, run install with --unsafe");
    }
} else {
    console.log("Platform does not have completion feature or " + completionDir);
}
