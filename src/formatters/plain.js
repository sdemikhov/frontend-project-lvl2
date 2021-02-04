import _ from 'lodash';

import diff from '../diff.js';

const STYLE_NAME = 'plain';

const stringCompare = (string1, string2) => string1.localeCompare(string2);

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
  const name = diff.getName(record);
  const props = diff.getProperties(record);

  const fullName = [...ancestry, name].join('.');
  if (diff.isAdded(record)) {
    return `Property '${fullName}' was added with value: ${formatValue(props.value)}`;
  }
  if (diff.isUpdated(record)) {
    const before = formatValue(props.value.before);
    const after = formatValue(props.value.after);
    return `Property '${fullName}' was updated. From ${before} to ${after}`;
  }
  if (diff.isRemoved(record)) {
    return `Property '${fullName}' was removed`;
  }
  return null;
};

const format = (tree) => {
  const inner = (item, ancestry = []) => {
    if (diff.isRecord(item)) {
      return formatRecord(item, ancestry);
    }
    const name = diff.getName(item);
    const children = [...diff.getChildren(item)].sort((child1, child2) => {
      const name1 = diff.getName(child1);
      const name2 = diff.getName(child2);
      return stringCompare(name1, name2);
    });

    const newAncestry = name === diff.ID ? [] : [...ancestry, name];
    const parts = children.map((element) => inner(element, newAncestry));
    return parts.filter((part) => !_.isNull(part)).join('\n');
  };

  return inner(tree);
};

export default {
  STYLE_NAME,
  format,
};
