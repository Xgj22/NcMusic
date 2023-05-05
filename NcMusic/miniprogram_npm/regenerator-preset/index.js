module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1679192552528, function(require, module, exports) {
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
  plugins: [
    require("@babel/plugin-syntax-async-generators"),
    require("@babel/plugin-proposal-function-sent"),
    require("@babel/plugin-transform-classes"),
    require("@babel/plugin-transform-arrow-functions"),
    require("@babel/plugin-transform-block-scoping"),
    require("@babel/plugin-transform-for-of"),
    require("regenerator-transform").default
  ]
};

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1679192552528);
})()
//miniprogram-npm-outsideDeps=["@babel/plugin-syntax-async-generators","@babel/plugin-proposal-function-sent","@babel/plugin-transform-classes","@babel/plugin-transform-arrow-functions","@babel/plugin-transform-block-scoping","@babel/plugin-transform-for-of","regenerator-transform"]
//# sourceMappingURL=index.js.map