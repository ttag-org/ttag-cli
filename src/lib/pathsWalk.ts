import * as walk from "walk";
import * as path from "path";
import * as c3poTypes from "../types";
import * as fs from "fs";

export type TransformFn = (filepath: string) => Promise<void>;

async function walkFile(
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
        extname === ".vue" ||
        extname === ".svelte"
    ) {
        progress.text = filepath;
        await transformFn(filepath);
    }
}

async function walkDir(
    dirpath: string,
    progress: c3poTypes.Progress,
    transformFn: TransformFn
) {
    const walker = walk.walk(dirpath);
    walker.on("file", (root: string, fileState: any, next: any) => {
        walkFile(
            path.join(root, fileState.name),
            progress,
            transformFn
        ).then(() => next());
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
                await walkFile(filePath, progress, transformFn);
            }
        })
    );
}
