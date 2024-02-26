const preprocess = require("svelte-preprocess");

module.exports = {
    preprocess: [
        preprocess({
            typescript: {
                compilerOptions: {
                    target: "es2015"
                }
            }
        }),
    ],
};
