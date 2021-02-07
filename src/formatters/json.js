const STYLE_NAME = 'json';

const format = (AST) => JSON.stringify({ ...AST, name: 'Diff' });

export default {
  STYLE_NAME,
  format,
};
