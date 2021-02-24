import _ from 'lodash';

import diff from '../diff.js';

const getIndent = (level) => {
  const spacesCount = 4;
  return ' '.repeat(spacesCount * level);
};

const formatValue = (value, level) => {
  if (_.isPlainObject(value)) {
    const sortedKeys = _.sortBy(Object.keys(value));
    const parts = sortedKeys.map((key) => (
      `${getIndent(level + 1)}${key}: ${formatValue(value[key], level + 1)}`
    ));
    const formattedObject = ['{', ...parts, `${getIndent(level)}}`];
    return formattedObject.join('\n');
  }
  return String(value);
};

export default (diffAST) => {
  const inner = (item, level) => {
    const name = diff.getName(item);
    const indent = getIndent(level);

    if (diff.isContainer(item)) {
      const children = diff.getChildren(item);
      const formattedChildren = children.map((element) => (inner(element, level + 1)));
      const containerParts = [`${indent}${name}: {`, ...formattedChildren, `${indent}}`];
      return containerParts.join('\n');
    }

    const value = diff.getValue(item);
    const prefixLength = 2;
    const cuttedIndent = getIndent(level).slice(prefixLength);

    if (diff.isAdded(item)) {
      return `${cuttedIndent}+ ${name}: ${formatValue(value, level)}`;
    }
    if (diff.isUpdated(item)) {
      const beforeString = `${cuttedIndent}- ${name}: ${formatValue(value.before, level)}`;
      const afterString = `${cuttedIndent}+ ${name}: ${formatValue(value.after, level)}`;
      return [beforeString, afterString].join('\n');
    }
    if (diff.isRemoved(item)) {
      return `${cuttedIndent}- ${name}: ${formatValue(value, level)}`;
    }
    return `${indent}${name}: ${formatValue(value, level)}`;
  };

  const formattedASTParts = diffAST.map((item) => inner(item, 1));
  const result = ['{', ...formattedASTParts, '}'];
  return result.join('\n');
};
