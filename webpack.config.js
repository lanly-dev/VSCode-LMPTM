/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// @ts-check
'use strict'

const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')

// @ts-ignore
/**@type {import('webpack').Configuration}*/
const config = {
  target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/

  // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  entry: {
    extension: './src/extension.ts',
    'scripts/script': './src/scripts/script.js'
  },
  output: { // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode', // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    bufferutil: 'commonjs bufferutil', // https://github.com/websockets/ws/issues/1220#issuecomment-433066790
    'utf-8-validate': 'commonjs utf-8-validate',
    'supports-color': 'commonjs supports-color'
  },
  resolve: { // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js', 'css']
  },
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      use: [{
        loader: 'ts-loader',
        options: {
          compilerOptions: {
            'module': 'es6' // override `tsconfig.json` so that TypeScript emits native JavaScript modules.
          }
        }
      }]
    }]
  },
  plugins: [
    new CopyPlugin([
      { from: 'src/scripts/ui.html',to: './scripts' },
      { from: 'src/scripts/style.css',to: './scripts' }
    ], { copyUnmodified: true })
  ]
}

module.exports = config
