/**
 * The NLopt API revolves around an object of this class. Via methods of this object, all of the parameters of the optimization are specified (dimensions, algorithm, stopping criteria, constraints, objective function, etcetera), and then one finally calls the 'optimize' method in order to perform the optimization.
 */
class Optimize {
  /**
   * Creates a m * n matrix filled with zeros
   * @param {Algorithm} algorithm - One of the possible optimization Algorithms
   * @param {number} n - Dimensionality of the problem (number of optimization parameters)
   * @example
   * const opt = new nlopt.Optimize(nlopt.Algorithm.LD_AUGLAG, 2);
   * return opt;
   */
  constructor(algorithm, n) { }


  /**
   * Specify the objective function to maximize
   * The objective function should be of the form
   *    (x: number[], grad: number[]) => number
   *    - x is the current optimization point
   *    - grad, if non null, must be populated with the gradient of the function at that point
   *    The function must return the objective function at that point
   * @param {Function} fun - Objective function
   * @param {number} tol - Maximization tolerance
   * @example
   * const opt = new nlopt.Optimize(nlopt.Algorithm.LD_AUGLAG, 2);
   * opt.setMaxObjective((x, grad) => {
   *   if (grad) {
   *     grad[0] = 0;
   *     grad[1] = 0.5 / Math.sqrt(x[1]);
   *   }
   *   return Math.sqrt(x[1]);
   * }, 1e-4);
   * return opt;
   */
  setMaxObjective(fun, tol) { }

  /**
   * Specify the objective function to minimize
   * Similar to 'setMaxObjective', see above
   * @param {fun} fun - Objective function
   * @param {number} tol - Maximization tolerance
   */
  setMinObjective(fun, tol) { }

  /**
   * Specify an upper bound contraint on the optimization parameters
   * @param {Array} bounds - Upper bound array
   * @example
   * const opt = new nlopt.Optimize(nlopt.Algorithm.LD_AUGLAG, 2);
   * opt.setUpperBounds([2, 5]);
   * return opt;
   */
  setUpperBounds(bounds) { }

  /**
   * Specify a lower bound contraint on the optimization parameters
   * @param {Array} bounds - Lower bound array
   * @example
   * const opt = new nlopt.Optimize(nlopt.Algorithm.LD_AUGLAG, 2);
   * opt.setLowerBounds([-2, -5]);
   * return opt;
   */
  setLowerBounds(bounds) { }

  /**
   * Add a inequality constraint can be specified. the parameters are the same as 'setMinObjective' and 'setMaxObjective'
   * @param {Function} fun - Constraint function
   * @param {number} tol - Tolerance
   * @example
   * const opt = new nlopt.Optimize(nlopt.Algorithm.LD_AUGLAG, 2);
   * const p1 = { a: 2, b: 0 };
   * opt.addInequalityConstraint((x, grad) => {
   *   if (grad) {
   *     grad[0] = 3 * p1.a * Math.pow(p1.a * x[0] + p1.b, 2);
   *     grad[1] = -1.0;
   *   }
   *   return (Math.pow(p1.a * x[0] + p1.b, 3) - x[1]);
   * }, 1e-8);
   * return opt;
   */
  addInequalityConstraint(fun, tol) { }

  /**
   * Add a equality constraint. The parameters are the same as 'addInequalityConstraint'
   * @param {Function} fun - Constraint function
   * @param {number} tol - Tolerance
   */
  addEqualityConstraint(fun, tol) { }

  /**
   * Add a vector valued inequality constraints
   * The constraint function should be of the form
   *    (x: number[], grad: number[], r: number[]) => number
   *    - x is the current optimization point
   *    - grad, if non null, must be populated with the gradient of the function at that point
   *    - r is the vector value of the constraints
   *    The function must return the objective function at that point
   * @param {Function} fun - Constraint function
   * @param {Array} tol - Tolerance array, one per constraint
   * @example
   * const opt = new nlopt.Optimize(nlopt.Algorithm.LD_AUGLAG, 2);
   * const p1 = { a: 2, b: 0 };
   * const p2 = { a: -1, b: 1 };
   * opt.addEqualityMConstraint((x, grad, r) => {
   *   if (grad) {
   *     grad[0] = 3 * p1.a * Math.pow(p1.a * x[0] + p1.b, 2);
   *     grad[1] = -1.0;
   *     grad[2] = 3 * p2.a * Math.pow(p2.a * x[0] + p2.b, 2);
   *     grad[3] = -1.0;
   *   }
   *   r[0] = (Math.pow(p1.a * x[0] + p1.b, 3) - x[1]);
   *   r[1] = (Math.pow(p2.a * x[0] + p2.b, 3) - x[1]);
   * }, [1e-8, 1e-8]);
   * return opt;
   */
  addInequalityMConstraint(fun, tol) { }

  /**
   * Add a vector valued equality constraints. The parameters are the same as 'addInequalityMConstraint'
   * @param {Function} fun - Constraint function
   * @param {Array} tol - Tolerance
   */
  addEqualityMConstraint(fun, tol) { }

  /**
   * Set a max time stopping criterion
   * @param {number} t - Max optimisation time
   */
  setMaxtime(t) { }

  /**
   * Set a max evaluation stopping criterion
   * @param {number} count - Max evalutation count
   */
  setMaxeval(count) { }

  /**
   * Run the optimizer, and returns upon completion an object containing the optimized values of the optimization parameters as well as the corresponding value of the objective function
   * @param {Array} x0 - Initial guess for the optimization parameters
   * @returns {Object} - { x: number[], value: number }
   * @example
   * const opt = new nlopt.Optimize(nlopt.Algorithm.LD_AUGLAG, 2);
   * opt.setMinObjective((x, grad) => {
   *   if (grad) {
   *     grad[0] = 0;
   *     grad[1] = 0.5 / Math.sqrt(x[1]);
   *   }
   *   return Math.sqrt(x[1]);
   * }, 1e-4);
   * opt.setLowerBounds([-1e500, 1e-8]);
   * const p1 = { a: 2, b: 0 };
   * const p2 = { a: -1, b: 1 };
   * opt.addEqualityMConstraint((x, grad, r) => {
   *   if (grad) {
   *     grad[0] = 3 * p1.a * Math.pow(p1.a * x[0] + p1.b, 2);
   *     grad[1] = -1.0;
   *     grad[2] = 3 * p2.a * Math.pow(p2.a * x[0] + p2.b, 2);
   *     grad[3] = -1.0;
   *   }
   *   r[0] = (Math.pow(p1.a * x[0] + p1.b, 3) - x[1]);
   *   r[1] = (Math.pow(p2.a * x[0] + p2.b, 3) - x[1]);
   * }, [1e-8, 1e-8]);
   * const res = opt.optimize([1, 6]);
   * return {x: res.x, value: res.value};
   */
  optimize(x0) { }
}