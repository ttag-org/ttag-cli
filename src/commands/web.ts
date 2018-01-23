import openBrowser from "../lib/browser";
import * as Application from "koa";
import * as Router from "koa-router";
import * as koaBody from "koa-body";
import * as fs from "fs";

async function editor(ctx: Application.Context) {
    ctx.body = `
    <!doctype html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <meta name="theme-color" content="#000000">
        <link rel="manifest" href="https://unpkg.com/c-3po-editor/public/manifest.json">
        <link rel="shortcut icon" href="https://unpkg.com/c-3po-editor/public/favicon.ico">
        <title>C-3po editor</title>
    </head>
    <body>
        <noscript>
        You need to enable JavaScript to run this app.
        </noscript>
        <div id="root"></div>
    <script type=text/javascript>
        window.C3POEDITOR = {
            source: 'local'
        }
    </script>
    <script type="text/javascript" src="https://unpkg.com/c-3po-editor"></script></body>
    </html>`;
}

export default function translate(path: string) {
    /* define open/save handlers here to capture that path */
    async function open(ctx: Application.Context) {
        ctx.set("Content-Type", "text/plain");
        ctx.body = fs.readFileSync(path).toString();
    }

    async function save(ctx: Application.Context) {
        const translatedData = ctx.request.body;
        fs.writeFileSync(path, translatedData);
        ctx.body = "ok";
        ctx.status = 200;
    }

    const app = new Application();
    const router = new Router();
    router
        .get("/", editor)
        .get("/open", open)
        .post("/save", save);

    app.use(koaBody());
    app.use(router.routes());
    app.listen(3000);
    openBrowser(`http://127.0.0.1:3000/`);
}
