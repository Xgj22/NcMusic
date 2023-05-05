module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1679192551688, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _helperPluginUtils = require("@babel/helper-plugin-utils");

var _pluginSyntaxFunctionSent = require("@babel/plugin-syntax-function-sent");

var _helperWrapFunction = require("@babel/helper-wrap-function");

var _core = require("@babel/core");

var _default = (0, _helperPluginUtils.declare)(api => {
  api.assertVersion(7);

  const isFunctionSent = node => _core.types.isIdentifier(node.meta, {
    name: "function"
  }) && _core.types.isIdentifier(node.property, {
    name: "sent"
  });

  const hasBeenReplaced = (node, sentId) => _core.types.isAssignmentExpression(node) && _core.types.isIdentifier(node.left, {
    name: sentId
  });

  const yieldVisitor = {
    Function(path) {
      path.skip();
    },

    YieldExpression(path) {
      if (!hasBeenReplaced(path.parent, this.sentId)) {
        path.replaceWith(_core.types.assignmentExpression("=", _core.types.identifier(this.sentId), path.node));
      }
    },

    MetaProperty(path) {
      if (isFunctionSent(path.node)) {
        path.replaceWith(_core.types.identifier(this.sentId));
      }
    }

  };
  return {
    name: "proposal-function-sent",
    inherits: _pluginSyntaxFunctionSent.default,
    visitor: {
      MetaProperty(path, state) {
        if (!isFunctionSent(path.node)) return;
        const fnPath = path.getFunctionParent();

        if (!fnPath.node.generator) {
          throw new Error("Parent generator function not found");
        }

        const sentId = path.scope.generateUid("function.sent");
        fnPath.traverse(yieldVisitor, {
          sentId
        });
        fnPath.node.body.body.unshift(_core.types.variableDeclaration("let", [_core.types.variableDeclarator(_core.types.identifier(sentId), _core.types.yieldExpression())]));
        (0, _helperWrapFunction.default)(fnPath, state.addHelper("skipFirstGeneratorNext"));
      }

    }
  };
});

exports.default = _default;
}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1679192551688);
})()
//miniprogram-npm-outsideDeps=["@babel/helper-plugin-utils","@babel/plugin-syntax-function-sent","@babel/helper-wrap-function","@babel/core"]
//# sourceMappingURL=index.js.map