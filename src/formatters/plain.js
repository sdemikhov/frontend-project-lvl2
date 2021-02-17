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

const formatRecord = (record, ancestry) => {
  const name = diff.getName(record);
  const value = diff.getValue(record);

  const fullName = [...ancestry, name].join('.');
  if (diff.isAdded(record)) {
    return `Property '${fullName}' was added with value: ${formatValue(value)}`;
  }
  if (diff.isUpdated(record)) {
    const before = formatValue(value.before);
    const after = formatValue(value.after);
    return `Property '${fullName}' was updated. From ${before} to ${after}`;
  }
  if (diff.isRemoved(record)) {
    return `Property '${fullName}' was removed`;
  }
  return null;
};

export default (diffAST) => {
  const inner = (item, ancestry = []) => {
    if (!diff.isContainer(item)) {
      return formatRecord(item, ancestry);
    }
    const name = diff.getName(item);
    const children = diff.getChildren(item);

    const newAncestry = [...ancestry, name];
    const parts = children.map((element) => inner(element, newAncestry));
    return parts.filter((part) => !_.isNull(part)).join('\n');
  };

  const result = diffAST.map((item) => inner(item));
  return result.join('\n');
};
