#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var completionDir = '/etc/bash_completion.d/';
if (fs.existsSync(completionDir)) {
    try {
        fs.copyFileSync(path.join(__dirname, 'ttag'), path.join(completionDir, 'ttag'));
    }catch(e) {
        console.warn("Could not install bash completion, run install with --unsafe");
    }
} else {
    console.log("Platform does not have completion feature or " + completionDir);
}
