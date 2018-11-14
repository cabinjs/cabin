const path = require('path');
const { readFileSync } = require('fs');
const { Script } = require('vm');
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

test('should create a new Cabin instance', t => {
  const cabin = new dom.window.Cabin({ axe: { capture: false } });
  t.true(_.isObject(cabin));
  cabin.logger.info('hello');
});
