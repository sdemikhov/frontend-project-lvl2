import fs from 'fs';
import path from 'path';

import diff from './diff.js';
import parsers from './parsers.js';
import { formatters, DEFAULT_FORMAT } from './formatters/formatters.js';

const TYPES_BY_EXTENSION = {
  '.json': 'json',
  '.yml': 'yaml',
  '.yaml': 'yaml',
};

const getTypeFromFilePath = (filePath) => {
  const extension = path.extname(filePath);
  return TYPES_BY_EXTENSION[extension];
};

const loadFile = (filePath) => {
  const absoluteFilePath = path.resolve(process.cwd(), filePath);
  const fileContent = fs.readFileSync(absoluteFilePath, 'utf-8');

  const type = getTypeFromFilePath(filePath);
  const obj = parsers[type](fileContent);
  return obj;
};

const genDiff = (filePath1, filePath2, format = DEFAULT_FORMAT) => {
  const obj1 = loadFile(filePath1);
  const obj2 = loadFile(filePath2);

  const diffAST = diff.buildDiff(obj1, obj2);

  return formatters[format](diffAST);
};

export default genDiff;
