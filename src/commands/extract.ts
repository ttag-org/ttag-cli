import * as babel from 'babel-core';

function extract(output: string, paths: string[]): void {
    const babelOptions = {
        plugins: [['c-3po', { extract: { output }}]]
    }
    paths.forEach((filePath) => {
        babel.transformFileSync(filePath, babelOptions);
    })
    console.log(`c-3po has successfully extracted translations to ${output}`);
}

export default extract;
