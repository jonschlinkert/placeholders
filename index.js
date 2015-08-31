/*!
 * placeholders <https://github.com/jonschlinkert/placeholders>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var assign = require('assign-deep');
var expand = require('expand');

module.exports = function placeholders(opts) {
  opts = assign({ regex: /:([(\w ),]+)/g }, opts);

  return function (val, locals) {
    locals = assign({}, opts.data, locals);
    return expand(val, locals, { regex: opts.regex });
  };
};
