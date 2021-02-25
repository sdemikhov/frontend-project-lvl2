import yaml from 'js-yaml';

const parseJSON = (string) => JSON.parse(string, 'utf-8');

const parseYAML = (string) => yaml.load(string, 'utf-8');

export { parseJSON, parseYAML };
