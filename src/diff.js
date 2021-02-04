import _ from 'lodash';

const ID = Symbol('id');

const RECORD = 'Record';
const CONTAINER = 'Container';
const UNCHANGED = 'Unchanged';
const UPDATED = 'Updated';
const REMOVED = 'Removed';
const ADDED = 'Added';

const getName = (item) => item.name;
const getProperties = (item) => item.properties;
const getChildren = (item) => item.children;

const isRecord = (item) => item.type === RECORD;
const isUnchanged = (item) => getProperties(item).status === UNCHANGED;
const isUpdated = (item) => getProperties(item).status === UPDATED;
const isRemoved = (item) => getProperties(item).status === REMOVED;
const isAdded = (item) => getProperties(item).status === ADDED;

const makeRecord = (name, properties) => ({
  name, properties, type: RECORD,
});

const makeContainer = (name, children) => ({
  name, children, type: CONTAINER,
});

const buildDiff = (data1, data2) => {
  const keysData1 = new Set(Object.keys(data1));
  const keysData2 = new Set(Object.keys(data2));
  const equalKeys = new Set([...keysData2].filter((key) => keysData1.has(key)));
  const unchangedKeys = new Set([...equalKeys].filter((key) => _.isEqual(data1[key], data2[key])));
  const updatedKeys = new Set([...equalKeys].filter((key) => !_.isEqual(data1[key], data2[key])));
  const removedKeys = new Set([...keysData1].filter((key) => !keysData2.has(key)));
  const addedKeys = new Set([...keysData2].filter((key) => !keysData1.has(key)));

  const unchangedItems = [...unchangedKeys].map(
    (key) => makeRecord(key, { value: data2[key], status: UNCHANGED }),
  );
  const updatedItems = [...updatedKeys].reduce((acc, key) => {
    const before = data1[key];
    const after = data2[key];
    if (_.isPlainObject(before) && _.isPlainObject(after)) {
      return [...acc, makeContainer(key, getChildren(buildDiff(before, after)))];
    }
    const value = { before, after };
    return [...acc, makeRecord(key, { value, status: UPDATED })];
  }, []);
  const removedItems = [...removedKeys].map(
    (key) => makeRecord(key, { value: data1[key], status: REMOVED }),
  );
  const addedItems = [...addedKeys].map(
    (key) => makeRecord(key, { value: data2[key], status: ADDED }),
  );
  return makeContainer(ID, [...unchangedItems, ...updatedItems, ...removedItems, ...addedItems]);
};

export default {
  ID,
  RECORD,
  CONTAINER,
  UNCHANGED,
  UPDATED,
  REMOVED,
  ADDED,
  getName,
  getProperties,
  getChildren,
  isRecord,
  isUnchanged,
  isUpdated,
  isRemoved,
  isAdded,
  makeRecord,
  makeContainer,
  buildDiff,
};
