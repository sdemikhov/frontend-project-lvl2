import { program } from 'commander';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const getVersion = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const pathToPackagejson = 'package.json';
  const jsonString = fs.readFileSync(path.join(__dirname, '..', pathToPackagejson), 'utf-8');
  const { version } = JSON.parse(jsonString);
  return version;
};

const buildParser = () => (program
  .configureHelp({
    sortSubcommands: false,
  })
  .version(getVersion())
  .arguments('<filepath1> <filepath2>')
  .description('Compares two configuration files and shows a difference.')
  .helpOption('-h, --help', 'output usage information')
  .option('-f, --format [type]', 'output format')
);

export default buildParser;
