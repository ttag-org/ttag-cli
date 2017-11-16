import * as babel from "babel-core";
import "../declarations";
import * as fs from "fs";
import * as walk from "walk";
import * as path from "path";

function extractFile(filepath: string, babelOpts: babel.TransformOptions) {
    babel
    .transformFileSync(filepath, babelOpts);
}

function extractDir(dirpath: string, babelOpts: babel.TransformOptions) {
    const walker = walk.walk(dirpath);
    walker.on("file", (root: string, fileState: any, next: any) => {
        extractFile(path.join(root, fileState.name), babelOpts);
        next();
    });
}

function extract(output: string, paths: string[]): void {
    console.log(`[c-3po] started extraction from ${paths} to ${output} ...`);
    const babelOptions = {
        plugins: [["c-3po", { extract: { output } }]]
    };

    paths.forEach(filePath => {
        if (fs.lstatSync(filePath).isDirectory()) {
            extractDir(filePath, babelOptions);
        } else {
            extractFile(filePath, babelOptions);
        }
    });

    console.log(`[c-3po] has successfully extracted translations to ${output}`);
}

export default extract;
