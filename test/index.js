/*global describe, it*/

'use strict';

var Layout = process.env.AK_LAYOUT_TEST_COVERAGE ? require('../lib-cov/layout') : require('../');
var View = require('ak-view');
var template = require('ak-template');
var assert = require('assert');

describe('Layout', function () {
  describe('#Layout', function () {
    it('initialize without initial element', function (done) {
      var layout = new Layout();

      assert.throws(function () {
        layout.attach(new View({'el': document.createElement('div')}));
      }, 'No element.');

      done();
    });
    it('initialize with initial element', function (done) {
      var layout = new Layout({'el': document.createElement('div')});

      assert.throws(function () {
        layout.attach(new View({'el': document.createElement('div')}));
      }, 'Please provide a zone with a name.');
      assert(layout.attach(new View({
        'el': document.createElement('div'),
        'name': 'zone-1'
      })) === layout);

      done();
    });
  });
  describe('#render()', function () {
    it('should be a noop', function () {
      var layout = new Layout({'template': template('<div></div>')});

      layout.render();

      assert.throws(function () {
        layout.getElement();
      }, 'No element.');

    });
  });
  describe('#renderTemplate()', function () {
    it('should be a noop', function () {
      var layout = new Layout({'template': template('<div></div>')});

      layout.renderTemplate();

      assert.throws(function () {
        layout.getElement();
      }, 'No element.');
    });
  });
  describe('#attach()', function () {
    var layout = new Layout({'el': document.createElement('div')});
    var zone1 = new View({
      'el': document.createElement('div'),
      'name': 'zone-1'
    });
    var zone2 = new View({
      'el': document.createElement('div'),
      'name': 'zone-2'
    });

    it('should attach zone only once', function () {
      assert(layout.attach(zone1) === layout);
      assert(Object.keys(layout._zones).length === 1);
      assert(layout._zones['zone-1'] === zone1);
      assert(layout.getElement().children.length === 1);
      assert(layout.getElement().children[0] === zone1.getElement());

      assert(layout.attach(zone1) === layout);
      assert(Object.keys(layout._zones).length === 1);
      assert(layout._zones['zone-1'] === zone1);
      assert(layout.getElement().children.length === 1);
      assert(layout.getElement().children[0] === zone1.getElement());
    });
    it('should attach zone if not already attached', function () {
      assert(layout.attach(zone2) === layout);
      assert(Object.keys(layout._zones).length === 2);
      assert(layout._zones['zone-1'] === zone1);
      assert(layout._zones['zone-2'] === zone2);
      assert(layout.getElement().children.length === 2);
      assert(layout.getElement().children[0] === zone1.getElement());
      assert(layout.getElement().children[1] === zone2.getElement());
    });
  });
  describe('#detach()', function () {
    it('should detach zone', function () {
      var layout = new Layout({'el': document.createElement('div')});
      var zone1 = new View({
        'el': document.createElement('div'),
        'name': 'zone-1'
      });
      var zone2 = new View({
        'el': document.createElement('div'),
        'name': 'zone-2'
      });

      layout.attach(zone1);
      layout.attach(zone2);
      layout.detach(zone1.options.name);

      assert(Object.keys(layout._zones).length === 1);
      assert(layout._zones['zone-1'] === undefined);
      assert(layout._zones['zone-2'] === zone2);
      assert(layout.getElement().children.length === 1);
      assert(layout.getElement().children[0] === zone2.getElement());
      assert(layout.getElement().children[1] === undefined);

      layout.detach(zone2);

      assert(Object.keys(layout._zones).length === 0);
      assert(layout._zones['zone-2'] === undefined);
      assert(layout.getElement().children.length === 0);
      assert(layout.getElement().children[0] === undefined);

      // NOTE assert silence return if zone not in layout
      layout.detach(zone2);
    });
  });
  describe('#zone()', function () {
    it('should return zone of given name', function () {
      var layout = new Layout({'el': document.createElement('div')});
      var zone1 = new View({
        'el': document.createElement('div'),
        'name': 'zone-1'
      });
      var zone2 = new View({
        'el': document.createElement('div'),
        'name': 'zone-2'
      });

      layout.attach(zone1);
      layout.attach(zone2);

      assert(layout.zone('zone-1') === zone1);
      assert(layout.zone('zone-2') === zone2);
      assert(layout.zone('zone-3') === undefined);
    });
  });
  describe('#hide()', function () {
    it('should hide zone', function () {
      var layout = new Layout({'el': document.createElement('div')});
      var zone1 = new View({
        'el': document.createElement('div'),
        'name': 'zone-1'
      });
      var zone2 = new View({
        'el': document.createElement('div'),
        'name': 'zone-2'
      });

      layout.attach(zone1);
      layout.attach(zone2);

      assert(layout.hide('zone-1') === layout);
      assert(zone1.getElement().classList.contains('ak-layout-zone-hidden'));
      assert(! zone2.getElement().classList.contains('ak-layout-zone-hidden'));
      assert(layout.hide(zone2) === layout);
      assert(zone1.getElement().classList.contains('ak-layout-zone-hidden'));
      assert(zone2.getElement().classList.contains('ak-layout-zone-hidden'));
    });
  });
  describe('#show()', function () {
    it('should show zone', function () {
      var layout = new Layout({'el': document.createElement('div')});
      var zone1 = new View({
        'el': document.createElement('div'),
        'name': 'zone-1'
      });
      var zone2 = new View({
        'el': document.createElement('div'),
        'name': 'zone-2'
      });

      layout.attach(zone1);
      layout.attach(zone2);

      assert(layout.hide('zone-1') === layout);
      assert(zone1.getElement().classList.contains('ak-layout-zone-hidden'));
      assert(! zone2.getElement().classList.contains('ak-layout-zone-hidden'));
      assert(layout.show(zone1) === layout);
      assert(! zone1.getElement().classList.contains('ak-layout-zone-hidden'));
      assert(! zone2.getElement().classList.contains('ak-layout-zone-hidden'));
      assert(layout.show(zone1) === layout);
      assert(! zone1.getElement().classList.contains('ak-layout-zone-hidden'));
      assert(! zone2.getElement().classList.contains('ak-layout-zone-hidden'));
    });
  });
  describe('events', function () {
    it('should be triggered', function (done) {
      var counter = {
        'attach': 0,
        'detach': 0,
        'hide': 0,
        'show': 0
      };
      var layout = new Layout({'el': document.createElement('div')});
      var zone1 = new View({
        'el': document.createElement('div'),
        'name': 'zone-1'
      });
      var zone2 = new View({
        'el': document.createElement('div'),
        'name': 'zone-2'
      });
      var zone3 = new View({
        'el': document.createElement('div'),
        'name': 'zone-3'
      });

      layout.eventEmitter.on('zone.attach.*', function (ns, zone) {
        if (counter.attach === 0) {
          assert(ns === 'zone.attach.zone-1');
          assert(zone === zone1);

          counter.attach += 1;
        } else if (counter.attach === 1) {
          assert(ns === 'zone.attach.zone-2');
          assert(zone === zone2);

          counter.attach += 1;
        } else if (counter.attach === 2) {
          assert(ns === 'zone.attach.zone-3');
          assert(zone === zone3);

          counter.attach += 1;
        } else if (counter.attach === 4) {
          assert(ns === 'zone.attach.zone-1');
          assert(zone === zone1);

          counter.attach += 1;
        }
      });

      layout.eventEmitter.on('zone.detach.*', function (ns, zone) {
        if (counter.detach === 0) {
          assert(ns === 'zone.detach.zone-2');
          assert(zone === zone2);

          counter.detach += 1;
        } else if (counter.detach === 1) {
          assert(ns === 'zone.detach.zone-3');
          assert(zone === zone3);

          counter.detach += 1;
        }
      });

      layout.eventEmitter.on('zone.hide.*', function (ns, zone) {
        if (counter.hide === 0) {
          assert(ns === 'zone.hide.zone-1');
          assert(zone === zone1);

          counter.hide += 1;
        } else if (counter.hide === 1) {
          assert(ns === 'zone.hide.zone-2');
          assert(zone === zone2);

          counter.hide += 1;
        }
      });

      layout.eventEmitter.on('zone.show.*', function (ns, zone) {
        if (counter.show === 0) {
          assert(ns === 'zone.show.zone-1');
          assert(zone === zone1);

          counter.show += 1;
        } else if (counter.show === 1) {
          assert(ns === 'zone.show.zone-2');
          assert(zone === zone2);

          counter.show += 1;
        }
      });

      layout.attach(zone1);
      layout.attach(zone2);
      layout.attach(zone3);
      layout.detach(zone1, true);
      layout.detach(zone2);
      layout.attach(zone2, true);
      layout.attach(zone1);
      zone3.destroy();
      layout.hide(zone1);
      layout.hide('zone-2');
      layout.show('zone-1');
      layout.show(zone2);
      layout.show();
      layout.hide();
      layout.hide('zone-1', true);
      assert(zone1.getElement().classList.contains('ak-layout-zone-hidden'));
      layout.show('zone-2', true);
      assert(! zone2.getElement().classList.contains('ak-layout-zone-hidden'));

      if (counter.attach === 3 && counter.detach === 2 && counter.hide === 2 && counter.show === 2) {
        done();
      }
    });
  });
});
