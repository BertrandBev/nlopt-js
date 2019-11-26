/* eslint-disable */
const BROWSER = typeof window === 'object'

let Module = {}
if (BROWSER) {
  const wasm = require('./nlopt_gen.wasm')
  Module = { wasmBinary: wasm }
  window.Module = Module
  require('./nlopt_gen.js')
} else {
  Module = require('./nlopt_gen.js')
}
const HashMap = require('./hashmap.js')


function getStaticMethods(Class) {
  return Object.getOwnPropertyNames(Class).filter(prop => prop !== "constructor" && typeof Class[prop] === "function");
}

class GarbageCollector {
  static objects = new Set()
  static whitelist = new HashMap() // Reference count

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

/**
 * Equip class to add constructor feedback
 * @param  {object} Class class to wrap
 * @returns {object} wrapped class
 */
function initClass(Class) {
  const NewClass = function (...args) {
    const instance = new Class(...args)
    GarbageCollector.add(instance)
    return instance
  }
  const arr = [Class, Class.prototype] // forEach doesn't seem to work
  for (let idx in arr) {
    let obj = arr[idx]
    getStaticMethods(obj).forEach(method => {
      const fun = obj[method]
      obj[method] = function (...args) {
        const rtn = fun.call(this, ...args)
        if (rtn instanceof Class) {
          GarbageCollector.add(rtn)
        }
        return rtn
      }
    })
  }

  // Class.prototype.constructor = NewClass TODO: control
  getStaticMethods(Class).forEach(method => { NewClass[method] = Class[method]; })
  NewClass.prototype = Class.prototype
  return NewClass
}

/**
 * Add helper functions TODO: extract in file
 */
function addHelpers(Module) {
}


const defExport = {
  GC: GarbageCollector,
  ready: () => { } // Override if needed
}

Module.onRuntimeInitialized = _ => {
  const classes = ["Optimize", "Objective", "Vector"]
  classes.forEach(className => {
    defExport[className] = initClass(Module[className])
  })
  addHelpers(defExport);
  defExport.ready()
}

module.exports = defExport;