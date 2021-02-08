import fs from 'fs';
import path from 'path';

import ast from './ast.js';
import { parseJSON, parseYAML } from './parsers.js';
import stylish from './formatters/stylish.js';
import plain from './formatters/plain.js';
import json_ from './formatters/json.js';

const loadFile = (filePath) => {
  const absoluteFilePath = path.resolve(process.cwd(), filePath);
  const fileContent = fs.readFileSync(absoluteFilePath, 'utf-8');

  const extension = path.extname(filePath);
  const parse = extension === '.yml' ? parseYAML : parseJSON;
  const obj = parse(fileContent);
  return obj;
};

const formatters = {
  [stylish.STYLE_NAME]: stylish,
  [plain.STYLE_NAME]: plain,
  [json_.STYLE_NAME]: json_,
};

const genDiff = (filePath1, filePath2, format = stylish.STYLE_NAME) => {
  const obj1 = loadFile(filePath1);
  const obj2 = loadFile(filePath2);

  const AST = ast.buildAST(obj1, obj2);

  const formatter = formatters[format];
  return formatter.format(AST);
};

export default genDiff;
