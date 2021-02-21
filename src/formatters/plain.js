import _ from 'lodash';

import diff from '../diff.js';

const formatValue = (value) => {
  if (_.isString(value)) {
    return `'${value}'`;
  }
  if (_.isObject(value)) {
    return '[complex value]';
  }
  return String(value);
};

export default (diffAST) => {
  const inner = (item, ancestry = []) => {
    const name = diff.getName(item);

    if (diff.isContainer(item)) {
      const children = diff.getChildren(item);
      const parts = children.map((element) => inner(element, [...ancestry, name]));
      return parts.filter((part) => !_.isNull(part)).join('\n');
    }

    const value = diff.getValue(item);
    const fullName = [...ancestry, name].join('.');

    if (diff.isAdded(item)) {
      return `Property '${fullName}' was added with value: ${formatValue(value)}`;
    }
    if (diff.isUpdated(item)) {
      const before = formatValue(value.before);
      const after = formatValue(value.after);
      return `Property '${fullName}' was updated. From ${before} to ${after}`;
    }
    if (diff.isRemoved(item)) {
      return `Property '${fullName}' was removed`;
    }
    return null;
  };

  const result = diffAST.map((item) => inner(item));
  return result.join('\n');
};
