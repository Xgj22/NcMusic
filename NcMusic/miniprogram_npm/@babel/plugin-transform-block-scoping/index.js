module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1679192551692, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _helperPluginUtils = require("@babel/helper-plugin-utils");
var _core = require("@babel/core");
var _loop = require("./loop");
var _validation = require("./validation");
var _annexB_3_ = require("./annex-B_3_3");
var _default = (0, _helperPluginUtils.declare)((api, opts) => {
  api.assertVersion(7);
  const {
    throwIfClosureRequired = false,
    tdz: tdzEnabled = false
  } = opts;
  if (typeof throwIfClosureRequired !== "boolean") {
    throw new Error(`.throwIfClosureRequired must be a boolean, or undefined`);
  }
  if (typeof tdzEnabled !== "boolean") {
    throw new Error(`.tdz must be a boolean, or undefined`);
  }
  return {
    name: "transform-block-scoping",
    visitor: _core.traverse.visitors.merge([_annexB_3_.annexB33FunctionsVisitor, {
      Loop(path, state) {
        const isForStatement = path.isForStatement();
        const headPath = isForStatement ? path.get("init") : path.isForXStatement() ? path.get("left") : null;
        let needsBodyWrap = false;
        const markNeedsBodyWrap = () => {
          if (throwIfClosureRequired) {
            throw path.buildCodeFrameError("Compiling let/const in this block would add a closure " + "(throwIfClosureRequired).");
          }
          needsBodyWrap = true;
        };
        const body = path.get("body");
        let bodyScope;
        if (body.isBlockStatement()) {
          bodyScope = body.scope;
          const bindings = (0, _loop.getLoopBodyBindings)(path);
          for (const binding of bindings) {
            const {
              capturedInClosure
            } = (0, _loop.getUsageInBody)(binding, path);
            if (capturedInClosure) markNeedsBodyWrap();
          }
        }
        const captured = [];
        const updatedBindingsUsages = new Map();
        if (headPath && isBlockScoped(headPath.node)) {
          const names = Object.keys(headPath.getBindingIdentifiers());
          const headScope = headPath.scope;
          for (let name of names) {
            var _bodyScope;
            if ((_bodyScope = bodyScope) != null && _bodyScope.hasOwnBinding(name)) continue;
            let binding = headScope.getOwnBinding(name);
            if (!binding) {
              headScope.crawl();
              binding = headScope.getOwnBinding(name);
            }
            const {
              usages,
              capturedInClosure,
              hasConstantViolations
            } = (0, _loop.getUsageInBody)(binding, path);
            if (headScope.parent.hasBinding(name) || headScope.parent.hasGlobal(name)) {
              const newName = headScope.generateUid(name);
              headScope.rename(name, newName);
              name = newName;
            }
            if (capturedInClosure) {
              markNeedsBodyWrap();
              captured.push(name);
            }
            if (isForStatement && hasConstantViolations) {
              updatedBindingsUsages.set(name, usages);
            }
          }
        }
        if (needsBodyWrap) {
          const varPath = (0, _loop.wrapLoopBody)(path, captured, updatedBindingsUsages);
          if (headPath != null && headPath.isVariableDeclaration()) {
            transformBlockScopedVariable(headPath, state, tdzEnabled);
          }
          varPath.get("declarations.0.init").unwrapFunctionEnvironment();
        }
      },
      VariableDeclaration(path, state) {
        transformBlockScopedVariable(path, state, tdzEnabled);
      },
      ClassDeclaration(path) {
        const {
          id
        } = path.node;
        if (!id) return;
        const {
          scope
        } = path.parentPath;
        if (!(0, _annexB_3_.isVarScope)(scope) && scope.parent.hasBinding(id.name, {
          noUids: true
        })) {
          path.scope.rename(id.name);
        }
      }
    }])
  };
});
exports.default = _default;
const conflictingFunctionsVisitor = {
  Scope(path, {
    names
  }) {
    for (const name of names) {
      const binding = path.scope.getOwnBinding(name);
      if (binding && binding.kind === "hoisted") {
        path.scope.rename(name);
      }
    }
  },
  "Expression|Declaration"(path) {
    path.skip();
  }
};
function transformBlockScopedVariable(path, state, tdzEnabled) {
  if (!isBlockScoped(path.node)) return;
  const dynamicTDZNames = (0, _validation.validateUsage)(path, state, tdzEnabled);
  path.node.kind = "var";
  const bindingNames = Object.keys(path.getBindingIdentifiers());
  for (const name of bindingNames) {
    const binding = path.scope.getOwnBinding(name);
    if (!binding) continue;
    binding.kind = "var";
  }
  if (isInLoop(path) && !(0, _loop.isVarInLoopHead)(path) || dynamicTDZNames.length > 0) {
    for (const decl of path.node.declarations) {
      var _decl$init;
      (_decl$init = decl.init) != null ? _decl$init : decl.init = path.scope.buildUndefinedNode();
    }
  }
  const blockScope = path.scope;
  const varScope = blockScope.getFunctionParent() || blockScope.getProgramParent();
  if (varScope !== blockScope) {
    for (const name of bindingNames) {
      let newName = name;
      if (blockScope.parent.hasBinding(name, {
        noUids: true
      }) || blockScope.parent.hasGlobal(name)) {
        newName = blockScope.generateUid(name);
        blockScope.rename(name, newName);
      }
      blockScope.moveBindingTo(newName, varScope);
    }
  }
  blockScope.path.traverse(conflictingFunctionsVisitor, {
    names: bindingNames
  });
  for (const name of dynamicTDZNames) {
    path.scope.push({
      id: _core.types.identifier(name),
      init: state.addHelper("temporalUndefined")
    });
  }
}
function isLetOrConst(kind) {
  return kind === "let" || kind === "const";
}
function isInLoop(path) {
  if (!path.parentPath) return false;
  if (path.parentPath.isLoop()) return true;
  if (path.parentPath.isFunctionParent()) return false;
  return isInLoop(path.parentPath);
}
function isBlockScoped(node) {
  if (!_core.types.isVariableDeclaration(node)) return false;
  if (node[_core.types.BLOCK_SCOPED_SYMBOL]) {
    return true;
  }
  if (!isLetOrConst(node.kind) && node.kind !== "using") {
    return false;
  }
  return true;
}

