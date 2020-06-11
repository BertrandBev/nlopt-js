# nlopt-js

nlopt-js is a port of the [nlopt](https://nlopt.readthedocs.io/en/latest/) C++ optimization library

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
mkdir build; cd build
# emconfigure cmake .. -DEMSCRIPTEN_GENERATE_BITCODE_STATIC_LIBRARIES=1
emcmake cmake ..
emmake make
```

It should generate a shared library bytecode file named `libnlopt.bc`

Now to compile the wasm binary, run the following command

```bash
mkdir build
emcc -I lib/nlopt/build -I lib/nlopt/src/api  -Isrc lib/nlopt/build/libnlopt.a -s DISABLE_EXCEPTION_CATCHING=0 -s ASSERTIONS=0 -O3 -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 --bind -o build/nlopt_gen.js src/cpp/embind.cc 
```

emcc -I lib/nlopt/build -I lib/nlopt/src/api  -Isrc lib/nlopt/build/libnlopt.a -s ASSERTIONS=1 -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 --bind -o build/nlopt_gen.js src/cpp/embind.cc 