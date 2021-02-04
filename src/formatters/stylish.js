import _ from 'lodash';

import diff from '../diff.js';

const STYLE_NAME = 'stylish';

const INDENT_STEP = 4;

const getIndent = (indentCount) => ' '.repeat(indentCount);

const stringCompare = (string1, string2) => string1.localeCompare(string2);

const formatValue = (item, indentCount = 0) => {
  if (_.isPlainObject(item)) {
    const entriesIndentCount = indentCount + INDENT_STEP;
    const sortedKeys = [...Object.keys(item)].sort(stringCompare);
    const parts = sortedKeys.map((key) => (
      `${getIndent(entriesIndentCount)}${key}: ${formatValue(item[key], entriesIndentCount)}`
    ));
    const formattedObject = ['{', ...parts, `${getIndent(indentCount)}}`];
    return formattedObject.join('\n');
  }
  return String(item);
};

const formatRecord = (record, indentCount = 0) => {
  const name = diff.getName(record);
  const props = diff.getProperties(record);
  const signLength = 2;
  const prefixIndentCount = !diff.isUnchanged(record) ? (indentCount - signLength) : indentCount;
  const indent = getIndent(prefixIndentCount);

  if (diff.isAdded(record)) {
    return `${indent}+ ${name}: ${formatValue(props.value, indentCount)}`;
  }
  if (diff.isUpdated(record)) {
    const beforeString = `${indent}- ${name}: ${formatValue(props.value.before, indentCount)}`;
    const afterString = `${indent}+ ${name}: ${formatValue(props.value.after, indentCount)}`;
    return [beforeString, afterString].join('\n');
  }
  if (diff.isRemoved(record)) {
    return `${indent}- ${name}: ${formatValue(props.value, indentCount)}`;
  }
  return `${indent}${name}: ${formatValue(props.value, indentCount)}`;
};

const format = (tree) => {
  const outerLevel = 0;

  const inner = (item, indentCount = outerLevel) => {
    if (diff.isRecord(item)) {
      return formatRecord(item, indentCount);
    }
    const name = diff.getName(item);
    const indent = getIndent(indentCount);
    const children = [...diff.getChildren(item)].sort((child1, child2) => {
      const name1 = diff.getName(child1);
      const name2 = diff.getName(child2);
      return stringCompare(name1, name2);
    });

    const formattedChildren = children.map((element) => inner(element, indentCount + INDENT_STEP));
    const openBorder = name === diff.ID ? '{' : `${indent}${name}: {`;
    const closeBorder = name === diff.ID ? '}' : `${indent}}`;
    const result = [openBorder, ...formattedChildren, closeBorder];
    return result.join('\n');
  };

  return inner(tree);
};

export default {
  STYLE_NAME,
  format,
};
