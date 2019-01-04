import { define, render, WeElement, getHost  } from 'omi'
import DanmakuPlayerOuO from './danmaku_player_OuO/'
import cs from 'classnames'

export default define('video-ouo', class extends WeElement {
  static observe = true
  render() {

    return(
      <section>

        <div className="video_wrap" ref={el=> this.$video_wrap = el}>

        </div>
        <div className="snow_mask_wrap">
          <div className={cs('snow_mask', this.data.snowEffect && 'snow_mask--active')}></div>
        </div>
        {
          this.data.poster &&
          <div className="poster_wrap">
            <div className="poster_wrap_content" style={{backgroundImage:`url(${this.data.poster})`}}></div>
          </div>
        }

        <div className={cs('loading_mask_wrap', this.data.loading && 'loading_mask_wrap--active')}>
          <div><img src={require('./assets/loading.gif')} alt=""/></div>
        </div>
      </section>
      
    )
  }
  css() {
    return require('./_video-ouo.less')
  }
  install() {
    this.data.snowEffect = false
    this.data.loading = false

    // debugger
    this.data.poster = this.props.poster
  }
  installed() {
    var { danmakuapi, onTimeUpdate, onProgress, onLoadeddata, onFetchCompleted } = this.props
    //console.log()
    this.danmakuPlayerOuO = DanmakuPlayerOuO(this.props.src, {
      $container: this.$video_wrap,
      danmakuapi,
      renderType: 'dom'
    })

    this.danmakuPlayerOuO.onFetchCompleted(() => {
      onFetchCompleted()
    })
    // console.log(    )
    
    this.danmakuPlayerOuO.$video.addEventListener('loadeddata', e => {
      onLoadeddata(this.danmakuPlayerOuO.$video)
    })
    this.danmakuPlayerOuO.$video.addEventListener('timeupdate', e => {
      onTimeUpdate(this.danmakuPlayerOuO.$video)
    })

    this.danmakuPlayerOuO.$video.addEventListener('progress', e => {
      
      onProgress(this.danmakuPlayerOuO.$video)
    })

    this.danmakuPlayerOuO.$video.addEventListener('canplay', () => {
      
      this.data.loading = false
      
    })
    this.danmakuPlayerOuO.$video.addEventListener('waiting', () => {
      //console.log('canplay..........')
      this.data.loading = true
    })

    this.danmakuPlayerOuO.$video.addEventListener('play',()=>{
      this.data.poster = null
    })
    

    this.danmakuPlayerOuO.onEffectCommand((opt) => {
      this.data.snowEffect = !this.data.snowEffect
    })


    // console.log('video-ouo installed!!!')
  }
  updated() {
    
  }
  sendDanmaku(text, param) {
    //console.log(param)
    //debugger
    this.danmakuPlayerOuO.sendDanmaku(text, param)
  }
  setRepeat(loop) {
    this.danmakuPlayerOuO.$video.loop = !loop
  }
  setPlaybackrate(playbackrate) {
    this.danmakuPlayerOuO.$video.playbackRate = playbackrate * 1
  }
  setCurrentTime(percent) {
    this.danmakuPlayerOuO.$video.currentTime = this.danmakuPlayerOuO.$video.duration * percent
  }
  setVolumn(v){
    this.danmakuPlayerOuO.$video.volumn = v * 1
  }
  setPoster(v) {
    this.data.poster = v
    
  }
  pause() {
    this.danmakuPlayerOuO.$video.pause()
  }
  play() {
    this.danmakuPlayerOuO.enableVisibility = true
    this.danmakuPlayerOuO.$video.play()
  }
  showDanmaku() {
    this.danmakuPlayerOuO.showDanmaku()
  }
  hideDanmaku() {
    this.danmakuPlayerOuO.hideDanmaku()
  }
  playbackrate(val) {
    // playbackrate --- playbackRate
    this.danmakuPlayerOuO.$video.playbackRate = val
  }
  autoplay(val) {
    try {
      val = JSON.parse(val)
    } catch (error) {
      alert(error)
    }
    
 
    if(val === true) this.danmakuPlayerOuO.played = true

    this.danmakuPlayerOuO.$video.autoplay = val
  }
  requestFullScreen() {
    this.danmakuPlayerOuO.fullScreen()
  }
  requestNormalScreen() {
    this.danmakuPlayerOuO.normal()
  }
  
})