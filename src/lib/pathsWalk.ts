import * as walk from "walk";
import * as path from "path";
import * as c3poTypes from "../types";
import * as fs from "fs";

export type TransformFn = (filepath: string) => void;

function walkFile(
    filepath: string,
    progress: c3poTypes.Progress,
    transformFn: TransformFn
) {
    const extname = path.extname(filepath);
    if (
        extname === ".js" ||
        extname === ".jsx" ||
        extname === ".ts" ||
        extname === ".tsx" ||
        extname === ".mjs" ||
        extname === ".cjs" ||
        extname === ".vue" ||
        extname === ".svelte"
    ) {
        progress.text = filepath;
        transformFn(filepath);
    }
}

async function walkDir(
    dirpath: string,
    progress: c3poTypes.Progress,
    transformFn: TransformFn
) {
    const walker = walk.walk(dirpath);
    walker.on("file", (root: string, fileState: any, next: any) => {
        walkFile(path.join(root, fileState.name), progress, transformFn);
        next();
    });
    return new Promise(res => {
        walker.on("end", () => res());
    });
}

export async function pathsWalk(
    paths: string[],
    progress: c3poTypes.Progress,
    transformFn: TransformFn
) {
    await Promise.all(
        paths.map(async filePath => {
            if (fs.lstatSync(filePath).isDirectory()) {
                await walkDir(filePath, progress, transformFn);
            } else {
                walkFile(filePath, progress, transformFn);
            }
        })
    );
}
