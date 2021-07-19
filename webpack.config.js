const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpack = require('webpack');
const { version, description, name } = require('./package.json');

const rootPath = __dirname;
const srcPath = path.join(rootPath, 'src');
const distPath = path.join(rootPath, 'dist');

module.exports = {
  context: rootPath,
  entry: {
    index: `${srcPath}/index.ts`,
  },
  resolve: {
    extensions: ['.json', '.ts', '.js'],
    symlinks: false,
    cacheWithContext: false,
    plugins: [
      new TsconfigPathsPlugin({
        configFile: './tsconfig.paths.json',
      }),
    ],
  },
  output: {
    libraryTarget: 'commonjs',
    path: distPath,
    filename: '[name].js',
  },
  optimization: {
    concatenateModules: false,
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.(tsx?)$/,
        loader: 'ts-loader',
        exclude: [ [ path.resolve(rootPath, 'node_modules'), path.resolve(rootPath, '.dist'), path.resolve(rootPath, '.husky'), ], ],
        options: {
          transpileOnly: true,
          experimentalWatchApi: true,
        },
      },
    ],
  },
  plugins: [
    new webpack.BannerPlugin({ banner: '#! /usr/bin/env node', raw: true }),
    new webpack.DefinePlugin({
      'VERSION': JSON.stringify(version),
      'DESCRIPTION': JSON.stringify(description),
      'NAME': JSON.stringify(name),
    })
  ],
};