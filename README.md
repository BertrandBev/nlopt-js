[![npm version](https://badge.fury.io/js/nlopt-js.svg)](https://badge.fury.io/js/nlopt-js)
[![Website shields.io](https://img.shields.io/website-up-down-green-red/http/shields.io.svg)](https://bertrandbev.github.io/nlopt-js/#/)
[![Made with emscripten](https://img.shields.io/badge/Made%20width-emscripten-blue.svg)](https://github.com/emscripten-core/emscripten)
[![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/Naereen/StrapDown.js/blob/master/LICENSE)

# NLopt-js

NLopt-js is a port of the [nlopt](https://nlopt.readthedocs.io/en/latest/) C++ optimization library

It uses a WebAssembly compiled subset of the [nlopt](https://nlopt.readthedocs.io/en/latest/) library, and implements a garbage collection mechanism to manage memory

[Home](https://bertrandbev.github.io/nlopt-js/#/) • [Documentation](https://bertrandbev.github.io/nlopt-js/#/optimize)

## Usage

NLopt-js can be installed via [npm](https://www.npmjs.com/package/nlopt-js) or [yarn](https://yarnpkg.com/en/package/nlopt-js)

```bash
npm install nlopt-js
```

```bash
yarn add nlopt-js
```

In a node application or in the browser (using [webpack](https://webpack.js.org/))
(This example can be found under ./example)

```js
// test.mjs
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
  console.log(res);
  // Flush the GC
  nlopt.GC.flush();
})();
```

## Documentation

The documentation is available at [NLopt-js](https://bertrandbev.github.io/nlopt-js/#/)

## Build

Make sure [Emscripten](https://emscripten.org/docs/getting_started/Tutorial.html) is intalled & activated in your terminal session

```bash
source path/to/emsdk/emsdk_env.sh
./emcc -v
```

Dowload the latest version of the [nlopt](https://github.com/stevengj/nlopt) library and extract it under

```bash
lib/nlopt
```

Now build a bytecode shared library

```bash
mkdir build; cd build
emcmake cmake ..
emmake make
```

It should generate a shared library bytecode file named `libnlopt.bc`

Now to compile the wasm binary, run the following command

```bash
mkdir build
emcc -I lib/nlopt/build -I lib/nlopt/src/api  -Isrc lib/nlopt/build/libnlopt.a -s DISABLE_EXCEPTION_CATCHING=0 -s ASSERTIONS=0 -O3 -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 --bind -o build/nlopt_gen.js src/cpp/embind.cc 
```

### Generate the documentation

The documentation is generated from classes descriptions using [documentation.js](https://documentation.js.org/)

```bash
documentation build src/classes/ -f json -o docs/doc.json
```