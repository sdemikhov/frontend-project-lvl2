import { test, expect, describe } from '@jest/globals';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import genDiff from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');

describe('gendiff', () => {
  test.each([
    ['json1.json', 'json2.json', 'stylish', 'result-stylish.txt'],
    ['json1.json', 'json2.json', 'plain', 'result-plain.txt'],
    ['json1.json', 'json2.json', 'json', 'result-json.txt'],
    ['yml1.yml', 'yml2.yml', 'stylish', 'result-stylish.txt'],
    ['yml1.yml', 'yml2.yml', 'plain', 'result-plain.txt'],
    ['yml1.yml', 'yml2.yml', 'json', 'result-json.txt'],
  ])('gendiff(%s, %s, %s)', (fileName1, fileName2, format, resultName) => {
    const filePath1 = getFixturePath(fileName1);
    const filePath2 = getFixturePath(fileName2);

    const expected = readFile(resultName);
    expect(genDiff(filePath1, filePath2, format)).toBe(expected);
  });
});
