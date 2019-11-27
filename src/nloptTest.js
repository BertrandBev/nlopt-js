const Module = require('../nlopt-js/nlopt.js');


Module.ready = _ => {
  Module.Vector.fromArray = function (arr) {
    const v = new Module.Vector();
    arr.forEach(val => v.push_back(val));
    return v;
  }

  const Optimize = Module.Optimize;

  let d = new Date()
  for (let k = 0; k < 10000; k++) {
    let opt = new Optimize(2);
    opt.benchmark()
  }
  console.log('C++: ', (new Date() - d), 'ms')



  d = new Date()
  for (let k = 0; k < 10000; k++) {
    opt = new Optimize(2);

    opt.set_min_objective(Module.ScalarFunction.fromLambda((x, grad) => {
      if (grad) {
        grad[0] = 0
        grad[1] = 0.5 / Math.sqrt(x[1])
      }
      // console.log('obj', x, grad)
      return Math.sqrt(x[1])
    }), 1e-4)

    // opt.set_min_objective(Module.ScalarFunction.implement({
    //   value: (n, xPtr, gradPtr) => {
    //     console.log('min obj called', n, xPtr, gradPtr)
    //     return 0
    //   }
    // }), 1e-4);

    const p1 = { a: 2, b: 0 }
    opt.add_inequality_constraint(Module.ScalarFunction.fromLambda((x, grad) => {
      if (grad) {
        grad[0] = 3 * p1.a * Math.pow(p1.a * x[0] + p1.b, 2)
        grad[1] = -1.0
      }
      // console.log('i1', x, grad)
      return (Math.pow(p1.a * x[0] + p1.b, 3) - x[1])
    }), 1e-8)

    const p2 = { a: -1, b: 1 }
    opt.add_inequality_constraint(Module.ScalarFunction.fromLambda((x, grad) => {
      if (grad) {
        grad[0] = 3 * p2.a * Math.pow(p2.a * x[0] + p2.b, 2)
        grad[1] = -1.0
      }
      // console.log('i2', x, grad)
      return (Math.pow(p2.a * x[0] + p2.b, 3) - x[1])
    }), 1e-8)

    opt.set_lower_bounds(Module.Vector.fromArray([-1e500, 0]))
    const res = opt.optimize(Module.Vector.fromArray([1.234, 5.678]))
    // console.log(res.x.get(0), res.x.get(1), res.value)
    Module.GC.flush()
  }
  console.log('JS: ', (new Date() - d), 'ms')





  // opt.doubleTest([1, 2, 3])
};