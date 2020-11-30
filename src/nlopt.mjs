/* eslint-disable */
import nlopt_gen from '../build/nlopt_gen.js'
import wasm from '../build/nlopt_gen.wasm'  // Comment out for local testing
import GC from './GC.mjs'

const Module = nlopt_gen({
  wasmBinary: wasm // Comment out for local testing
});

/**
 * Add helper functions TODO: remove
 */
function addHelpers(module, nlopt) {
  // Vector helper
  module.Vector.fromArray = function (arr) {
    const v = new module.Vector();
    arr.forEach(val => v.push_back(val));
    return v;
  }

  module.Vector.toArray = function (vec) {
    const a = new Array(vec.size());
    for (let k = 0; k < vec.size(); k++)
      a[k] = vec.get(k);
    return a;
  }

  // Scalar function helper
  module.ScalarFunction.fromLambda = (fun) => {
    return module.ScalarFunction.implement({
      value: (n, xPtr, gradPtr) => {
        const x = new Float64Array(nlopt.HEAPF64.buffer, xPtr, n);
        const grad = gradPtr ? new Float64Array(nlopt.HEAPF64.buffer, gradPtr, n) : null;
        return fun(x, grad)
      }
    })
  }

  // Scalar function helper
  module.VectorFunction.fromLambda = (fun) => {
    return module.VectorFunction.implement({
      value: (m, rPtr, n, xPtr, gradPtr) => {
        const x = new Float64Array(nlopt.HEAPF64.buffer, xPtr, n);
        const r = new Float64Array(nlopt.HEAPF64.buffer, rPtr, m);
        const grad = gradPtr ? new Float64Array(nlopt.HEAPF64.buffer, gradPtr, n * m) : null;
        return fun(x, grad, r)
      }
    })
  }

  // Simplify arguments syntax of certain functions
  const argsTranformMap = {
    setLowerBounds: [module.Vector],
    setUpperBounds: [module.Vector],
    setMinObjective: [module.ScalarFunction, null],
    setMaxObjective: [module.ScalarFunction, null],
    addInequalityConstraint: [module.ScalarFunction, null],
    addEqualityConstraint: [module.ScalarFunction, null],
    addInequalityMConstraint: [module.VectorFunction, module.Vector],
    addEqualityMConstraint: [module.VectorFunction, module.Vector],
    optimize: [module.Vector],
  };
  Object.keys(argsTranformMap).forEach((method) => {
    const argsTransform = argsTranformMap[method];
    const fun = nlopt.Optimize.prototype[method]
    nlopt.Optimize.prototype[method] = function (...args) {
      for (let k = 0; k < args.length; k++) {
        const argTransform = argsTransform[k];
        if (argTransform == module.Vector)
          args[k] = module.Vector.fromArray(args[k]);
        else if (argTransform == module.VectorFunction)
          args[k] = module.VectorFunction.fromLambda(args[k]);
        else if (argTransform == module.ScalarFunction)
          args[k] = module.ScalarFunction.fromLambda(args[k]);
      }
      const rtn = fun.call(this, ...args);
      if (method == 'optimize' && rtn.x instanceof module.Vector)
        rtn.x = module.Vector.toArray(rtn.x);
      return rtn;
    }
  });
}

const nlopt = {
  GC: GC
}

nlopt.ready = Module.then(module => {
  // Publish classes
  const classes = new Set([
    "Optimize",
  ])
  classes.forEach(className => {
    nlopt[className] = GC.initClass(classes, module[className])
  })
  // Publish enums
  nlopt.Algorithm = module.Algorithm
  nlopt.HEAPF64 = module.HEAPF64
  addHelpers(module, nlopt);
})

export default nlopt