// module.exports = {
//   chainWebpack: config => {
//     config.module
//       .rule('pun')
//       .test(/\.pun$/)
//       .use('vue-pun-loader')
//       .loader('../../index')
//       .end()
//   }
// }

const path = require('path')

// module.exports = {
//   configureWebpack: {
//     module: {
//       rules: [
//         {
//           test: /\.pun$/,
//           use: [
//             {
//               loader: 'babel-loader'
//             },
//             {
//               loader: path.resolve(__dirname, '../../index'),
//               options: {
//                 debug: true
//               }
//             }
//           ]
//         }
//       ]
//     }
//   }
// }

module.exports = {
  chainWebpack: config => {
    config.module
      .rule('pun')
      .test(/\.pun$/)
      .use('babel')
      .loader('babel-loader')
      .end()
      .use('pun-loader')
      .loader(path.resolve(__dirname, '../../index'))
      .options({ debug: true })
      .end()
  }
}
