#! /usr/bin/env node
import buildParser from '../src/cli.js';

const parser = buildParser();
parser.parse(process.argv);
