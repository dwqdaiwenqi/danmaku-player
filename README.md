# danmaku-player [![](https://img.shields.io/npm/v/danmaku-player.svg)](https://www.npmjs.com/package/danmaku-player) 
融合了WebGl和Web Componet的实时图像处理弹幕播放器        

## 特征
* 基于Web Components ，拥抱Web Components标准，内部使用的 [omi](https://github.com/Tencent/omi) 作为开发Web Components的开发框架，[omi](https://github.com/Tencent/omi)是个非常棒的现代框架，强力推荐！  
* 高性能的，使用WebGl进行渲染，同频弹幕数达到5000+，fps依旧坚挺  
* 想比传统的弹幕显示运动方式，添加了曲线模式的弹幕发送 
* 内置实时图像处理的特效指令（切勿在全屏模式下使用），当前有#护眼、#下雪等 - 未来将支持更多的特效指令 

→ Demo located at https://dwqdaiwenqi.github.io/danmaku-player/example/    

## 截图   
<img src="https://raw.githubusercontent.com/dwqdaiwenqi/danmaku-player/master/preview11.jpg" style="margin:0 auto; width:699px;"/>

<img src="https://raw.githubusercontent.com/dwqdaiwenqi/danmaku-player/master/preview7.jpg" style="margin:0 auto; width:699px;"/>


<img src="https://raw.githubusercontent.com/dwqdaiwenqi/danmaku-player/master/preview22.jpg" style="margin:0 auto; width:699px;"/>

<img src="https://raw.githubusercontent.com/dwqdaiwenqi/danmaku-player/master/preview33.jpg" style="margin:0 auto; width:699px;"/>

<img src="https://raw.githubusercontent.com/dwqdaiwenqi/danmaku-player/master/preview44.jpg" style="margin:0 auto; width:699px;"/>


## Usage
通过npm或者cdn获取
```js
npm i danmaku-player
```
* [https://unpkg.com/danmaku-player@latest/dist/scripts/danmaku-player.js](https://unpkg.com/danmaku-player@latest/dist/scripts/danmaku-player.js)

### HTML
用法和`<video/>`标签差不多，直接写入到html中即可
```html
  <script src="//unpkg.com/danmaku-player@latest/dist/scripts/danmaku-player.min.js"></script>
  <danmaku-player id="player" autoplay="false"
    danmakuapi="//static.xyimg.net/cn/static/fed/common/danmaku-list.json"
    thumbnail="//static.xyimg.net/cn/static/fed/common/img/thumbnail-tile-90X1-scale-160X90.png"
    thumbnailtile="90"
    poster="//static.xyimg.net/cn/static/fed/common/img/posterx.jpg"
    src="//static.xyimg.net/cn/static/fed/common/media/Galileo180.mp4"></danmaku-player>
  <script>
    var $player = document.querySelector('#player')

    // $player.loop = false
    $player.autoplay =false
    $player.playbackrate=1
    $player.enableSendDanmaku=true
    $player.enableSwitchDanmaku=true
    

    // $player.play()
    
    $player.addEventListener('senddanmaku',(e)=>{
      //debugger
      console.log('senddanmaku')
    })
    $player.addEventListener('progress',e=>{
      console.log('progress')
    })
    $player.addEventListener('loadeddata',e=>{
      console.log('loadeddata')
    })

    $player.addEventListener('canplay',e=>{
      console.log('canplay')
    })
    $player.addEventListener('play',(e)=>{
      console.log('play')
    })
    $player.addEventListener('timeupdate',(e)=>{
     console.log('timeupdate')
    })
    $player.addEventListener('ended',e=>{
      console.log('ended.')
    })

 
  </script>
```
### React
```js
import 'danmaku-player'
//...
render(){
  // react中需要用ref获取到原生dom对象
    return(
      <section>
        <danmaku-player ref={el=>this.$player=el}src="//static.xyimg.net/cn/static/fed/common/media/Galileo180.mp4"></danmaku-player>
      </section>
    )
 }
 componentDidMount(){
  this.$player.addEventListener('play',()=>{
    //...
  })
  //...
 }
```
### 特效指令
特效指令#xxx，第一次输入#xxx开启了特效，再次输入#xxx关闭特效。目前有#下雪，更多指令待开发...

### <danmaku-player/>标签属性
| 属性     | 描述  | 
| :------------- | :------------- | 
| src         | 必须，视频的播放地址，目前支持mp4      | 
| poster         | 不必须，视频海报      | 
| autoplay         | 不必须， 自动播放，默认是false  | 
| thumbnail         | 不必须，视频缩略图  | 
| thumbnailtile    |不必须，视频缩略图横向分割数量
| loop         | 不必须， 循环播放，默认是false     |
| danmakuapi | 不必须，弹幕的资源url

### 相关属性&方法
| 属性或方法     | 描述  | 
| :------------- | :------------- | 
| loop         | 不必须，循环播放，默认是false     | 
| autoplay         | 不必须， 自动播放，默认是false  | 
| loop         | 不必须， 循环播放，默认是false     |
| playbackrate | 不必须，播放速度，默认是1.0
| enableSendDanmaku | 不必须，发送弹幕的按钮显示，默认是false
| enableSwitchDanmaku | 不必须，切换弹幕的显示与隐藏，默认是false
| play()     | 播放
| pause()    | 暂停
| sendDanmaku() | 发送弹幕，参数(text='',option={})


### 相关事件
| 事件名     | 描述  | 
| :------------- | :------------- | 
| progress | 相关部分的下载进度时周期性地触发
| loadeddata | 媒体的第一帧已经加载完毕
| canplay | 已经有足够的数据可供播放时触发
| timeupdate | 时间已经改变
| ended | 播放结束时触发
| senddanmaku | 用户发送了一条弹幕


#### .sendDanmaku(text='',options={})
```js
$player.sendDanmaku('弹幕文字。。。',{
  fill:'blue', // 弹幕颜色
  mode:'linear', // 弹幕运动模式有 linear|fixed|curve ,线性|上方固定|曲线
  fontSize：20,// 弹幕字体大小
  alpha:1 // 弹幕透明度
})
```

#### danmakuapi
```js
//danmakuapi应当返回如下格式
{
  //视频的第0秒
  0:{
    data:[
      ｛text:'弹幕文字',fill:'弹幕颜色',mode:'运动模式'，fontSize:'弹幕字体大小',alpha:'弹幕透明度'}
    ]
  },
  //视频的第一秒
  1:{
    data:[
      ｛text:'弹幕文字',fill:'弹幕颜色',mode:'运动模式'，fontSize:'弹幕字体大小',alpha:'弹幕透明度'},
      ｛text:'弹幕文字',fill:'弹幕颜色',mode:'运动模式'，fontSize:'弹幕字体大小',alpha:'弹幕透明度'}
    ]
  }
  //...
}
```

### 你想问
#### 为什么不要在全屏模式下使用#xxx特效指令
当调用特效指令，如：#下雪，播放器的渲染就不使用`<video/>`了，而是切换成`<canvas/>`获取WebGl对象进行渲染。在全屏模式下，WebGl渲染了面积过大的实时视频纹理导致了fps下降，目前无解（有好的解决方法的务必告知~）
#### 移动端没做处理吗
对，自动播放和全屏这两个问题移动浏览器没解决，暂时不考虑兼容移动端
#### 属性和事件和原生的video一致吗
不完全一致，虽然很多事件和属性名相同，但是都是经过包装过的
#### 视频的缩略图怎么获得
如果要生成一张由90张小图横向合并的缩略图，视频时长是180秒，2(180/90)秒截图一张图，fps是24，每隔48（24`*`2）帧截取一张宽高是160`*`90的图。

那么就可以执行如下的ffpmeg命令
```js
ffmpeg -i Galileo.mp4 -frames 1 -vf "select=not(mod(n\,48)),scale=160:90,tile=90*1" assets/thumbnail-tile-90X1-scale-160X90.png
```


## 欢迎帮填坑，欢迎Pull Request
## 待完成...

## License

MIT
