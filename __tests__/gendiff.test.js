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
  const resultStylish = readFile('result-stylish.txt');
  const resultPlain = readFile('result-plain.txt');

  const pathJSON1 = getFixturePath('json1.json');
  const pathJSON2 = getFixturePath('json2.json');

  const pathYML1 = getFixturePath('yml1.yml');
  const pathYML2 = getFixturePath('yml2.yml');
  test('stylish format', () => {
    expect(genDiff(pathJSON1, pathJSON2)).toBe(resultStylish);
    expect(genDiff(pathYML1, pathYML2)).toBe(resultStylish);
  });
  test('plain format', () => {
    expect(genDiff(pathYML1, pathYML2, 'plain')).toBe(resultPlain);
    expect(genDiff(pathYML1, pathYML2, 'plain')).toBe(resultPlain);
  });
});
