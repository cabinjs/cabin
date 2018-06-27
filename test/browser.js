const test = require('ava');
const _ = require('lodash');
const jsdom = require('jsdom');
const jsdomOld = require('jsdom/lib/old-api');

test.before.cb(t => {
  jsdomOld.env({
    html: '',
    scripts: [require.resolve('../dist/cabin.min.js')],
    virtualConsole: new jsdom.VirtualConsole().sendTo(console),
    done(err, window) {
      if (err) return t.end(err);
      t.context.window = window;
      t.end();
    }
  });
});

test('should create a new Cabin instance', t => {
  const cabin = new t.context.window.Cabin({ axe: { capture: false } });
  t.true(_.isObject(cabin));
  cabin.logger.info('hello');
});
