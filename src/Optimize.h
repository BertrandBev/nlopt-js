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
// using emscripten::val = void (*)(void);

// class Objective
// {
// public:
//   virtual int invoke(const double *x) = 0;
// };

struct Objective
{
  typedef struct
  {
    vector<double> grad;
    double value;
  } ObjectiveRtn;

  virtual ObjectiveRtn value(unsigned n, vector<double> x, vector<double> grad) = 0;

  static double _value(unsigned n, const double *x, double *grad, void *my_func_data)
  {
    vector<double> xVec(x, x + n);
    vector<double> gradVec(grad, grad + n);
    ObjectiveRtn rtn = ((Objective *)my_func_data)->value(n, xVec, gradVec);
    if (grad)
      std::copy(rtn.grad.begin(), rtn.grad.end(), grad);
    return rtn.value;
  }

  virtual ~Objective(){};
};

double myfunc(unsigned n, const double *x, double *grad, void *my_func_data)
{
  if (grad)
  {
    grad[0] = 0.0;
    grad[1] = 0.5 / sqrt(x[1]);
  }
  return sqrt(x[1]);
}

typedef struct
{
  double a, b;
} my_constraint_data;

double myconstraint(unsigned n, const double *x, double *grad, void *data)
{
  my_constraint_data *d = (my_constraint_data *)data;
  double a = d->a, b = d->b;
  if (grad)
  {
    grad[0] = 3 * a * (a * x[0] + b) * (a * x[0] + b);
    grad[1] = -1.0;
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
public:
  Optimize<T>(Objective &objective)
  {
    nlopt::opt opt(nlopt::LD_MMA, 2);
    vector<double> lb = {-HUGE_VAL, 0};
    opt.set_lower_bounds(lb);

    auto start = high_resolution_clock::now();

    opt.set_min_objective(Objective::_value, &objective);
    my_constraint_data data[2] = {{2, 0}, {-1, 1}};
    opt.add_inequality_constraint(myconstraint, &data[0], 1e-8);
    opt.add_inequality_constraint(myconstraint, &data[1], 1e-8);
    opt.set_xtol_rel(1e-4);
    vector<double> x(2);
    x[0] = 1.234;
    x[1] = 5.678;
    double minf;

    for (size_t k = 0; k < 100000;  k++)
    {
      try
      {
        nlopt::result result = opt.optimize(x, minf);
        // cout << "found minimum at f(" << x[0] << "," << x[1] << ") = " << minf << endl;
      }
      catch (exception &e)
      {
        // cout << "nlopt failed: " << e.what() << endl;
      }
    }
    auto stop = high_resolution_clock::now();
    auto duration = duration_cast<microseconds>(stop - start);
    cout << "duration: " << duration.count() << "us" << endl;


    // SECOND FUNCTION
    start = high_resolution_clock::now();
    opt.set_min_objective(myfunc, &objective);
    opt.add_inequality_constraint(myconstraint, &data[0], 1e-8);
    opt.add_inequality_constraint(myconstraint, &data[1], 1e-8);
    opt.set_xtol_rel(1e-4);
    x[0] = 1.234;
    x[1] = 5.678;
    for (size_t k = 0; k < 100000;  k++)
    {
      try
      {
        nlopt::result result = opt.optimize(x, minf);
        // cout << "found minimum at f(" << x[0] << "," << x[1] << ") = " << minf << endl;
      }
      catch (exception &e)
      {
        // cout << "nlopt failed: " << e.what() << endl;
      }
    }
    stop = high_resolution_clock::now();
    duration = duration_cast<microseconds>(stop - start);
    cout << "duration: " << duration.count() << "us" << endl;


  }

  void doubleTest(double *array)
  {
    cout << "array test: " << array[1] << endl;
  }
};

// template <typename T>
// emscripten::val DenseMatrix<T>::callback = emscripten::val::null();

#endif // OPTIMIZE