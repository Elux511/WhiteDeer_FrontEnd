const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // css: {
  //       loaderOptions: {
  //           postcss: {
  //               plugins: [
  //                   require('postcss-pxtorem')({
  //                       rootValue: 37.5,
  //                       propList: ['*']
  //                   })
  //               ]
  //           }
  //       }
  //   },
  devServer:{
    port:8081,
    host:"0.0.0.0",
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  }
})
