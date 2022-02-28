const path = require('path');
const externals = require('webpack-node-externals');

module.exports = {
  entry: './src/server/index.ts',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {loader: 'ts-loader'}, 
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/
      },
    ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  externals: [externals(), {'winston': 'require("winston")',}]
};