const test = require('ava');

const Cabin = require('..');

test.beforeEach(t => {
  t.context.cabin = new Cabin();
});

test('GET/HEAD empty String `request.body`', t => {
  t.is(
    t.context.cabin.getMeta({
      method: 'GET',
      body: 'hello world'
    }).request.body,
    ''
  );
  t.is(
    t.context.cabin.getMeta({
      method: 'HEAD',
      body: 'hello world'
    }).request.body,
    ''
  );
});

test('POST with Object is parsed to `request.body`', t => {
  t.is(
    t.context.cabin.getMeta({
      method: 'POST',
      body: { hello: 'world' }
    }).request.body,
    JSON.stringify({ hello: 'world' })
  );
});

test('POST with Number is parsed to `request.body`', t => {
  t.is(
    t.context.cabin.getMeta({
      method: 'POST',
      body: 1
    }).request.body,
    '1'
  );
});

test('POST with String is parsed to `request.body`', t => {
  t.is(
    t.context.cabin.getMeta({
      method: 'POST',
      body: 'hello world'
    }).request.body,
    'hello world'
  );
});

test('parses user object', t => {
  t.is(
    t.context.cabin.getMeta({
      method: 'GET',
      user: {
        id: '123'
      }
    }).user.id,
    '123'
  );
});

test('parses ip address', t => {
  t.is(
    t.context.cabin.getMeta({
      method: 'GET',
      ip: '127.0.0.1'
    }).user.ip_address,
    '127.0.0.1'
  );
});
