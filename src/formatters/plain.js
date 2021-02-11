import _ from 'lodash';

import ast from '../ast.js';

const isNonComplex = (value) => ([
  _.isNumber,
  _.isBoolean,
  _.isNull,
].some((check) => check(value)));

const formatValue = (value) => {
  if (_.isString(value)) {
    return `'${value}'`;
  }
  if (isNonComplex(value)) {
    return String(value);
  }
  return '[complex value]';
};

const formatRecord = (record, ancestry) => {
  const name = ast.getName(record);
  const value = ast.getValue(record);

  const fullName = [...ancestry, name].join('.');
  if (ast.isAdded(record)) {
    return `Property '${fullName}' was added with value: ${formatValue(value)}`;
  }
  if (ast.isUpdated(record)) {
    const before = formatValue(value.before);
    const after = formatValue(value.after);
    return `Property '${fullName}' was updated. From ${before} to ${after}`;
  }
  if (ast.isRemoved(record)) {
    return `Property '${fullName}' was removed`;
  }
  return null;
};

export default (AST) => {
  const inner = (item, ancestry = []) => {
    if (!ast.isContainer(item)) {
      return formatRecord(item, ancestry);
    }
    const name = ast.getName(item);
    const children = ast.getChildren(item);

    const newAncestry = [...ancestry, name];
    const parts = children.map((element) => inner(element, newAncestry));
    return parts.filter((part) => !_.isNull(part)).join('\n');
  };

  const result = AST.map((item) => inner(item));
  return result.join('\n');
};
