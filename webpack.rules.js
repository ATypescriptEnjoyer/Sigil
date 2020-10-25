module.exports = [
  // Add support for native node modules
  {
    test: /\.node$/,
    use: 'node-loader',
  },
  {
    test: /\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@marshallofsound/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: 'ts-loader',
      options: {
        transpileOnly: true
      }
    }
  },
  {
    test: /\.inject\.(css)$/,
    exclude: [`${__dirname}/src/header/`,`${__dirname}/src/sidebar`],
    use: [
      'raw-loader',
    ],
  },
  {
    test: /\.inject\.(js)$/,
    use: [
      'raw-loader',
    ],
  },
  {
    test: /\.(png|svg|jpg|gif|ico)$/,
    use: [
      'file-loader',
    ],
  },
];
