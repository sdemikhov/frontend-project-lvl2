import fs from 'fs';
import path from 'path';
import _ from 'lodash';

import { parseJSON, parseYAML } from './parsers.js';

const RECORD = 'Record';
const CONTAINER = 'Container';
const UNCHANGED = 'Unchanged';
const UPDATED = 'Updated';
const REMOVED = 'Removed';
const ADDED = 'Added';

const DEFAULT_FORMAT = 'stylish';

const INDENT_STEP = 4;

const loadFile = (filePath) => {
  const absoluteFilePath = path.resolve(process.cwd(), filePath);
  const string = fs.readFileSync(absoluteFilePath, 'utf-8');

  const extension = path.extname(filePath);
  const parse = extension === '.yml' ? parseYAML : parseJSON;
  const data = parse(string);
  return data;
};

const makeRecord = (name, properties) => ({
  name, properties, type: RECORD,
});

const makeContainer = (name, children) => ({
  name, children, type: CONTAINER,
});

const getName = (item) => item.name;
const getProperties = (item) => item.properties;
const getChildren = (item) => item.children;

const isRecord = (item) => item.type === RECORD;
const isUnchanged = (item) => getProperties(item).status === UNCHANGED;
const isUpdated = (item) => getProperties(item).status === UPDATED;
const isRemoved = (item) => getProperties(item).status === REMOVED;
const isAdded = (item) => getProperties(item).status === ADDED;

const getDifference = (data1, data2) => {
  const keysData1 = new Set(Object.keys(data1));
  const keysData2 = new Set(Object.keys(data2));

  const equalKeys = new Set([...keysData2].filter((key) => keysData1.has(key)));
  const unchangedKeys = new Set([...equalKeys].filter((key) => _.isEqual(data1[key], data2[key])));
  const updatedKeys = new Set([...equalKeys].filter((key) => !_.isEqual(data1[key], data2[key])));
  const removedKeys = new Set([...keysData1].filter((key) => !keysData2.has(key)));
  const addedKeys = new Set([...keysData2].filter((key) => !keysData1.has(key)));

  const unchangedItems = [...unchangedKeys].map(
    (key) => makeRecord(key, { value: data2[key], status: UNCHANGED }),
  );
  const updatedItems = [...updatedKeys].reduce((acc, key) => {
    const before = data1[key];
    const after = data2[key];
    if (_.isPlainObject(before) && _.isPlainObject(after)) {
      return [...acc, makeContainer(key, getChildren(getDifference(before, after)))];
    }
    const value = { before, after };
    return [...acc, makeRecord(key, { value, status: UPDATED })];
  }, []);
  const removedItems = [...removedKeys].map(
    (key) => makeRecord(key, { value: data1[key], status: REMOVED }),
  );
  const addedItems = [...addedKeys].map(
    (key) => makeRecord(key, { value: data2[key], status: ADDED }),
  );
  return makeContainer('Diff', [...unchangedItems, ...updatedItems, ...removedItems, ...addedItems]);
};

const getIndent = (indentCount) => ' '.repeat(indentCount);

const stringCompare = (string1, string2) => string1.localeCompare(string2);

const formatValue = (item, indentCount = 0) => {
  if (_.isPlainObject(item)) {
    const entriesIndentCount = indentCount + INDENT_STEP;
    const sortedKeys = Object.keys(item).sort(stringCompare);
    const parts = sortedKeys.map((key) => (
      `${getIndent(entriesIndentCount)}${key}: ${formatValue(item[key], entriesIndentCount)}`
    ));
    const result = ['{', ...parts, `${getIndent(indentCount)}}`];
    return result.join('\n');
  }
  return String(item);
};

const formatRecordAsDefault = (record, indentCount = 0) => {
  const name = getName(record);
  const props = getProperties(record);
  const signLength = 2;
  const prefixIndentCount = !isUnchanged(record) ? (indentCount - signLength) : indentCount;
  const indent = getIndent(prefixIndentCount);

  if (isAdded(record)) {
    return `${indent}+ ${name}: ${formatValue(props.value, indentCount)}`;
  }
  if (isUpdated(record)) {
    const beforeString = `${indent}- ${name}: ${formatValue(props.value.before, indentCount)}`;
    const afterString = `${indent}+ ${name}: ${formatValue(props.value.after, indentCount)}`;
    return [beforeString, afterString].join('\n');
  }
  if (isRemoved(record)) {
    return `${indent}- ${name}: ${formatValue(props.value, indentCount)}`;
  }
  return `${indent}${name}: ${formatValue(props.value, indentCount)}`;
};

const formatAsDefault = (tree) => {
  const outerLevel = 0;

  const format = (item, indentCount) => {
    if (isRecord(item)) {
      return formatRecordAsDefault(item, indentCount);
    }
    const name = getName(item);
    const indent = getIndent(indentCount);
    const children = getChildren(item).sort((child1, child2) => {
      const name1 = getName(child1);
      const name2 = getName(child2);
      return stringCompare(name1, name2);
    });

    const formattedChildren = children.map((element) => format(element, indentCount + INDENT_STEP));
    const openBorder = indentCount === outerLevel ? '{' : `${indent}${name}: {`;
    const closeBorder = indentCount === outerLevel ? '}' : `${indent}}`;
    const result = [openBorder, ...formattedChildren, closeBorder];
    return result.join('\n');
  };

  return format(tree, outerLevel);
};

const formatAsJSON = (item) => JSON.stringify(item);

const render = (ast, format) => {
  const formatterFunc = format === DEFAULT_FORMAT ? formatAsDefault : formatAsJSON;
  return formatterFunc(ast);
};

const genDiff = (filePath1, filePath2, format = DEFAULT_FORMAT) => {
  const data1 = loadFile(filePath1);
  const data2 = loadFile(filePath2);

  const diff = getDifference(data1, data2);
  const result = render(diff, format);
  return result;
};

export default genDiff;
