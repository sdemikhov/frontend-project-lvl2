import fs from 'fs';
import path from 'path';

import diff from './diff.js';
import { parseJSON, parseYAML } from './parsers.js';
import formatStylish from './formatters/stylish.js';
import formatPlain from './formatters/plain.js';

const DEFAULT_FORMAT = 'stylish';

const loadFile = (filePath) => {
  const absoluteFilePath = path.resolve(process.cwd(), filePath);
  const string = fs.readFileSync(absoluteFilePath, 'utf-8');

  const extension = path.extname(filePath);
  const parse = extension === '.yml' ? parseYAML : parseJSON;
  const data = parse(string);
  return data;
};

const render = (ast, format) => {
  const formatterFunc = format === DEFAULT_FORMAT ? formatStylish : formatPlain;
  return formatterFunc(ast);
};

const genDiff = (filePath1, filePath2, format = DEFAULT_FORMAT) => {
  const data1 = loadFile(filePath1);
  const data2 = loadFile(filePath2);

  const difference = diff.buildDiff(data1, data2);
  const result = render(difference, format);
  return result;
};

export default genDiff;
