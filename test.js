/* deps: mocha */
var assert = require('assert');
var placeholders = require('./');
var fn;

describe('placeholders', function() {
  beforeEach(function() {
    fn = placeholders();
  });

  it('should return undefined when no string is passed:', function() {
    assert(!fn());
  });

  it('should replace a placeholder in the given string:', function() {
    assert(fn('foo/:bar', {bar: 'BAZ'}) === 'foo/BAZ');
  });

  it('should replace a placeholder with dot notation:', function() {
    assert(fn('foo/:bar.baz', {bar: {baz: 'BAZ'}}) === 'foo/BAZ');
  });

  it('should leave file extensions in tact:', function() {
    assert(fn('foo/:bar.html', {bar: 'BAZ'}) === 'foo/BAZ.html');
    assert(fn('foo/:a.b.c.html', {a: {b: {c: 'd'}}}) === 'foo/d.html');
    assert(fn('foo/:a.b.c.min.js', {a: {b: {c: 'd'}}}) === 'foo/d.min.js');
  });

  it('should not use dot notation values that are not strings:', function() {
    assert(fn('foo/:bar.html', {bar: 'BAZ'}) === 'foo/BAZ.html');
  });

  it('should replace multiple placeholders in the given string:', function() {
    var ctx = {bar: 'one', baz: 'two'};
    assert(fn('foo/:bar/:baz', ctx) === 'foo/one/two');
  });

  it('should support helper functions:', function() {
    var ctx = {
      path: 'blog/posts/something.md',
      bar: 'one',
      baz: 'two',
      qux: 'three',
      fez: 'four',
      ext: function(str) {
        return str.toUpperCase();
      }
    };
    assert(fn('foo/:bar/:baz/:qux:ext(fez)', ctx) === 'foo/one/two/threeFOUR');
  });

  it('should support helper functions using `this`:', function() {
    var ctx = {
      path: 'blog/posts/something.md',
      bar: 'one',
      baz: 'two',
      qux: 'three',
      fez: 'four',
      ext: 'fez',
      upper: function(str) {
        return this[str].toUpperCase();
      }
    };
    assert(fn('foo/:bar/:baz/:qux:upper(ext)', ctx) === 'foo/one/two/threeFOUR');
  });

  it('should support helper functions using `this` and no params:', function() {
    var ctx = {
      path: 'blog/posts/something.md',
      bar: 'one',
      baz: 'two',
      qux: 'three',
      fez: 'four',
      ext: 'fez',
      foo: function() {
        return this.fez.toUpperCase();
      }
    };
    assert(fn('foo/:bar/:baz/:qux:foo()', ctx) === 'foo/one/two/threeFOUR');
  });

  it('should use custom regex:', function() {
    fn = placeholders({regex: /%([^%]+)%/});
    var ctx = {bar: 'one', baz: 'two'};
    assert(fn('foo/%bar%/%baz%', ctx) === 'foo/one/two');
  });

  it('should use data passed to the main function:', function() {
    fn = placeholders({regex: /%([^%]+)%/, data: {bar: 'one', baz: 'two'}});
    assert(fn('foo/%bar%/%baz%') === 'foo/one/two');
  });

  it('should return a function when no data is passed:', function() {
    var interpolate = placeholders({regex: /%([^%]+)%/});
    var fn = interpolate('foo/%bar%/%baz%');

    assert(typeof fn === 'function');
    assert(fn({bar: 'one', baz: 'two'}) === 'foo/one/two');
    assert(fn({bar: 'a', baz: 'b'}) === 'foo/a/b');
  });

  it('should extend locals with data passed to the main function:', function() {
    fn = placeholders({regex: /%([^%]+)%/, data: {bar: 'one'}});
    assert(fn('foo/%bar%/%baz%', {baz: 'two'}) === 'foo/one/two');
  });

  it('should work on objects (not documented :):', function() {
    assert.deepEqual(fn({a: 'foo/:bar'}, {bar: 'BAZ'}), {a: 'foo/BAZ'});
  });

  it('should work on URLs', function() {
    assert.deepEqual(fn({a: 'https://foo.com/:bar'}, {bar: 'BAZ'}), {
      a: 'https://foo.com/BAZ'
    });
  });
});
