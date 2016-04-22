var webpack = require('webpack')

var definePlugin = new webpack.DefinePlugin({
  __DATABASE_LOCATION__: JSON.stringify(process.env.DATABASE_LOCATION)
});

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
  plugins: [definePlugin].concat(process.env.NODE_ENV === 'production' ? [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin()
  ] : [])
};
