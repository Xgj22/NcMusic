module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1679192551670, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = optimiseCallExpression;

var _t = require("@babel/types");

const {
  callExpression,
  identifier,
  isIdentifier,
  isSpreadElement,
  memberExpression,
  optionalCallExpression,
  optionalMemberExpression
} = _t;

function optimiseCallExpression(callee, thisNode, args, optional) {
  if (args.length === 1 && isSpreadElement(args[0]) && isIdentifier(args[0].argument, {
    name: "arguments"
  })) {
    if (optional) {
      return optionalCallExpression(optionalMemberExpression(callee, identifier("apply"), false, true), [thisNode, args[0].argument], false);
    }

    return callExpression(memberExpression(callee, identifier("apply")), [thisNode, args[0].argument]);
  } else {
    if (optional) {
      return optionalCallExpression(optionalMemberExpression(callee, identifier("call"), false, true), [thisNode, ...args], false);
    }

    return callExpression(memberExpression(callee, identifier("call")), [thisNode, ...args]);
  }
}
}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1679192551670);
})()
//miniprogram-npm-outsideDeps=["@babel/types"]
//# sourceMappingURL=index.js.map