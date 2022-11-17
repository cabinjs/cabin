const path = require('node:path');
const { readFileSync } = require('node:fs');
const { Script } = require('node:vm');
const test = require('ava');
const _ = require('lodash');
const { JSDOM, VirtualConsole } = require('jsdom');

const virtualConsole = new VirtualConsole();
virtualConsole.sendTo(console);

const script = new Script(
  readFileSync(path.join(__dirname, '..', 'dist', 'cabin.min.js'))
);

const dom = new JSDOM(``, {
  url: 'http://localhost:3000/',
  referrer: 'http://localhost:3000/',
  contentType: 'text/html',
  includeNodeLocations: true,
  resources: 'usable',
  runScripts: 'dangerously',
  virtualConsole
});

dom.runVMScript(script);

test('should create a new Cabin instance', (t) => {
  const cabin = new dom.window.Cabin();
  t.true(_.isObject(cabin));
  cabin.info('hello');
});

test('should not expose a middleware function', (t) => {
  const cabin = new dom.window.Cabin();
  t.true(_.isUndefined(cabin.middleware));
});
