import { test, expect } from '@jest/globals';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import genDiff from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');

test('gendiff', () => {
  const pathSimple1 = getFixturePath('simple1.json');
  const pathSimple2 = getFixturePath('simple2.json');
  const result = readFile('simple-result.txt');
  expect(genDiff(pathSimple1, pathSimple2)).toBe(result);
});
