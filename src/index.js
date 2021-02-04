import fs from 'fs';
import path from 'path';

import diff from './diff.js';
import { parseJSON, parseYAML } from './parsers.js';
import stylish from './formatters/stylish.js';
import plain from './formatters/plain.js';
import json_ from './formatters/json.js';

const loadFile = (filePath) => {
  const absoluteFilePath = path.resolve(process.cwd(), filePath);
  const string = fs.readFileSync(absoluteFilePath, 'utf-8');

  const extension = path.extname(filePath);
  const parse = extension === '.yml' ? parseYAML : parseJSON;
  const data = parse(string);
  return data;
};

const genDiff = (filePath1, filePath2, format = stylish.STYLE_NAME) => {
  const data1 = loadFile(filePath1);
  const data2 = loadFile(filePath2);

  const ast = diff.buildDiff(data1, data2);

  if (format === stylish.STYLE_NAME) {
    return stylish.format(ast);
  }
  if (format === plain.STYLE_NAME) {
    return plain.format(ast);
  }
  return json_.format(ast);
};

export default genDiff;
