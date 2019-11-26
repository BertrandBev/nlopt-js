const Module = require('../nlopt-js/nlopt.js');


Module.ready = _ => {
  Module.Vector.fromArray = function (arr) {
    const v = new Module.Vector();
    arr.forEach(val => v.push_back(val));
    return v;
  }

  const Optimize = Module.Optimize;

  var objective = Module.Objective.implement({
    value: function (n, x, grad) {
      // console.log('value called', n, x.get(0), x.get(1), grad.get(0), grad.get(1), x.size(), grad.size());
      const newGrad = Module.Vector.fromArray([
        0,
        0.5 / Math.sqrt(x.get(1))
      ])
      const value = Math.sqrt(x.get(1));
      return { grad: newGrad, value }
    }
  });
  const opt = new Optimize(objective);
  // opt.doubleTest([1, 2, 3])
};