"use strict";

require("core-js/modules/es6.symbol.js");

require("core-js/modules/web.dom.iterable.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/*----------------------------------------*\
  21.2.camera - EventHelper.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2021-02-14 17:40:52
  @Last Modified time: 2021-02-14 23:49:03
\*----------------------------------------*/
class EventHelper {
  constructor() {
    this.handlers = {};
    this.actionQueue = [];
  }

  addEvent(eventName) {
    this.handlers[eventName] = this.handlers[eventName] || [];
  }

  on(eventName, action) {
    if (!eventName) return;
    this.addEvent(eventName);
    this.handlers[eventName].push(action);
  }

  off(eventName, action) {
    if (!eventName) return;
    this.addEvent(eventName);
    let id = this.handlers[eventName].indexOf(action);

    if (id > -1) {
      this.handlers[eventName].splice(id, 1);

      if (this.handlers[eventName].length == 0) {
        delete this.handlers[eventName];
      }
    }
  }

  once(eventName, action) {
    if (!eventName) return;
    this.addEvent(eventName);

    const once = event => {
      action(event);
      this.off(eventName, once);
    };

    this.on(eventName, once);
  }

  trigger(eventName, _event) {
    const event = _objectSpread({
      eventName
    }, _event);

    for (const handler of this.handlers[eventName] || []) {
      this.actionQueue.push(() => handler(event));
    }
  }

  consume() {
    for (let i = 0, len = this.actionQueue.length; i < len; i++) {
      let action = this.actionQueue.shift();
      action();
    }
  }

}

exports.default = EventHelper;