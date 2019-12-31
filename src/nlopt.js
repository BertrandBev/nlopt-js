/* eslint-disable */
import HashMap from 'hashmap'
import nlopt_gen from '../build/nlopt_gen.js'
import wasm from '../build/nlopt_gen.wasm'
const Module = nlopt_gen({
  wasmBinary: wasm
});

function getStaticMethods(Class) {
  return Object.getOwnPropertyNames(Class).filter(prop => prop !== "constructor" && typeof Class[prop] === "function");
}

class GarbageCollector {
  static add(...addList) {
    addList.flat(Infinity).forEach(obj => {
      GarbageCollector.objects.add(obj)
    })
  }

  static pushException(...exceptionList) {
    exceptionList.flat(Infinity).forEach(obj => {
      const val = GarbageCollector.whitelist.get(obj) || 0
      GarbageCollector.whitelist.set(obj, val + 1)
    })
  }

  static popException(...exceptionList) {
    exceptionList.flat(Infinity).forEach(obj => {
      const val = GarbageCollector.whitelist.get(obj) || 0
      GarbageCollector.whitelist.set(obj, val - 1)
      if (GarbageCollector.whitelist.get(obj) <= 0) {
        GarbageCollector.whitelist.remove(obj)
      }
    })
  }

  static flush() {
    const flushed = [...GarbageCollector.objects].filter(
      obj => !GarbageCollector.whitelist.has(obj)
    )
    flushed.forEach(obj => {
      obj.delete()
      GarbageCollector.objects.delete(obj)
    })
    return flushed.length
  }

  /**
   * Smart reference bookkeeping
   */
  static set(ref, name, newObj) {
    if (ref[name]) {
      GarbageCollector.popException(ref[name])
    }
    GarbageCollector.pushException(newObj)
    ref[name] = newObj
  }
}
// Add static members
GarbageCollector.objects = new Set();
GarbageCollector.whitelist = new HashMap(); // Reference count


/**
 * Equip class to add constructor feedback
 * @param  {Set} classes Set of all the classes names
 * @param  {object} Class class to wrap
 * @returns {object} wrapped class
 */
function initClass(classes, Class) {
  const NewClass = function (...args) {
    const instance = new Class(...args)
    GarbageCollector.add(instance)
    return instance
  }
  const arr = [Class, Class.prototype] // forEach doesn't seem to work
  for (let idx in arr) {
    let obj = arr[idx]
    getStaticMethods(obj).forEach(method => {
      // console.log(`Wrapping reg method ${method} of ${Class}`)
      const fun = obj[method]
      obj[method] = function (...args) {
        const rtn = fun.call(this, ...args)
        if (rtn && classes.has(rtn.constructor.name)) {
          GarbageCollector.add(rtn)
        }
        return rtn
      }
    })
  }

  // Class.prototype.constructor = NewClass TODO: control
  getStaticMethods(Class).forEach(method => {
    NewClass[method] = Class[method];
  })
  NewClass.prototype = Class.prototype
  return NewClass
}

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
        const x = new Float64Array(Module.HEAPF64.buffer, xPtr, n);
        const grad = gradPtr ? new Float64Array(Module.HEAPF64.buffer, gradPtr, n) : null;
        return fun(x, grad)
      }
    })
  }

  // Scalar function helper
  nlopt.VectorFunction.fromLambda = (fun) => {
    return nlopt.VectorFunction.implement({
      value: (m, rPtr, n, xPtr, gradPtr) => {
        const x = new Float64Array(Module.HEAPF64.buffer, xPtr, n);
        const r = new Float64Array(Module.HEAPF64.buffer, rPtr, m);
        const grad = gradPtr ? new Float64Array(Module.HEAPF64.buffer, gradPtr, n * m) : null;
        return fun(x, grad, r)
      }
    })
  }
}

const nlopt = {
  GC: GarbageCollector
}

nlopt.ready = new Promise(resolve => {
  Module.onRuntimeInitialized = () => {
    const classes = new Set(["Vector", "Optimize", "ScalarFunction", "VectorFunction"])
    classes.forEach(className => {
      nlopt[className] = initClass(classes, Module[className])
    })
    nlopt.Algorithm = Module.Algorithm
    addHelpers(nlopt);
    resolve(nlopt)
  }
})

export default nlopt