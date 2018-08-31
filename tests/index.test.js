/* global assert, setup, suite, test */
require('aframe');
require('../index.js');
var entityFactory = require('./helpers').entityFactory;

suite('lowroller component', function () {
  var component;
  var el;

  setup(function (done) {
    el = entityFactory();
    el.addEventListener('componentinitialized', function (evt) {
      if (evt.detail.name !== 'lowroller') { return; }
      component = el.components['lowroller'];
      done();
    });
    el.setAttribute('lowroller', {});
  });

  suite('foo property', function () {
    test('is good', function () {
      assert.equal(1, 1);
    });
  });
});
