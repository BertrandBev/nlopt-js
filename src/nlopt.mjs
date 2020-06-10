/* eslint-disable */
import nlopt_gen from '../build/nlopt_gen.js'
import wasm from '../build/nlopt_gen.wasm'  // Comment out for local testing
import GC from './GC.mjs'

const Module = nlopt_gen({
  wasmBinary: wasm // Comment out for local testing
});

/**
 * Add helper functions TODO: extract in file
 */
function addHelpers(nlopt) {
  // Vector helper
  nlopt.Vector.fromArray = function (arr) {
    const v = new nlopt.Vector();
    arr.forEach(val => v.push_back(val));
    return v;
  }

  // Scalar function helper
  nlopt.ScalarFunction.fromLambda = (fun) => {
    return nlopt.ScalarFunction.implement({
      value: (n, xPtr, gradPtr) => {
        const x = new Float64Array(nlopt.HEAPF64.buffer, xPtr, n);
        const grad = gradPtr ? new Float64Array(nlopt.HEAPF64.buffer, gradPtr, n) : null;
        return fun(x, grad)
      }
    })
  }

  // Scalar function helper
  nlopt.VectorFunction.fromLambda = (fun) => {
    return nlopt.VectorFunction.implement({
      value: (m, rPtr, n, xPtr, gradPtr) => {
        const x = new Float64Array(nlopt.HEAPF64.buffer, xPtr, n);
        const r = new Float64Array(nlopt.HEAPF64.buffer, rPtr, m);
        const grad = gradPtr ? new Float64Array(nlopt.HEAPF64.buffer, gradPtr, n * m) : null;
        return fun(x, grad, r)
      }
    })
  }
}

const nlopt = {
  GC: GC
}

nlopt.ready = Module.then(module => {
  const classes = new Set([
    "Vector",
    "Optimize",
    "ScalarFunction",
    "VectorFunction",
  ])
  classes.forEach(className => {
    nlopt[className] = GC.initClass(classes, module[className])
  })
  // TODO: create enum list?
  nlopt.Algorithm = module.Algorithm
  nlopt.HEAPF64 = module.HEAPF64
  addHelpers(nlopt);
})

export default nlopt