#ifndef OPTIMIZE_H
#define OPTIMIZE_H

#include <string>
#include <iostream>
#include <vector>
#include <nlopt.hpp>
#include <math.h>
#include <emscripten/bind.h>

using namespace std::chrono;

using namespace std;

struct ScalarFunction
{
  virtual double value(unsigned n, int xPtr, int gradPtr) = 0;

  static double _value(unsigned n, const double *x, double *grad, void *my_func_data)
  {
    return ((ScalarFunction *)my_func_data)->value(n, (int)x, (int)grad);
  }

  virtual ~ScalarFunction(){};
};

struct VectorFunction
{
  virtual void value(unsigned m, int rPtr, unsigned n, int xPtr, int gradPtr) = 0;

  static void _value(unsigned m, double *result, unsigned n, const double *x, double *grad, void *my_func_data)
  {
    ((VectorFunction *)my_func_data)->value(m, (int)result, n, (int)x, (int)grad);
  }

  virtual ~VectorFunction(){};
};

typedef struct
{
  bool success;
  vector<double> x;
  double value;
} OptimizationResult;

typedef struct
{
  double a, b;
} my_constraint_data;

double myfunc(unsigned n, const double *x, double *grad, void *my_func_data)
{
  if (grad)
  {
    grad[0] = 0.0;
    grad[1] = 0.5 / sqrt(x[1]);
    // cout << "grad: " << grad[0] << "," << grad[1] << " val " << sqrt(x[1]) << endl;
  }
  return sqrt(x[1]);
}

double myconstraint(unsigned n, const double *x, double *grad, void *data)
{
  my_constraint_data *d = (my_constraint_data *)data;
  double a = d->a, b = d->b;
  if (grad)
  {
    grad[0] = 3 * a * (a * x[0] + b) * (a * x[0] + b);
    grad[1] = -1.0;
    // cout << "grad: " << grad[0] << "," << grad[1] << " val " << ((a * x[0] + b) * (a * x[0] + b) * (a * x[0] + b) - x[1]) << endl;
  }
  return ((a * x[0] + b) * (a * x[0] + b) * (a * x[0] + b) - x[1]);
}

typedef struct
{
  string name;
  int age;
} data_t;

template <typename T>
class Optimize
{
protected:
  nlopt::opt opt;

public:
  Optimize<T>(size_t n)
  {
    opt = nlopt::opt(nlopt::LN_COBYLA, n);
  }

  void benchmark()
  {
    try
    {
      vector<double> lb = {-HUGE_VAL, 0};
      opt.set_lower_bounds(lb);
      opt.set_min_objective(myfunc, NULL);
      opt.set_xtol_rel(1e-4);
      my_constraint_data data[2] = {{2, 0}, {-1, 1}};
      opt.add_inequality_constraint(myconstraint, &data[0], 1e-8);
      opt.add_inequality_constraint(myconstraint, &data[1], 1e-8);

      vector<double> x(2);
      x[0] = 1.234;
      x[1] = 5.678;
      double minf;

      nlopt::result result = opt.optimize(x, minf);
      cout << "found minimum at f(" << x[0] << "," << x[1] << ") = " << minf << endl;
    }
    catch (exception &e)
    {
      cout << "nlopt failed: " << e.what() << endl;
    }
  }

  void set_lower_bounds(vector<double> lb)
  {
    opt.set_lower_bounds(lb);
  }

  void set_upper_bounds(vector<double> ub)
  {
    opt.set_upper_bounds(ub);
  }

  void set_min_objective(ScalarFunction &scalarFunction, double xtol)
  {
    opt.set_min_objective(ScalarFunction::_value, &scalarFunction);
    opt.set_xtol_rel(xtol);
  }

  void add_inequality_constraint(ScalarFunction &scalarFunction, double tol)
  {
    opt.add_inequality_constraint(ScalarFunction::_value, &scalarFunction, tol);
  }

  void add_inequality_mconstraint(VectorFunction &vectorFunction, const vector<double> &tol)
  {
    opt.add_inequality_mconstraint(VectorFunction::_value, &vectorFunction, tol);
  }

  void add_equality_constraint(ScalarFunction &scalarFunction, double tol)
  {
    opt.add_equality_constraint(ScalarFunction::_value, &scalarFunction, tol);
  }

  void add_equality_mconstraint(VectorFunction &vectorFunction, const vector<double> &tol)
  {
    opt.add_equality_mconstraint(VectorFunction::_value, &vectorFunction, tol);
  }

  void set_maxtime(double maxtime)
  {
    opt.set_maxtime(maxtime);
  }

  OptimizationResult optimize(vector<double> x0)
  {
    double minf;
    try
    {
      nlopt::result result = opt.optimize(x0, minf);
      return (OptimizationResult){
          .success = true,
          .x = x0,
          .value = minf};
    }
    catch (exception &e)
    {
      cout << "nlopt failed: " << e.what() << endl;
      return (OptimizationResult){
          .success = false};
    }
  }
};

// template <typename T>
// emscripten::val DenseMatrix<T>::callback = emscripten::val::null();

#endif // OPTIMIZE