import {define, WeElement} from 'omi'
import DanmakuPlayerOuO from './danmaku_player_OuO/'
import cs from 'classnames'

export default define('video-ouo', class extends WeElement {
  static observe = true
  render () {
    // console.log('connected:', this.props.connected)

    // console.log('video-ouo:', this.data.poster)
    return (
      <section>

        <div className="video_wrap" ref={el => this.$video_wrap = el}>

        </div>
        <div className="snow_mask_wrap">
          <div className={cs('snow_mask', this.data.snowEffect && 'snow_mask--active')}></div>
        </div>
        {
          this.data.poster &&
          <div className="poster_wrap">
            <div className="poster_wrap_content" style={{backgroundImage: `url(${this.data.poster})`}}></div>
          </div>
        }

        <div className={cs('loading_mask_wrap', this.data.loading && 'loading_mask_wrap--active')}>
          <div><img src={require('./assets/loading.gif')} alt=""/></div>
        </div>
      </section>
    )
  }
  css () {
    return require('./_video-ouo.less')
  }
  receiveProps (new_props, b, old_props){
    // console.log(`old_connected:${old_props.connected},new_connected:${new_props.connected}`)
    // console.log(`old_poster:${old_props.poster},new_poster:${new_props.poster}`)
    // console.log(`new_poster:${new_props.poster}`)
    var {connected, danmakuapi, src} = new_props

    // this.data.poster = new_props.poster
    // console.log(`connected:${connected}`)
    if (connected === true && !this.danmakuPlayerOuO){
      this.initialPlayer({danmakuapi, src})
      // this.data.poster = new_props.poster
    }
    if (connected === true){

    }
  }
  install () {
    this.data.snowEffect = false
    this.data.loading = false

    // debugger
    this.data.poster = ''
  }
  installed () {

  }
  initialPlayer (o){
     var { onTimeUpdate, onProgress, onLoadeddata, onFetchCompleted, onended, oncanplay} = this.props
    this.danmakuPlayerOuO = DanmakuPlayerOuO(o.src, {
      $container: this.$video_wrap,
      danmakuapi: o.danmakuapi,
      renderType: 'dom'
      // renderType: 'webgl'
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
    this.danmakuPlayerOuO.$video.addEventListener('ended', e => {
      onended(this.danmakuPlayerOuO.$video)
    })

    this.danmakuPlayerOuO.$video.addEventListener('progress', e => {
      onProgress(this.danmakuPlayerOuO.$video)
    })

    this.danmakuPlayerOuO.$video.addEventListener('canplay', () => {
      this.data.loading = false
      oncanplay(this.danmakuPlayerOuO.$video)
    })
    this.danmakuPlayerOuO.$video.addEventListener('waiting', () => {
      // console.log('canplay..........')
      this.data.loading = true
    })

    this.danmakuPlayerOuO.$video.addEventListener('play', () => {
      this.data.poster = null

      // console.log('poster null!')
    })
    this.danmakuPlayerOuO.onEffectCommand((opt) => {
      this.data.snowEffect = !this.data.snowEffect
    })
  }
  updated () {

  }
  sendDanmaku (text, param) {
    // console.log(param)
    // debugger
    this.danmakuPlayerOuO.sendDanmaku(text, param)
  }
  setRepeat (loop) {
    this.danmakuPlayerOuO.$video.loop = !!loop
  }
  setPlaybackrate (playbackrate) {
    this.danmakuPlayerOuO.$video.playbackRate = playbackrate * 1
  }
  setCurrentTime (percent) {
    // console.log('renderTYpe:', this.danmakuPlayerOuO.$video.getAttribute('renderType'))
    this.danmakuPlayerOuO.$video.currentTime = this.danmakuPlayerOuO.$video.duration * percent
  }
  setVolume (v) {
    this.danmakuPlayerOuO.$video.volume = v * 1
    // console.log(v, this.danmakuPlayerOuO.$video.volume)
  }
  setPoster (v) {
    this.data.poster = v
  }
  pause () {
    this.danmakuPlayerOuO.$video.pause()
  }
  play () {
    this.danmakuPlayerOuO.enableVisibility = true
    this.danmakuPlayerOuO.$video.play()
  }
  showDanmaku () {
    this.danmakuPlayerOuO.showDanmaku()
  }
  hideDanmaku () {
    this.danmakuPlayerOuO.hideDanmaku()
  }
  playbackrate (val) {
    // playbackrate --- playbackRate
    this.danmakuPlayerOuO.$video.playbackRate = val
  }
  autoplay (val) {
    try {
      val = JSON.parse(val)
    } catch (error) {
      // alert(error)
    }

    if (val === true) this.danmakuPlayerOuO.played = true

    this.danmakuPlayerOuO.$video.autoplay = val
  }
  requestFullScreen () {
    this.danmakuPlayerOuO.fullScreen()
  }
  requestNormalScreen () {
    this.danmakuPlayerOuO.normal()
  }
})
