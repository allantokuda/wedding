var webpack = require('webpack')

module.exports = {
  entry: "./app.js",
  output: {
    path: 'public',
    filename: "bundle.js"
  },
  resolve: {
    moduleDirectories: ['node_modules']
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: "style!css"
      },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel', // 'babel-loader' is also a legal name to reference
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
  plugins: process.env.NODE_ENV === 'production' ? [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin()
  ] : []
};
