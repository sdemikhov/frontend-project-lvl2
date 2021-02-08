import _ from 'lodash';

import ast from '../ast.js';

const STYLE_NAME = 'stylish';

const INDENT_STEP = 4;

const getIndent = (indentCount) => ' '.repeat(indentCount);

const formatValue = (value, indentCount = 0) => {
  if (_.isPlainObject(value)) {
    const entriesIndentCount = indentCount + INDENT_STEP;
    const sortedKeys = _.sortBy(Object.keys(value));
    const parts = sortedKeys.map((key) => (
      `${getIndent(entriesIndentCount)}${key}: ${formatValue(value[key], entriesIndentCount)}`
    ));
    const formattedObject = ['{', ...parts, `${getIndent(indentCount)}}`];
    return formattedObject.join('\n');
  }
  return String(value);
};

const formatRecord = (record, indentCount = 0) => {
  const name = ast.getName(record);
  const value = ast.getValue(record);
  const signLength = 2;
  const prefixIndentCount = !ast.isUnchanged(record) ? (indentCount - signLength) : indentCount;
  const indent = getIndent(prefixIndentCount);

  if (ast.isAdded(record)) {
    return `${indent}+ ${name}: ${formatValue(value, indentCount)}`;
  }
  if (ast.isUpdated(record)) {
    const beforeString = `${indent}- ${name}: ${formatValue(value.before, indentCount)}`;
    const afterString = `${indent}+ ${name}: ${formatValue(value.after, indentCount)}`;
    return [beforeString, afterString].join('\n');
  }
  if (ast.isRemoved(record)) {
    return `${indent}- ${name}: ${formatValue(value, indentCount)}`;
  }
  return `${indent}${name}: ${formatValue(value, indentCount)}`;
};

const format = (AST) => {
  const inner = (item, indentCount = 0) => {
    if (!ast.isContainer(item)) {
      return formatRecord(item, indentCount);
    }
    const name = ast.getName(item);
    const indent = getIndent(indentCount);
    const children = _.sortBy(ast.getChildren(item), [ast.getName]);

    const formattedChildren = children.map((element) => inner(element, indentCount + INDENT_STEP));
    const openBorder = name === ast.ID ? '{' : `${indent}${name}: {`;
    const closeBorder = name === ast.ID ? '}' : `${indent}}`;
    const result = [openBorder, ...formattedChildren, closeBorder];
    return result.join('\n');
  };

  return inner(AST);
};

export default {
  STYLE_NAME,
  format,
};
