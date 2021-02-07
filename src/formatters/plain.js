import _ from 'lodash';

import ast from '../ast.js';

const STYLE_NAME = 'plain';

const isNonComplex = (value) => ([
  _.isNumber,
  _.isBoolean,
  _.isNull,
  _.isDate,
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
  const props = ast.getProperties(record);

  const fullName = [...ancestry, name].join('.');
  if (ast.isAdded(record)) {
    return `Property '${fullName}' was added with value: ${formatValue(props.value)}`;
  }
  if (ast.isUpdated(record)) {
    const before = formatValue(props.value.before);
    const after = formatValue(props.value.after);
    return `Property '${fullName}' was updated. From ${before} to ${after}`;
  }
  if (ast.isRemoved(record)) {
    return `Property '${fullName}' was removed`;
  }
  return null;
};

const format = (AST) => {
  const inner = (item, ancestry = []) => {
    if (ast.isRecord(item)) {
      return formatRecord(item, ancestry);
    }
    const name = ast.getName(item);
    const children = _.sortBy(ast.getChildren(item), [ast.getName]);

    const newAncestry = name === ast.ID ? [] : [...ancestry, name];
    const parts = children.map((element) => inner(element, newAncestry));
    return parts.filter((part) => !_.isNull(part)).join('\n');
  };

  return inner(AST);
};

export default {
  STYLE_NAME,
  format,
};
