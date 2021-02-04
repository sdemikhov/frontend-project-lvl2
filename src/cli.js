import commander from 'commander';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

import genDiff from './index.js';

const DEFAULT_FORMATTER = 'stylish';
const FORMATTERS = [
  DEFAULT_FORMATTER,
  'plain',
];

const getVersion = () => {
  const pathCurrentFile = fileURLToPath(import.meta.url);
  const pathCurrentDir = path.dirname(pathCurrentFile);
  const packagejson = 'package.json';
  const jsonString = fs.readFileSync(path.join(pathCurrentDir, '..', packagejson), 'utf-8');
  const { version } = JSON.parse(jsonString);
  return version;
};

const run = () => {
  const program = new commander.Command();
  program
    .version(getVersion())
    .arguments('<filepath1> <filepath2>')
    .description('Compares two configuration files and shows a difference.')
    .helpOption('-h, --help', 'output usage information')
    .addOption(new commander.Option('-f, --format [type]', 'output format').default(DEFAULT_FORMATTER)
      .choices(FORMATTERS))
    .action((filepath1, filepath2, options) => console.log(
      genDiff(filepath1, filepath2, options.format),
    ));
  program.parse(process.argv);
};

export default run;
