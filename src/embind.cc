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
  double value(unsigned n, int xPtr, int gradPtr)
  {
    return call<double>("value", n, xPtr, gradPtr);
  }
};

struct VectorFunctionWrapper : public wrapper<VectorFunction>
{
  EMSCRIPTEN_WRAPPER(VectorFunctionWrapper);
  void value(unsigned m, int rPtr, unsigned n, int xPtr, int gradPtr)
  {
    return call<void>("value", m, rPtr, n, xPtr, gradPtr);
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
      .allow_subclass<ScalarFunctionWrapper>("ScalarFunctionWrapper");

  class_<VectorFunction>("VectorFunction")
      .function("value", &VectorFunction::value, pure_virtual())
      .allow_subclass<VectorFunctionWrapper>("VectorFunctionWrapper");

  // Optimize
  class_<Optimize<double>>("Optimize")
      .constructor<size_t>()
      .function("set_lower_bounds", &Optimize<double>::set_lower_bounds)
      .function("set_upper_bounds", &Optimize<double>::set_upper_bounds)
      .function("set_min_objective", &Optimize<double>::set_min_objective)
      .function("add_inequality_constraint", &Optimize<double>::add_inequality_constraint)
      .function("add_inequality_mconstraint", &Optimize<double>::add_inequality_mconstraint)
      .function("add_equality_constraint", &Optimize<double>::add_equality_constraint)
      .function("add_equality_mconstraint", &Optimize<double>::add_equality_mconstraint)
      .function("set_maxtime", &Optimize<double>::set_maxtime)
      .function("optimize", &Optimize<double>::optimize)
      .function("benchmark", &Optimize<double>::benchmark);
}