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

const buildAST = (obj1, obj2) => {
  const keysData1 = Object.keys(obj1);
  const keysData2 = Object.keys(obj2);

  const equalKeys = keysData2.filter((key) => keysData1.includes(key));
  const unchangedKeys = equalKeys.filter((key) => _.isEqual(obj1[key], obj2[key]));
  const updatedKeys = equalKeys.filter((key) => !_.isEqual(obj1[key], obj2[key]));
  const removedKeys = keysData1.filter((key) => !keysData2.includes(key));
  const addedKeys = keysData2.filter((key) => !keysData1.includes(key));

  const unchangedItems = unchangedKeys.map((key) => makeRecord(key, obj2[key], UNCHANGED));
  const updatedItems = updatedKeys.reduce((acc, key) => {
    const before = obj1[key];
    const after = obj2[key];
    if (_.isPlainObject(before) && _.isPlainObject(after)) {
      return [...acc, makeContainer(key, buildAST(before, after))];
    }
    const value = { before, after };
    return [...acc, makeRecord(key, value, UPDATED)];
  }, []);
  const removedItems = removedKeys.map((key) => makeRecord(key, obj1[key], REMOVED));
  const addedItems = addedKeys.map((key) => makeRecord(key, obj2[key], ADDED));
  return [...unchangedItems, ...updatedItems, ...removedItems, ...addedItems];
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
  buildAST,
};
