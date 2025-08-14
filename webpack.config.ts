//@ts-check
'use strict'
import { resolve } from 'path'
import * as CopyPlugin from 'copy-webpack-plugin'
import * as TerserPlugin from 'terser-webpack-plugin'
import * as CssMinimizerPlugin from 'css-minimizer-webpack-plugin'

//@ts-check
export default {
  mode: `none`,
  target: `node`, // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  entry: `./src/extension.ts`, // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: resolve(resolve(), `dist`),
    filename: `extension.js`,
    libraryTarget: `commonjs2`
  },
  devtool: `source-map`,
  externals: {
    vscode: `commonjs vscode`, // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    bufferutil: `commonjs bufferutil`, // https://github.com/websockets/ws/issues/1220#issuecomment-433066790
    'utf-8-validate': `commonjs utf-8-validate`,
    'playwright-core': `commonjs playwright-core` // playwright-core can't be webpacked
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: [`.ts`, `.js`, `.css`]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [{ loader: `ts-loader` }]
      },
      { // from Playwright
        test: /\.(svg|png|html|ttf|css)$/i,
        use: 'ignore-loader'
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: `src/inject/script.js`, to: `inject` },
        { from: `src/inject/style.css`, to: `inject` },
        { from: 'node_modules/playwright-core', to: 'node_modules/playwright-core' }
      ]
    })
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({ extractComments: false }), new CssMinimizerPlugin()]
  }
}
