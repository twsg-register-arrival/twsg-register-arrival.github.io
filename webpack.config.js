const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const configMap = require('./configMap.json');

module.exports = () => {
  const targetEnv = process.env.ENV || 'production';
  const { appUrl, formId } = configMap[targetEnv];

  console.log(`Building for ${targetEnv}\nApp URL: ${appUrl}\nForm ID: ${formId}\n`);

  return {
    entry: './src/index.js',
    output: {
      path: __dirname + '/dist',
      filename: 'useless.js'
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/index.html',
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
