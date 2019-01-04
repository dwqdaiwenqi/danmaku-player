var webpack = require("webpack")
var path = require("path")

const ENV = process.env.npm_lifecycle_event

var pkg = require('./package.json')

module.exports = {
  entry:  './src/index.js',
  output: { 
    path: __dirname+'/dist/'
    ,filename: ENV==='dev'?'scripts/danmaku-player.js':'scripts/danmaku-player.min.js'
    
    ,library: 'danmaku-player'
    ,libraryTarget: 'umd' 

    ,publicPath: './dist/'
  }

  ,devtool: ENV==='dev'?'source-map':''

  ,module: {
    rules: [
      {    
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader' 
      },
      
      // {
      //   test: /\.(css|less)$/,
      //   use:[ 
      //     'style-loader',
      //     'css-loader',{
      //       loader: 'postcss-loader',
      //       options: {
      //       plugins: ()=>[require('autoprefixer')]
      //     }},
      //     'less-loader'
      //   ]
      // }
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
          // {
          //   loader: 'file-loader',
          //   options: {
          //     publicPath:''
          //     ,name :'img/[name].[ext]?[hash:6]'

          //   }
          // }
        ]
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin(" "+require('./package.json').name+" v"+require('./package.json').version+"\r\n By https://github.com/dwqdaiwenqi \r\n Github: https://github.com/dwqdaiwenqi/danmaku-player\r\n MIT Licensed.")
    ,new webpack.DefinePlugin({
      __DEV__: JSON.stringify(process.env.npm_lifecycle_event)
      ,__VERSION__: JSON.stringify(require('./package.json').version)
    })
  ]

}

