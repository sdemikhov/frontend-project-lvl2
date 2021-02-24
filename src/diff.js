import _ from 'lodash';

const CONTAINER = 'Container';
const UNCHANGED = 'Unchanged';
const UPDATED = 'Updated';
const REMOVED = 'Removed';
const ADDED = 'Added';

const getName = (item) => item.name;
const getValue = (item) => item.value;
const getChildren = (item) => item.children;

const isContainer = (item) => item.type === CONTAINER;
const isUnchanged = (item) => item.type === UNCHANGED;
const isUpdated = (item) => item.type === UPDATED;
const isRemoved = (item) => item.type === REMOVED;
const isAdded = (item) => item.type === ADDED;

const makeRecord = (name, value, type) => ({
  name, value, type,
});

const makeContainer = (name, children) => ({
  name, children, type: CONTAINER,
});

const buildDiff = (obj1, obj2) => {
  const keysObj1 = Object.keys(obj1);
  const keysObj2 = Object.keys(obj2);

  const uniqueSortedKeys = _.sortBy(_.union(keysObj1, keysObj2));
  const diff = uniqueSortedKeys.map((key) => {
    const before = obj1[key];
    const after = obj2[key];

    if (!_.has(obj1, key)) {
      return makeRecord(key, after, ADDED);
    }
    if (!_.has(obj2, key)) {
      return makeRecord(key, before, REMOVED);
    }
    if (_.isEqual(before, after)) {
      return makeRecord(key, after, UNCHANGED);
    }
    if (_.isPlainObject(before) && _.isPlainObject(after)) {
      return makeContainer(key, buildDiff(before, after));
    }
    return makeRecord(key, { before, after }, UPDATED);
  });
  return diff;
};

export default {
  getName,
  getValue,
  getChildren,
  isContainer,
  isUnchanged,
  isUpdated,
  isRemoved,
  isAdded,
  makeRecord,
  makeContainer,
  buildDiff,
};
