import _ from 'lodash';

import ast from '../ast.js';

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

export default (AST) => {
  const inner = (item, indentCount = 4) => {
    if (!ast.isContainer(item)) {
      return formatRecord(item, indentCount);
    }
    const name = ast.getName(item);
    const indent = getIndent(indentCount);
    const children = ast.getChildren(item);

    const formattedChildren = children.map((element) => inner(element, indentCount + INDENT_STEP));
    const result = [`${indent}${name}: {`, ...formattedChildren, `${indent}}`];
    return result.join('\n');
  };

  const formattedASTParts = AST.map((item) => inner(item));
  const result = ['{', ...formattedASTParts, '}'];
  return result.join('\n');
};
