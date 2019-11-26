#include <emscripten/bind.h>
#include <vector>

#include "Optimize.h"

using namespace std;
using namespace emscripten;

// using DDM = Optimize<double>;
// using CDM = Optimize<complex<double>>;

struct ObjectiveWrapper : public wrapper<Objective>
{
  EMSCRIPTEN_WRAPPER(ObjectiveWrapper);
  // int invoke(double *x)
  // {
  //   return call<int>("invoke", x);
  // }
  ObjectiveRtn value(unsigned n, vector<double> x, vector<double> grad)
  {
    return call<ObjectiveRtn>("value", n, x, grad);
  }
};

struct Interface
{
  virtual void invoke(const std::string &str) = 0;

  virtual ~Interface(){};
};

struct InterfaceWrapper : public wrapper<Interface>
{
  EMSCRIPTEN_WRAPPER(InterfaceWrapper);
  void invoke(const std::string &str)
  {
    return call<void>("invoke", str);
  }
};

EMSCRIPTEN_BINDINGS(Module)
{
  register_vector<double>("Vector");

  value_object<Objective::ObjectiveRtn>("ObjectiveRtn")
      .field("grad", &Objective::ObjectiveRtn::grad)
      .field("value", &Objective::ObjectiveRtn::value);

  class_<Objective>("Objective")
      .function("value", &Objective::value, pure_virtual())
      .allow_subclass<ObjectiveWrapper>("ObjectiveWrapper");

  class_<Interface>("Interface")
      .function("invoke", &Interface::invoke, pure_virtual())
      .allow_subclass<InterfaceWrapper>("InterfaceWrapper");

  // Optimize
  class_<Optimize<double>>("Optimize")
      .constructor<Objective &>()
      .function("doubleTest", &Optimize<double>::doubleTest, allow_raw_pointer<double>());
  // .class_function("setCallback", &DenseMatrix<double>::setCallback, allow_raw_pointers())
  // emscripten::val
}