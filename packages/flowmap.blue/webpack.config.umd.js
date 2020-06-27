const resolve = require('path').resolve;
const join = require('path').join;


const SRC_DIR = resolve(__dirname, './src');
const OUTPUT_DIR = resolve(__dirname, './dist-umd');

module.exports = {
  entry: {
    flowmapBlue: join(SRC_DIR, 'index-standalone.tsx')
  },

  optimization: {
    minimize: true,
  },

  // Silence warnings about big bundles
  // stats: {
  //   warnings: false
  // },

  output: {
    // Generate the bundle in dist folder
    path: OUTPUT_DIR,
    filename: 'flowmap-blue.min.js',
    globalObject: 'this',
    library: '[name]',
    libraryTarget: 'umd'
  },

  // let's put everything in
  externals: {
    // react: {
    //   root: 'React',
    //   commonjs2: 'react',
    //   commonjs: 'react',
    //   amd: 'react',
    //   umd: 'react'
    // },
    // 'react-dom': {
    //   root: 'ReactDOM',
    //   commonjs2: 'react-dom',
    //   commonjs: 'react-dom',
    //   amd: 'react-dom',
    //   umd: 'react-dom'
    // },
    // redux: {
    //   root: 'Redux',
    //   commonjs2: 'redux',
    //   commonjs: 'redux',
    //   amd: 'redux',
    //   umd: 'redux'
    // },
    // 'react-redux': {
    //   root: 'ReactRedux',
    //   commonjs2: 'react-redux',
    //   commonjs: 'react-redux',
    //   amd: 'react-redux',
    //   umd: 'react-redux'
    // },
    // 'styled-components': {
    //   commonjs: 'styled-components',
    //   commonjs2: 'styled-components',
    //   amd: 'styled-components',
    //   root: 'styled'
    // }
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          // transpileOnly: true,
          configFile: 'tsconfig.build.umd.json'
        }
      },
    ],
  },

  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },

  node: {
    fs: 'empty'
  }
};
