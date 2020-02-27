const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const configMap = require('./configMap.json');

module.exports = () => {
  const targetEnv = process.env.ENV || 'production';
  const { appUrl, formId } = configMap[targetEnv];

  console.log(`Building for ${targetEnv}\nApp URL: ${appUrl}\nForm ID: ${formId}\n`);

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
        data: { appUrl, formId }
      }),
      new CopyPlugin([
        { from: 'src/thumb.png' }
      ])
    ],
    mode: 'production'
  };
};
