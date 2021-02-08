import _ from 'lodash';

import ast from '../ast.js';

const STYLE_NAME = 'stylish';

const INDENT_STEP = 4;

const getIndent = (indentCount) => ' '.repeat(indentCount);

const formatValue = (item, indentCount = 0) => {
  if (_.isPlainObject(item)) {
    const entriesIndentCount = indentCount + INDENT_STEP;
    const sortedKeys = _.sortBy(Object.keys(item));
    const parts = sortedKeys.map((key) => (
      `${getIndent(entriesIndentCount)}${key}: ${formatValue(item[key], entriesIndentCount)}`
    ));
    const formattedObject = ['{', ...parts, `${getIndent(indentCount)}}`];
    return formattedObject.join('\n');
  }
  return String(item);
};

const formatRecord = (record, indentCount = 0) => {
  const name = ast.getName(record);
  const props = ast.getProperties(record);
  const signLength = 2;
  const prefixIndentCount = !ast.isUnchanged(record) ? (indentCount - signLength) : indentCount;
  const indent = getIndent(prefixIndentCount);

  if (ast.isAdded(record)) {
    return `${indent}+ ${name}: ${formatValue(props.value, indentCount)}`;
  }
  if (ast.isUpdated(record)) {
    const beforeString = `${indent}- ${name}: ${formatValue(props.value.before, indentCount)}`;
    const afterString = `${indent}+ ${name}: ${formatValue(props.value.after, indentCount)}`;
    return [beforeString, afterString].join('\n');
  }
  if (ast.isRemoved(record)) {
    return `${indent}- ${name}: ${formatValue(props.value, indentCount)}`;
  }
  return `${indent}${name}: ${formatValue(props.value, indentCount)}`;
};

const format = (AST, indentCount = 0) => {
  if (ast.isRecord(AST)) {
    return formatRecord(AST, indentCount);
  }
  const name = ast.getName(AST);
  const indent = getIndent(indentCount);
  const children = _.sortBy(ast.getChildren(AST), [ast.getName]);

  const formattedChildren = children.map((element) => format(element, indentCount + INDENT_STEP));
  const openBorder = name === ast.ID ? '{' : `${indent}${name}: {`;
  const closeBorder = name === ast.ID ? '}' : `${indent}}`;
  const result = [openBorder, ...formattedChildren, closeBorder];
  return result.join('\n');
};

export default {
  STYLE_NAME,
  format,
};