//# sourceMappingURL=index.js.map

}, function(modId) {var map = {"./loop":1679192551693,"./validation":1679192551694,"./annex-B_3_3":1679192551695}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1679192551693, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLoopBodyBindings = getLoopBodyBindings;
exports.getUsageInBody = getUsageInBody;
exports.isVarInLoopHead = isVarInLoopHead;
exports.wrapLoopBody = wrapLoopBody;
var _core = require("@babel/core");
const collectLoopBodyBindingsVisitor = {
  "Expression|Declaration|Loop"(path) {
    path.skip();
  },
  Scope(path, state) {
    if (path.isFunctionParent()) path.skip();
    const {
      bindings
    } = path.scope;
    for (const name of Object.keys(bindings)) {
      const binding = bindings[name];
      if (binding.kind === "let" || binding.kind === "const" || binding.kind === "hoisted") {
        state.blockScoped.push(binding);
      }
    }
  }
};
function getLoopBodyBindings(loopPath) {
  const state = {
    blockScoped: []
  };
  loopPath.traverse(collectLoopBodyBindingsVisitor, state);
  return state.blockScoped;
}
function getUsageInBody(binding, loopPath) {
  const seen = new WeakSet();
  let capturedInClosure = false;
  const constantViolations = filterMap(binding.constantViolations, path => {
    const {
      inBody,
      inClosure
    } = relativeLoopLocation(path, loopPath);
    if (!inBody) return null;
    capturedInClosure || (capturedInClosure = inClosure);
    const id = path.isUpdateExpression() ? path.get("argument") : path.isAssignmentExpression() ? path.get("left") : null;
    if (id) seen.add(id.node);
    return id;
  });
  const references = filterMap(binding.referencePaths, path => {
    if (seen.has(path.node)) return null;
    const {
      inBody,
      inClosure
    } = relativeLoopLocation(path, loopPath);
    if (!inBody) return null;
    capturedInClosure || (capturedInClosure = inClosure);
    return path;
  });
  return {
    capturedInClosure,
    hasConstantViolations: constantViolations.length > 0,
    usages: references.concat(constantViolations)
  };
}
function relativeLoopLocation(path, loopPath) {
  const bodyPath = loopPath.get("body");
  let inClosure = false;
  for (let currPath = path; currPath; currPath = currPath.parentPath) {
    if (currPath.isFunction() || currPath.isClass()) inClosure = true;
    if (currPath === bodyPath) {
      return {
        inBody: true,
        inClosure
      };
    } else if (currPath === loopPath) {
      return {
        inBody: false,
        inClosure
      };
    }
  }
  throw new Error("Internal Babel error: path is not in loop. Please report this as a bug.");
}
const collectCompletionsAndVarsVisitor = {
  Function(path) {
    path.skip();
  },
  LabeledStatement: {
    enter({
      node
    }, state) {
      state.labelsStack.push(node.label.name);
    },
    exit({
      node
    }, state) {
      const popped = state.labelsStack.pop();
      if (popped !== node.label.name) {
        throw new Error("Assertion failure. Please report this bug to Babel.");
      }
    }
  },
  Loop: {
    enter(_, state) {
      state.labellessContinueTargets++;
      state.labellessBreakTargets++;
    },
    exit(_, state) {
      state.labellessContinueTargets--;
      state.labellessBreakTargets--;
    }
  },
  SwitchStatement: {
    enter(_, state) {
      state.labellessBreakTargets++;
    },
    exit(_, state) {
      state.labellessBreakTargets--;
    }
  },
  "BreakStatement|ContinueStatement"(path, state) {
    const {
      label
    } = path.node;
    if (label) {
      if (state.labelsStack.includes(label.name)) return;
    } else if (path.isBreakStatement() ? state.labellessBreakTargets > 0 : state.labellessContinueTargets > 0) {
      return;
    }
    state.breaksContinues.push(path);
  },
  ReturnStatement(path, state) {
    state.returns.push(path);
  },
  VariableDeclaration(path, state) {
    if (path.parent === state.loopNode && isVarInLoopHead(path)) return;
    if (path.node.kind === "var") state.vars.push(path);
  }
};
function wrapLoopBody(loopPath, captured, updatedBindingsUsages) {
  const loopNode = loopPath.node;
  const state = {
    breaksContinues: [],
    returns: [],
    labelsStack: [],
    labellessBreakTargets: 0,
    labellessContinueTargets: 0,
    vars: [],
    loopNode
  };
  loopPath.traverse(collectCompletionsAndVarsVisitor, state);
  const callArgs = [];
  const closureParams = [];
  const updater = [];
  for (const [name, updatedUsage] of updatedBindingsUsages) {
    callArgs.push(_core.types.identifier(name));
    const innerName = loopPath.scope.generateUid(name);
    closureParams.push(_core.types.identifier(innerName));
    updater.push(_core.types.assignmentExpression("=", _core.types.identifier(name), _core.types.identifier(innerName)));
    for (const path of updatedUsage) path.replaceWith(_core.types.identifier(innerName));
  }
  for (const name of captured) {
    if (updatedBindingsUsages.has(name)) continue;
    callArgs.push(_core.types.identifier(name));
    closureParams.push(_core.types.identifier(name));
  }
  const id = loopPath.scope.generateUid("loop");
  const fn = _core.types.functionExpression(null, closureParams, _core.types.toBlock(loopNode.body));
  let call = _core.types.callExpression(_core.types.identifier(id), callArgs);
  const fnParent = loopPath.findParent(p => p.isFunction());
  if (fnParent) {
    const {
      async,
      generator
    } = fnParent.node;
    fn.async = async;
    fn.generator = generator;
    if (generator) call = _core.types.yieldExpression(call, true);else if (async) call = _core.types.awaitExpression(call);
  }
  const updaterNode = updater.length > 0 ? _core.types.expressionStatement(_core.types.sequenceExpression(updater)) : null;
  if (updaterNode) fn.body.body.push(updaterNode);
  const [varPath] = loopPath.insertBefore(_core.types.variableDeclaration("var", [_core.types.variableDeclarator(_core.types.identifier(id), fn)]));
  const bodyStmts = [];
  const varNames = [];
  for (const varPath of state.vars) {
    const assign = [];
    for (const decl of varPath.node.declarations) {
      varNames.push(...Object.keys(_core.types.getBindingIdentifiers(decl.id)));
      if (decl.init) {
        assign.push(_core.types.assignmentExpression("=", decl.id, decl.init));
      }
    }
    if (assign.length > 0) {
      let replacement = assign.length === 1 ? assign[0] : _core.types.sequenceExpression(assign);
      if (!_core.types.isForStatement(varPath.parent, {
        init: varPath.node
      }) && !_core.types.isForXStatement(varPath.parent, {
        left: varPath.node
      })) {
        replacement = _core.types.expressionStatement(replacement);
      }
      varPath.replaceWith(replacement);
    } else {
      varPath.remove();
    }
  }
  if (varNames.length) {
    bodyStmts.push(_core.types.variableDeclaration("var", varNames.map(name => _core.types.variableDeclarator(_core.types.identifier(name)))));
  }
  if (state.breaksContinues.length === 0 && state.returns.length === 0) {
    bodyStmts.push(_core.types.expressionStatement(call));
  } else {
    const completionId = loopPath.scope.generateUid("ret");
    bodyStmts.push(_core.types.variableDeclaration("var", [_core.types.variableDeclarator(_core.types.identifier(completionId), call)]));
    const injected = new Set();
    for (const path of state.breaksContinues) {
      const {
        node
      } = path;
      const {
        type,
        label
      } = node;
      let name = type === "BreakStatement" ? "break" : "continue";
      if (label) name += "|" + label.name;
      path.replaceWith(_core.types.returnStatement(_core.types.stringLiteral(name)));
      if (updaterNode) path.insertBefore(_core.types.cloneNode(updaterNode));
      if (injected.has(name)) continue;
      injected.add(name);
      bodyStmts.push(_core.template.statement.ast`
        if (
          ${_core.types.identifier(completionId)} === ${_core.types.stringLiteral(name)}
        ) ${node}
      `);
    }
    if (state.returns.length) {
      for (const path of state.returns) {
        const arg = path.node.argument || path.scope.buildUndefinedNode();
        path.replaceWith(_core.template.statement.ast`
          return { v: ${arg} };
        `);
      }
      bodyStmts.push(_core.template.statement.ast`
        if (typeof ${_core.types.identifier(completionId)} === "object")
          return ${_core.types.identifier(completionId)}.v;
      `);
    }
  }
  loopNode.body = _core.types.blockStatement(bodyStmts);
  return varPath;
}
function isVarInLoopHead(path) {
  if (_core.types.isForStatement(path.parent)) return path.key === "init";
  if (_core.types.isForXStatement(path.parent)) return path.key === "left";
  return false;
}
function filterMap(list, fn) {
  const result = [];
  for (const item of list) {
    const mapped = fn(item);
    if (mapped) result.push(mapped);
  }
  return result;
}

//# sourceMappingURL=loop.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1679192551694, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateUsage = validateUsage;
var _core = require("@babel/core");
function validateUsage(path, state, tdzEnabled) {
  const dynamicTDZNames = [];
  for (const name of Object.keys(path.getBindingIdentifiers())) {
    const binding = path.scope.getBinding(name);
    if (!binding) continue;
    if (tdzEnabled) {
      if (injectTDZChecks(binding, state)) dynamicTDZNames.push(name);
    }
    if (path.node.kind === "const") {
      disallowConstantViolations(name, binding, state);
    }
  }
  return dynamicTDZNames;
}
function disallowConstantViolations(name, binding, state) {
  for (const violation of binding.constantViolations) {
    const readOnlyError = state.addHelper("readOnlyError");
    const throwNode = _core.types.callExpression(readOnlyError, [_core.types.stringLiteral(name)]);
    if (violation.isAssignmentExpression()) {
      const {
        operator,
        left,
        right
      } = violation.node;
      if (operator === "=") {
        const exprs = [right];
        exprs.push(throwNode);
        violation.replaceWith(_core.types.sequenceExpression(exprs));
      } else if (["&&=", "||=", "??="].includes(operator)) {
        violation.replaceWith(_core.types.logicalExpression(operator.slice(0, -1), left, _core.types.sequenceExpression([right, throwNode])));
      } else {
        violation.replaceWith(_core.types.sequenceExpression([_core.types.binaryExpression(operator.slice(0, -1), left, right), throwNode]));
      }
    } else if (violation.isUpdateExpression()) {
      violation.replaceWith(_core.types.sequenceExpression([_core.types.unaryExpression("+", violation.get("argument").node), throwNode]));
    } else if (violation.isForXStatement()) {
      violation.ensureBlock();
      violation.get("left").replaceWith(_core.types.variableDeclaration("var", [_core.types.variableDeclarator(violation.scope.generateUidIdentifier(name))]));
      violation.node.body.body.unshift(_core.types.expressionStatement(throwNode));
    }
  }
}
function getTDZStatus(refPath, bindingPath) {
  const executionStatus = bindingPath._guessExecutionStatusRelativeTo(refPath);
  if (executionStatus === "before") {
    return "outside";
  } else if (executionStatus === "after") {
    return "inside";
  } else {
    return "maybe";
  }
}
const skipTDZChecks = new WeakSet();
function buildTDZAssert(status, node, state) {
  if (status === "maybe") {
    const clone = _core.types.cloneNode(node);
    skipTDZChecks.add(clone);
    return _core.types.callExpression(state.addHelper("temporalRef"), [clone, _core.types.stringLiteral(node.name)]);
  } else {
    return _core.types.callExpression(state.addHelper("tdz"), [_core.types.stringLiteral(node.name)]);
  }
}
function getTDZReplacement(path, state, id = path.node) {
  var _path$scope$getBindin;
  if (skipTDZChecks.has(id)) return;
  skipTDZChecks.add(id);
  const bindingPath = (_path$scope$getBindin = path.scope.getBinding(id.name)) == null ? void 0 : _path$scope$getBindin.path;
  if (!bindingPath || bindingPath.isFunctionDeclaration()) return;
  const status = getTDZStatus(path, bindingPath);
  if (status === "outside") return;
  if (status === "maybe") {
    bindingPath.parent._tdzThis = true;
  }
  return {
    status,
    node: buildTDZAssert(status, id, state)
  };
}
function injectTDZChecks(binding, state) {
  const allUsages = new Set(binding.referencePaths);
  binding.constantViolations.forEach(allUsages.add, allUsages);
  let dynamicTdz = false;
  for (const path of binding.constantViolations) {
    const {
      node
    } = path;
    if (skipTDZChecks.has(node)) continue;
    skipTDZChecks.add(node);
    if (path.isUpdateExpression()) {
      const arg = path.get("argument");
      const replacement = getTDZReplacement(path, state, arg.node);
      if (!replacement) continue;
      if (replacement.status === "maybe") {
        dynamicTdz = true;
        path.insertBefore(replacement.node);
      } else {
        path.replaceWith(replacement.node);
      }
    } else if (path.isAssignmentExpression()) {
      const nodes = [];
      const ids = path.getBindingIdentifiers();
      for (const name of Object.keys(ids)) {
        const replacement = getTDZReplacement(path, state, ids[name]);
        if (replacement) {
          nodes.push(_core.types.expressionStatement(replacement.node));
          if (replacement.status === "inside") break;
          if (replacement.status === "maybe") dynamicTdz = true;
        }
      }
      if (nodes.length > 0) path.insertBefore(nodes);
    }
  }
  for (const path of binding.referencePaths) {
    if (path.parentPath.isUpdateExpression()) continue;
    if (path.parentPath.isFor({
      left: path.node
    })) continue;
    const replacement = getTDZReplacement(path, state);
    if (!replacement) continue;
    if (replacement.status === "maybe") dynamicTdz = true;
    path.replaceWith(replacement.node);
  }
  return dynamicTdz;
}

//# sourceMappingURL=validation.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1679192551695, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.annexB33FunctionsVisitor = void 0;
exports.isVarScope = isVarScope;
var _core = require("@babel/core");
const annexB33FunctionsVisitor = {
  VariableDeclaration(path) {
    if (isStrict(path)) return;
    if (path.node.kind !== "var") return;
    const varScope = path.scope.getFunctionParent() || path.scope.getProgramParent();
    varScope.path.traverse(functionsToVarVisitor, {
      names: Object.keys(path.getBindingIdentifiers())
    });
  },
  BlockStatement(path) {
    if (isStrict(path)) return;
    if (_core.types.isFunction(path.parent, {
      body: path.node
    })) return;
    transformStatementList(path.get("body"));
  },
  SwitchCase(path) {
    if (isStrict(path)) return;
    transformStatementList(path.get("consequent"));
  }
};
exports.annexB33FunctionsVisitor = annexB33FunctionsVisitor;
function transformStatementList(paths) {
  outer: for (const path of paths) {
    if (!path.isFunctionDeclaration()) continue;
    if (path.node.async || path.node.generator) return;
    const {
      scope
    } = path.parentPath;
    if (isVarScope(scope)) return;
    const {
      name
    } = path.node.id;
    let currScope = scope;
    do {
      if (currScope.parent.hasOwnBinding(name)) continue outer;
      currScope = currScope.parent;
    } while (!isVarScope(currScope));
    maybeTransformBlockScopedFunction(path);
  }
}
function maybeTransformBlockScopedFunction(path) {
  const {
    node,
    parentPath: {
      scope
    }
  } = path;
  const {
    id
  } = node;
  scope.removeOwnBinding(id.name);
  node.id = null;
  const varNode = _core.types.variableDeclaration("var", [_core.types.variableDeclarator(id, _core.types.toExpression(node))]);
  varNode._blockHoist = 2;
  const [varPath] = path.replaceWith(varNode);
  scope.registerDeclaration(varPath);
}
const functionsToVarVisitor = {
  Scope(path, {
    names
  }) {
    for (const name of names) {
      const binding = path.scope.getOwnBinding(name);
      if (binding && binding.kind === "hoisted") {
        maybeTransformBlockScopedFunction(binding.path);
      }
    }
  },
  "Expression|Declaration"(path) {
    path.skip();
  }
};
function isVarScope(scope) {
  return scope.path.isFunctionParent() || scope.path.isProgram();
}
function isStrict(path) {
  return !!path.find(({
    node
  }) => {
    var _node$directives;
    if (_core.types.isProgram(node)) {
      if (node.sourceType === "module") return true;
    } else if (_core.types.isClass(node)) {
      return true;
    } else if (!_core.types.isBlockStatement(node)) {
      return false;
    }
    return (_node$directives = node.directives) == null ? void 0 : _node$directives.some(directive => directive.value.value === "use strict");
  });
}

//# sourceMappingURL=annex-B_3_3.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1679192551692);
})()
//miniprogram-npm-outsideDeps=["@babel/helper-plugin-utils","@babel/core"]
//# sourceMappingURL=index.js.map