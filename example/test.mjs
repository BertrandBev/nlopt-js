import nlopt from 'nlopt-js'

(async () => {
  await nlopt.ready
  const opt = new nlopt.Optimize(nlopt.Algorithm.LD_SLSQP, 2);
  opt.setMinObjective((x, grad) => {
    if (grad) {
      grad[0] = 0;
      grad[1] = 0.5 / Math.sqrt(x[1]);
    }
    return Math.sqrt(x[1]);
  }, 1e-4);
  const res = opt.optimize([1, 6]);
  console.log('result:', res);
  nlopt.GC.flush();
})()