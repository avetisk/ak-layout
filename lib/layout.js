'use strict';

/**
 * Dependencies
 */
var View = require('ak-view');

/**
 * Export `Layout`
 *
 * @param {Object} options (*NOT* optional)
 * @return {Layout}
 */
var Layout = module.exports = function (options) {
  options = options || {};

  View.call(this, options);

  this._zones = {};
};

/**
 * Inherit from View (ak-view)
 */
var prototype = Layout.prototype = Object.create(View.prototype);

/**
 * Prevent modifying layout through rendering
 *
 * @return {Layout}
 */
prototype.render = prototype.renderTemplate = function () {
  return this;
};

/**
 * Internal use only: Detach zone when destroyed
 *
 * @param {String} ns
 * @param {View} zone
 */
prototype._onZoneDestroy = function (ns, zone) {
  this.detach(zone);
};

/**
 * Add a zone
 *
 * @param {String} name
 * @return {View}
 */
prototype.zone = function (name) {
  return this._zones[name];
};

/**
 * Add a zone
 *
 * @param {View} zone
 * @param {Boolean} silent (optional)
 * @return {Layout}
 */
prototype.attach = function (zone, silent) {
  var name = zone.options.name;

  if (! name) {
    throw new Error('Please provide a zone with a name.');
  }

  if (this._zones[name]) {
    return this;
  }

  zone.getElement().setAttribute('x-ak-layout-zone', name);
  zone.eventEmitter.on('change.destroy', this._onZoneDestroy, this);

  this._zones[name] = zone;
  this._el.appendChild(zone.getElement());

  if (! silent) {
    this.eventEmitter.emit('zone.attach.' + name, zone, this);
  }

  return this;
};

/**
 * Remove a zone
 *
 * @param {String|View} name
 * @param {Boolean} silent (optional)
 * @return {Layout}
 */
prototype.detach = function (name, silent) {
  name = name instanceof View && name.options.name ? name.options.name : name;
  var zone = this._zones[name];

  if (! zone) {
    return this;
  }

  delete this._zones[name];

  this._el.removeChild(zone.getElement());
  zone.eventEmitter.off('change.destroy', this._onZoneDestroy, this);

  if (! silent) {
    this.eventEmitter.emit('zone.detach.' + name, zone, this);
  }

  return this;
};

/**
 * Hide a zone
 *
 * @param {String|View} name
 * @param {Boolean} silent (optional)
 * @return {Layout}
 */
prototype.hide = function (name, silent) {
  name = name instanceof View && name.options.name ? name.options.name : name;
  var zone = this._zones[name];

  if (! zone) {
    return this;
  }

  zone.getElement().classList.add('ak-layout-zone-hidden');

  if (! silent) {
    this.eventEmitter.emit('zone.hide.' + name, zone, this);
  }

  return this;
};

/**
 * Show a zone
 *
 * @param {String|View} name
 * @param {Boolean} silent (optional)
 * @return {Layout}
 */
prototype.show = function (name, silent) {
  name = name instanceof View && name.options.name ? name.options.name : name;
  var zone = this._zones[name];

  if (! zone) {
    return this;
  }

  zone.getElement().classList.remove('ak-layout-zone-hidden');

  if (! silent) {
    this.eventEmitter.emit('zone.show.' + name, zone, this);
  }

  return this;
};
