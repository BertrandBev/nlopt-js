const path = require('path');

const config = {
  mode: 'production',
  entry: './src/nlopt.mjs',
  context: path.resolve(__dirname, "."),
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: "javascript/auto",
        loader: "arraybuffer-loader"
      }
    ],
  },
  resolve: {
    extensions: ['.js'],
  }
};

const nodeConfig = {
  target: 'node',
  ...config,
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: 'index.js',
    libraryExport: 'default',
    library: 'nlopt',
    libraryTarget: 'umd'
  }
}

module.exports = [nodeConfig];
