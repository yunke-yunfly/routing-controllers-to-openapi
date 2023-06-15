#!/usr/bin/env node
const path = require('path')
const packageJson = require(path.join(process.cwd(), './package.json'));
const { Command } = require('commander');

const program = new Command();

program
    .version(packageJson.version)
    .parse(process.argv);

const options = program.opts();

const { genOpenapiv3FromRoutingControllers } = require('../dist/index');
const fn = async () => {
    await genOpenapiv3FromRoutingControllers(options);
};
fn();