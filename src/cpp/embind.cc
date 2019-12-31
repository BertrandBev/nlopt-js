#include <emscripten/bind.h>
#include <vector>

#include "Optimize.h"
#include <nlopt.hpp>

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
      .constructor<nlopt::algorithm, size_t>()
      .function("set_local_optimizer", &Optimize<double>::set_local_optimizer)
      .function("set_lower_bounds", &Optimize<double>::set_lower_bounds)
      .function("set_upper_bounds", &Optimize<double>::set_upper_bounds)
      .function("set_min_objective", &Optimize<double>::set_min_objective)
      .function("add_inequality_constraint", &Optimize<double>::add_inequality_constraint)
      .function("add_inequality_mconstraint", &Optimize<double>::add_inequality_mconstraint)
      .function("add_equality_constraint", &Optimize<double>::add_equality_constraint)
      .function("add_equality_mconstraint", &Optimize<double>::add_equality_mconstraint)
      .function("set_maxtime", &Optimize<double>::set_maxtime)
      .function("set_maxeval", &Optimize<double>::set_maxeval)
      .function("optimize", &Optimize<double>::optimize)
      .function("benchmark", &Optimize<double>::benchmark);

  // Algorithms
  enum_<nlopt::algorithm>("Algorithm")
      .value("GN_DIRECT", nlopt::algorithm::GN_DIRECT)
      .value("GN_DIRECT_L", nlopt::algorithm::GN_DIRECT_L)
      .value("GN_DIRECT_L_RAND", nlopt::algorithm::GN_DIRECT_L_RAND)
      .value("GN_DIRECT_NOSCAL", nlopt::algorithm::GN_DIRECT_NOSCAL)
      .value("GN_DIRECT_L_NOSCAL", nlopt::algorithm::GN_DIRECT_L_NOSCAL)
      .value("GN_DIRECT_L_RAND_NOSCAL", nlopt::algorithm::GN_DIRECT_L_RAND_NOSCAL)
      .value("GN_ORIG_DIRECT", nlopt::algorithm::GN_ORIG_DIRECT)
      .value("GN_ORIG_DIRECT_L", nlopt::algorithm::GN_ORIG_DIRECT_L)
      .value("GD_STOGO", nlopt::algorithm::GD_STOGO)
      .value("GD_STOGO_RAND", nlopt::algorithm::GD_STOGO_RAND)
      .value("LD_LBFGS_NOCEDAL", nlopt::algorithm::LD_LBFGS_NOCEDAL)
      .value("LD_LBFGS", nlopt::algorithm::LD_LBFGS)
      .value("LN_PRAXIS", nlopt::algorithm::LN_PRAXIS)
      .value("LD_VAR1", nlopt::algorithm::LD_VAR1)
      .value("LD_VAR2", nlopt::algorithm::LD_VAR2)
      .value("LD_TNEWTON", nlopt::algorithm::LD_TNEWTON)
      .value("LD_TNEWTON_RESTART", nlopt::algorithm::LD_TNEWTON_RESTART)
      .value("LD_TNEWTON_PRECOND", nlopt::algorithm::LD_TNEWTON_PRECOND)
      .value("LD_TNEWTON_PRECOND_RESTART", nlopt::algorithm::LD_TNEWTON_PRECOND_RESTART)
      .value("GN_CRS2_LM", nlopt::algorithm::GN_CRS2_LM)
      .value("GN_MLSL", nlopt::algorithm::GN_MLSL)
      .value("GD_MLSL", nlopt::algorithm::GD_MLSL)
      .value("GN_MLSL_LDS", nlopt::algorithm::GN_MLSL_LDS)
      .value("GD_MLSL_LDS", nlopt::algorithm::GD_MLSL_LDS)
      .value("LD_MMA", nlopt::algorithm::LD_MMA)
      .value("LN_COBYLA", nlopt::algorithm::LN_COBYLA)
      .value("LN_NEWUOA", nlopt::algorithm::LN_NEWUOA)
      .value("LN_NEWUOA_BOUND", nlopt::algorithm::LN_NEWUOA_BOUND)
      .value("LN_NELDERMEAD", nlopt::algorithm::LN_NELDERMEAD)
      .value("LN_SBPLX", nlopt::algorithm::LN_SBPLX)
      .value("LN_AUGLAG", nlopt::algorithm::LN_AUGLAG)
      .value("LD_AUGLAG", nlopt::algorithm::LD_AUGLAG)
      .value("LN_AUGLAG_EQ", nlopt::algorithm::LN_AUGLAG_EQ)
      .value("LD_AUGLAG_EQ", nlopt::algorithm::LD_AUGLAG_EQ)
      .value("LN_BOBYQA", nlopt::algorithm::LN_BOBYQA)
      .value("GN_ISRES", nlopt::algorithm::GN_ISRES)
      .value("AUGLAG", nlopt::algorithm::AUGLAG)
      .value("AUGLAG_EQ", nlopt::algorithm::AUGLAG_EQ)
      .value("G_MLSL", nlopt::algorithm::G_MLSL)
      .value("G_MLSL_LDS", nlopt::algorithm::G_MLSL_LDS)
      .value("LD_SLSQP", nlopt::algorithm::LD_SLSQP)
      .value("LD_CCSAQ", nlopt::algorithm::LD_CCSAQ)
      .value("GN_ESCH", nlopt::algorithm::GN_ESCH)
      .value("GN_AGS", nlopt::algorithm::GN_AGS);
}