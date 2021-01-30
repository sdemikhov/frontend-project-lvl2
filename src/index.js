import fs from 'fs';
import path from 'path';

const unchanged = 'unchanged';
const changed = 'changed';
const deleted = 'deleted';
const added = 'added';

const defaultType = 'default';

const loadFile = (filePath) => {
  const absoluteFilePath = path.resolve(process.cwd(), filePath);
  const jsonString = fs.readFileSync(absoluteFilePath, 'utf-8');
  const data = JSON.parse(jsonString);
  return data;
};

function Item(name, value, status) {
  this.name = name;
  this.value = value;
  this.status = status;
}

const isChanged = (item) => item.status === changed;
const isDeleted = (item) => item.status === deleted;
const isAdded = (item) => item.status === added;

const parse = (data1, data2) => {
  const keysData1 = new Set(Object.keys(data1));
  const keysData2 = new Set(Object.keys(data2));

  const unchangedKeys = new Set([...keysData2].filter((key) => keysData1.has(key)));
  const changedKeys = new Set([...unchangedKeys].filter((key) => data1[key] !== data2[key]));
  const deletedKeys = new Set([...keysData1].filter((key) => !keysData2.has(key)));
  const addedKeys = new Set([...keysData2].filter((key) => !keysData1.has(key)));

  const unchangedItems = [...unchangedKeys].map((key) => new Item(key, data2[key], unchanged));
  const changedItems = [...changedKeys].map((key) => new Item(
    key,
    [data1[key], data2[key]],
    changed,
  ));
  const deletedItems = [...deletedKeys].map((key) => new Item(key, data1[key], deleted));
  const addedItems = [...addedKeys].map((key) => new Item(key, data2[key], added));
  return [...unchangedItems, ...changedItems, ...deletedItems, ...addedItems];
};

const formatAsDefault = (item) => {
  if (isAdded(item)) {
    return `  + ${item.name}: ${item.value}`;
  }
  if (isChanged(item)) {
    const [previous, current] = item.value;
    const previousString = `  - ${item.name}: ${previous}`;
    const currentString = `  + ${item.name}: ${current}`;
    return [previousString, currentString].join('\n');
  }
  if (isDeleted(item)) {
    return `  - ${item.name}: ${item.value}`;
  }
  return `    ${item.name}: ${item.value}`;
};

const formatters = { [defaultType]: formatAsDefault };

const render = (ast, format) => {
  const resultStart = '{';
  const resultEnd = '}';
  const sortedAst = [...ast].sort((a, b) => a.name.localeCompare(b.name));
  const result = sortedAst.map(formatters[format]).join('\n');
  return [resultStart, result, resultEnd].join('\n');
};

const genDiff = (filePath1, filePath2, format = defaultType) => {
  const data1 = loadFile(filePath1);
  const data2 = loadFile(filePath2);

  const ast = parse(data1, data2);
  const result = render(ast, format);
  return result;
};

export default genDiff;
