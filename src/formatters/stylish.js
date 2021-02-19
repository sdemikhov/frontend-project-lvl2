import _ from 'lodash';

import diff from '../diff.js';

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

export default (AST) => {
  const inner = (item, indentCount = 4) => {
    const name = diff.getName(item);
    if (diff.isContainer(item)) {
      const indent = getIndent(indentCount);
      const children = diff.getChildren(item);

      const formattedChildren = children.map((element) => (
        inner(element, indentCount + INDENT_STEP)
      ));
      const result = [`${indent}${name}: {`, ...formattedChildren, `${indent}}`];
      return result.join('\n');
    }
    const value = diff.getValue(item);
    const signLength = 2;
    const prefixIndentCount = !diff.isUnchanged(item) ? (indentCount - signLength) : indentCount;
    const prefixedIndent = getIndent(prefixIndentCount);

    if (diff.isAdded(item)) {
      return `${prefixedIndent}+ ${name}: ${formatValue(value, indentCount)}`;
    }
    if (diff.isUpdated(item)) {
      const beforeString = `${prefixedIndent}- ${name}: ${formatValue(value.before, indentCount)}`;
      const afterString = `${prefixedIndent}+ ${name}: ${formatValue(value.after, indentCount)}`;
      return [beforeString, afterString].join('\n');
    }
    if (diff.isRemoved(item)) {
      return `${prefixedIndent}- ${name}: ${formatValue(value, indentCount)}`;
    }
    return `${prefixedIndent}${name}: ${formatValue(value, indentCount)}`;
  };

  const formattedASTParts = AST.map((item) => inner(item));
  const result = ['{', ...formattedASTParts, '}'];
  return result.join('\n');
};
