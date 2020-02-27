const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const configMap = require('./configMap.json');

module.exports = () => {
  const targetEnv = process.env.ENV || 'production';
  const config = configMap[targetEnv];

  console.log(`Building for ${targetEnv}`);
  for (let key in config) {
    console.log(`${key}: '${config[key]}'`);
  }
  console.log();

  return {
    entry: './src/dummy.js',
    output: {
      path: __dirname + '/dist',
      filename: 'index.html' // to be overwritten
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/index.html',
        filename: 'index.html',
        chunks: [],
        config
      }),
      new CopyPlugin([
        { from: 'src/thumb.png' }
      ])
    ],
    mode: 'production'
  };
};
