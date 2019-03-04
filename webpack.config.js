var webpack = require('webpack')
var path = require('path')

const ENV = process.env.npm_lifecycle_event
const HtmlWebpackPlugin = require('html-webpack-plugin')
const pkg = require('./package.json')  
   
var filename
var publicPath

switch(ENV){
  case 'dev':
    filename = 'scripts/danmaku-player.js'
    publicPath = '../dist/'
    break;
  case 'pro':
    filename = 'scripts/danmaku-player.min.js'
    publicPath = `//unpkg.com/danmaku-player@${pkg.version}/dist/`
    break;
  case 'site':
    filename = 'scripts/danmaku-player.min.js'
    publicPath = `//unpkg.com/danmaku-player@${pkg.version}/dist/`
    break;
}

module.exports = {
  entry:  './src/index.js',
  output: { 
    path: __dirname+'/dist/'
    ,filename
    
    ,library: 'danmaku-player'
    ,libraryTarget: 'umd' 

    ,publicPath
  }
  ,devtool: ENV==='dev'?'source-map':''

  ,module: {
    rules: [
      {    
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader' 
      },
      
      {
        test: /[\\|\/]_[\S]*\.(css|less)$/,
        use: [
          'to-string-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
            plugins: ()=>[require('autoprefixer')]
          }},
          'less-loader'
        ]
      }
      ,{
        test: /\.(png|jpg|jpeg|gif|webp)$/,
        use: [
          'url-loader?limit=0'
        ]
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin("  "+require('./package.json').name+" v"+require('./package.json').version+"\r\n By https://github.com/dwqdaiwenqi \r\n Github: https://github.com/dwqdaiwenqi/danmaku-player\r\n MIT Licensed.")
    ,new webpack.DefinePlugin({
      __DEV__: JSON.stringify(process.env.npm_lifecycle_event)
      ,__VERSION__: JSON.stringify(require('./package.json').version)
    })
    ,new HtmlWebpackPlugin({
      template: './src/example/index.html',
      filename: '../example/index.html',
      inject: 'head',
      __DEV__: JSON.stringify(process.env.npm_lifecycle_event)
    })
  ]

}

