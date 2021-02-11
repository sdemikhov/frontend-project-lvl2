import fs from 'fs';
import path from 'path';

import ast from './ast.js';
import { parseJSON, parseYAML } from './parsers.js';
import formatStylish from './formatters/stylish.js';
import formatPlain from './formatters/plain.js';
import formatJSON from './formatters/json.js';

const loadFile = (filePath) => {
  const absoluteFilePath = path.resolve(process.cwd(), filePath);
  const fileContent = fs.readFileSync(absoluteFilePath, 'utf-8');

  const extension = path.extname(filePath);
  const parse = extension === '.yml' ? parseYAML : parseJSON;
  const obj = parse(fileContent);
  return obj;
};

const DEFAULT_FORMAT_NAME = 'stylish';

const formatters = {
  [DEFAULT_FORMAT_NAME]: formatStylish,
  plain: formatPlain,
  json: formatJSON,
};

const genDiff = (filePath1, filePath2, format = DEFAULT_FORMAT_NAME) => {
  const obj1 = loadFile(filePath1);
  const obj2 = loadFile(filePath2);

  const AST = ast.buildAST(obj1, obj2);

  return formatters[format](AST);
};

export default genDiff;
