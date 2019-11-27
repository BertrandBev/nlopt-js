#include <emscripten/bind.h>
#include <vector>

#include "Optimize.h"

using namespace std;
using namespace emscripten;

// using DDM = Optimize<double>;
// using CDM = Optimize<complex<double>>;

struct ScalarFunctionWrapper : public wrapper<ScalarFunction>
{
  EMSCRIPTEN_WRAPPER(ScalarFunctionWrapper);
  // int invoke(double *x)
  // {
  //   return call<int>("invoke", x);
  // }
  double value(unsigned n, int xPtr, int gradPtr)
  {
    return call<double>("value", n, xPtr, gradPtr);
  }

  void memtest(int dataPtr)
  {
    return call<void>("memtest", dataPtr);
  }
};

EMSCRIPTEN_BINDINGS(Module)
{
  register_vector<double>("Vector");

  value_object<OptimizationResult>("OptimizationResult")
      .field("success", &OptimizationResult::success)
      .field("x", &OptimizationResult::x)
      .field("value", &OptimizationResult::value);

  class_<ScalarFunction>("ScalarFunction")
      .function("value", &ScalarFunction::value, pure_virtual())
      .function("memtest", &ScalarFunction::memtest, pure_virtual())
      .allow_subclass<ScalarFunctionWrapper>("ScalarFunctionWrapper");

  // Optimize
  class_<Optimize<double>>("Optimize")
      .constructor<size_t>()
      .function("set_lower_bounds", &Optimize<double>::set_lower_bounds)
      .function("set_upper_bounds", &Optimize<double>::set_upper_bounds)
      .function("set_min_objective", &Optimize<double>::set_min_objective)
      .function("add_inequality_constraint", &Optimize<double>::add_inequality_constraint)
      .function("optimize", &Optimize<double>::optimize)
      .function("benchmark", &Optimize<double>::benchmark);
}