# nlopt-js

nlopt-js is a port of the great [nlopt](https://nlopt.readthedocs.io/en/latest/) C++ linear algebra library

It uses a WebAssembly compiled subset of the [nlopt](https://nlopt.readthedocs.io/en/latest/) library, and implements a garbage collection mechanism to manage memory

## Installation

Copy the files nlopt_gen.js, nlopt_gen.wasm & nlopt.js to your project

## Compilation

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
emconfigure cmake .. -DEMSCRIPTEN_GENERATE_BITCODE_STATIC_LIBRARIES=1
emmake make
```

It should generate a shared library bytecode file named `libnlopt.bc`

Now to compile the wasm binary, run the following command

```bash
emcc -I ./lib/nlopt/build/src/api/ --pre-js src/pre.js --bind -o nlopt-js/nlopt_gen.js src/embind.cc -Isrc ./lib/nlopt/build/libnlopt.bc
```