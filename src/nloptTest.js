const nlopt = require('../dist/index.js');

function test() {
  // JS
  const opt = new nlopt.Optimize(nlopt.Algorithm.LD_SLSQP, 2);
  opt.set_min_objective(nlopt.ScalarFunction.fromLambda((x, grad) => {
    if (grad) {
      grad[0] = 0
      grad[1] = 0.5 / Math.sqrt(x[1])
    }
    return Math.sqrt(x[1])
  }), 1e-4)

  // const p1 = { a: 2, b: 0 }
  // opt.add_inequality_constraint(nlopt.ScalarFunction.fromLambda((x, grad) => {
  //   if (grad) {
  //     grad[0] = 3 * p1.a * Math.pow(p1.a * x[0] + p1.b, 2)
  //     grad[1] = -1.0
  //   }
  //   return (Math.pow(p1.a * x[0] + p1.b, 3) - x[1])
  // }), 1e-8)

  // const p2 = { a: -1, b: 1 }
  // opt.add_inequality_constraint(nlopt.ScalarFunction.fromLambda((x, grad) => {
  //   if (grad) {
  //     grad[0] = 3 * p2.a * Math.pow(p2.a * x[0] + p2.b, 2)
  //     grad[1] = -1.0
  //   }
  //   return (Math.pow(p2.a * x[0] + p2.b, 3) - x[1])
  // }), 1e-8)

  // Vector constraint
  const p1 = { a: 2, b: 0 }
  const p2 = { a: -1, b: 1 }
  opt.add_equality_mconstraint(nlopt.VectorFunction.fromLambda((x, grad, r) => {
    if (grad) {
      grad[0] = 3 * p1.a * Math.pow(p1.a * x[0] + p1.b, 2)
      grad[1] = -1.0
      grad[2] = 3 * p2.a * Math.pow(p2.a * x[0] + p2.b, 2)
      grad[3] = -1.0
    }
    r[0] = (Math.pow(p1.a * x[0] + p1.b, 3) - x[1])
    r[1] = (Math.pow(p2.a * x[0] + p2.b, 3) - x[1])
  }), nlopt.Vector.fromArray([1e-8, 1e-8]))


  opt.set_lower_bounds(nlopt.Vector.fromArray([-1e500, 1e-8]))
  const res = opt.optimize(nlopt.Vector.fromArray([1.234, 5.678]))
  console.log('res', res)
  // console.log(res.x.get(0), res.x.get(1), res.value)
}

nlopt.ready.then(() => {
  // console.log('nlopt', nlopt, 'alg', nlopt.Algorithm.LD_SLSQP)
  // let d = new Date()
  // console.log('C++: ', (new Date() - d), 'ms')

  // C++
  let opt = new nlopt.Optimize(nlopt.Algorithm.LD_SLSQP, 2);
  opt.benchmark()

  // JS
  for (let k = 0; k < 100; k++) {
    test()
    test()
    test()
  }
  nlopt.GC.flush()
});