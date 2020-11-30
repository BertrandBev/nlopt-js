// import nlopt from '../dist/index.js'
import nlopt from './nlopt.mjs'
// import nlopt from 'nlopt-js'

function rosenbrock() {
  const opt = new nlopt.Optimize(nlopt.Algorithm.LD_SLSQP, 2);
  // Set min objective
  opt.setMinObjective((x, grad) => {
    if (grad) {
      grad[0] = 2 * x[0] - 400 * x[0] * (x[1] - Math.pow(x[0], 2)) - 2;
      grad[1] = 200 * (x[1] - Math.pow(x[0], 2));
    }
    return Math.pow(1 - x[0], 2) + 100 * Math.pow(x[1] - Math.pow(x[0], 2), 2);
  }, 1e-4);
  // Set constraint
  opt.addInequalityConstraint((x, grad) => {
    if (grad) {
      grad[0] = 2 * x[0];
      grad[1] = 2 * x[1];
    }
    return Math.pow(x[0], 2) + Math.pow(x[1], 2) - 2;
  }, 1e-4);
  // Optimize
  const res = opt.optimize([-1, -1]);
  console.log(res);
}

nlopt.ready.then(() => {
  rosenbrock();
  nlopt.GC.flush();
});