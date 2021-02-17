import formatStylish from './stylish.js';
import formatPlain from './plain.js';
import formatJSON from './json.js';

export const DEFAULT_FORMAT = 'stylish';

export const formatters = ({
  stylish: formatStylish,
  plain: formatPlain,
  json: formatJSON,
});
