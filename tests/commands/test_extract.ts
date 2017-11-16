import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';

const potPath = path.resolve(__dirname, '../../dist/translation.pot');
const baseTestPath = path.resolve(__dirname, '../fixtures/baseTest');

function cleanup() {
    fs.unlinkSync(potPath);
}

afterEach(() => {
  cleanup();
})

test('extract', () => {
  execSync(`ts-node src/index.ts extract -o ${potPath} ${baseTestPath}`);
  const result = fs.readFileSync(potPath).toString();
  expect(result).toMatchSnapshot()
});
