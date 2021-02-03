module.exports = {
  outputDir : process.env.NODE_ENV === 'production' ? '../templates/.default/distr/' : '../templates/.default/dist-dev/',
  publicPath : process.env.NODE_ENV === 'production' ? '/local/templates/.default/distr/' : '/local/templates/.default/dist-dev/',
  filenameHashing : false,
  runtimeCompiler : true,
  // configureWebpack : {
  //     output : {
  //         chunkFilename : 'js/chunk/[id].js'
  //     }
  // },
}
