"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isFunction = exports.divAndMod = void 0;

require("core-js/modules/es6.regexp.to-string.js");

/*----------------------------------------*\
  21.2.camera - Tools.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2021-02-14 18:32:12
  @Last Modified time: 2021-02-14 19:52:00
\*----------------------------------------*/
const divAndMod = (value, divisor) => {
  let i = 0;
  let rest = value;

  while (rest >= divisor) {
    rest = rest - divisor;
    i++;
  }

  return [i, rest];
};

exports.divAndMod = divAndMod;

const isFunction = functionToCheck => {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
};

exports.isFunction = isFunction;