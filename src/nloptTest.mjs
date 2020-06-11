// import nlopt from '../dist/index.js'
import nlopt from './nlopt.mjs'

function test() {
  // JS 
  // LD_SLSQP (all) LD_AUGLAG (w/ LD_LBFGS, LD_MMA, LD_COBYLA) (LD_AUGLAG_EQ for MMA | COBYLA)
  const opt = new nlopt.Optimize(nlopt.Algorithm.LD_AUGLAG, 2);
  opt.setMinObjective((x, grad) => {
    if (grad) {
      grad[0] = 0
      grad[1] = 0.5 / Math.sqrt(x[1])
    }
    return Math.sqrt(x[1])
  }, 1e-4)

  // const p1 = { a: 2, b: 0 }
  // opt.addInequalityConstraint((x, grad) => {
  //   if (grad) {
  //     grad[0] = 3 * p1.a * Math.pow(p1.a * x[0] + p1.b, 2)
  //     grad[1] = -1.0
  //   }
  //   return (Math.pow(p1.a * x[0] + p1.b, 3) - x[1])
  // }, 1e-8)

  // const p2 = { a: -1, b: 1 }
  // opt.addInequalityConstraint((x, grad) => {
  //   if (grad) {
  //     grad[0] = 3 * p2.a * Math.pow(p2.a * x[0] + p2.b, 2)
  //     grad[1] = -1.0
  //   }
  //   return (Math.pow(p2.a * x[0] + p2.b, 3) - x[1])
  // }, 1e-8)

  // Vector constraint
  const p1 = { a: 2, b: 0 }
  const p2 = { a: -1, b: 1 }
  opt.addEqualityMConstraint(nlopt.VectorFunction.fromLambda((x, grad, r) => {
    if (grad) {
      grad[0] = 3 * p1.a * Math.pow(p1.a * x[0] + p1.b, 2)
      grad[1] = -1.0
      grad[2] = 3 * p2.a * Math.pow(p2.a * x[0] + p2.b, 2)
      grad[3] = -1.0
    }
    r[0] = (Math.pow(p1.a * x[0] + p1.b, 3) - x[1])
    r[1] = (Math.pow(p2.a * x[0] + p2.b, 3) - x[1])
  }), [1e-8, 1e-8]);


  opt.setLowerBounds([-1e500, 1e-8]);

  // Create local optimizer
  const localOpt = new nlopt.Optimize(nlopt.Algorithm.LD_LBFGS, 2);
  opt.setLocalOptimizer(localOpt);


  const res = opt.optimize([1.234, 5.678]);
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