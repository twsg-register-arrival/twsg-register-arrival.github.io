const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'useless.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      chunks: [],
      data: {
        appUrl: 'https://twsg-register-arrival.github.io/',
        formId: '1FAIpQLSdWfWAbay30b8uQsBUHpaNUxOZfVx0W8CsP9AZd2N_1LQcQMg'
      }
    }),
    new CopyPlugin([{
      from: 'src/thumb.png'
    }])
  ]
};
