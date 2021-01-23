#! /usr/bin/env node
import buildParser from '../lib/cli.js';

buildParser().parse(process.argv);
