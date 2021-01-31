import { test, expect } from '@jest/globals';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import genDiff from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');

test('gendiff with plain examples', () => {
  const pathSimpleJSON1 = getFixturePath('simple1.json');
  const pathSimpleJSON2 = getFixturePath('simple2.json');
  const result = readFile('simple-result.txt');
  expect(genDiff(pathSimpleJSON1, pathSimpleJSON2)).toBe(result);
  const pathSimpleYAML1 = getFixturePath('simple1.yml');
  const pathSimpleYAML2 = getFixturePath('simple2.yml');
  expect(genDiff(pathSimpleYAML1, pathSimpleYAML2)).toBe(result);
});
