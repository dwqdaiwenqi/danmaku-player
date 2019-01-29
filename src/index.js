/// ///////////////////////////////////////////////////////
import { define, render, WeElement } from 'omi'
import cs from 'classnames'
import { EventEmitter } from 'events'
import './video-ouo'
import './fullscreen-api-polyfill'
import './control-wrap'
import { version } from 'core-js'
import {mmss} from './util'

var mediaEvents = [
  'loadeddata', 'loadstart', 'canplay', 'timeupdate', 'play', 'playing',
  'pause', 'error', 'ended', 'waiting', 'progress', 'abort'
]

var danmakuCustomEvents = [
  'senddanmaku'
]

let tagAttrEmitter = new EventEmitter()

define('danmaku-player-xxx', class extends WeElement{
  static observe = true
  render (props){
    var data = this.data

    // console.log('enableSendDanmaku:%s,enableSwitchDanmaku:%s', this.data.enableSendDanmaku, this.data.enableSwitchDanmaku)
    // console.log('thumbnail', props.thumbnail)
    return (

      <div className={cs(this.data.screenMode)} style={{filter: `brightness(${this.data.brightness})`}}>
        <div className="danmaku_player_wrap">
          <video-ouo connected={data.connected} danmakuapi={data.danmakuapi} src={data.src}
            onLoadeddata={this.handleLoadeddata}
            onFetchCompleted={this.handleFetchCompleted}
            onTimeUpdate={this.handleTimeUpdate}
            onended={this.handleended}
            oncanplay={this.handlecanplay}
            // poster={this.data.poster}
            onProgress={this.handleProgress} ref={o => this.video_ouo = o }></video-ouo>
           {
            <control-wrap enableSwitchDanmaku={data.enableSwitchDanmaku} enableSendDanmaku={data.enableSendDanmaku} play={this.data.play} showWrap={this.data.showWrap} showComment={this.data.showComment} screenshot={props.screenshot}
            thumbnailtile={this.data.thumbnailtile}
            thumbnail={this.data.thumbnail}
            thumbnailTime={this.data.thumbnailTime}
            playbackrate={this.data.playbackrate}
            onSliderMouseMove={this.handleSliderMouseMove} fullScreen={this.data.fullScreen}
            onChangeCurrent={this.handleChangeCurrent} $playerRoot={this} ref={o => this.control_wrap = o}
            onrequestFullScreen={() => {
              this.data.screenMode = 'full_screen'
              this.video_ouo.requestFullScreen()
            }} onrequestNormalScreen={() => {
              this.data.screenMode = 'normal_screen'
              this.video_ouo.requestNormalScreen()
            }}
            onplayStart={v => {
              this.data.play = true
              this.video_ouo.play()

              this.data.showComment = true

              this.props.onplay()
              // debugger
            }}
            onplayChange={(v) => {
              this.data.play = !this.data.play
              // debugger
              if (this.data.play) {
                this.video_ouo.play()
                this.data.showComment = true
                this.props.onplay()
              } else {
                this.video_ouo.pause()
              }
            }}
            onspeedChange={(val) => {
              this.video_ouo.setPlaybackrate(val)
            }}
            onbrightnessChange={val => {
              // console.log(val)
              this.data.brightness = val
            }}
            onvolumnChange={val => {
              this.video_ouo.setVolume(val)
            }}
            onComment={(text, param) => {
              // debugger
              this.sendDanmaku(text, param)
            }}
            onSwitchDanamku={(val) => {
              if (!val) {
                this.video_ouo.showDanmaku()
              } else {
                this.video_ouo.hideDanmaku()
              }
            }} onrepeatChange={(val) => {
              val = !val
              // console.log('setRepeat:%s', val)
                this.video_ouo.setRepeat(val)
            }}></control-wrap>
          }
        </div>
      </div>
    )
  }
  constructor (){
    super()

    tagAttrEmitter.on('enableSwitchDanmaku', (value, context) => {
      // console.log('enableSwitchDanmaku:', value)
      this.data.enableSwitchDanmaku = JSON.parse(value)
    })
    tagAttrEmitter.on('enableSendDanmaku', (value, context) => {
      // console.log('enableSendDanmaku:', value)
      this.data.enableSendDanmaku = JSON.parse(value)
    })
    tagAttrEmitter.on('connected', (o, context) => {
      // console.log('connected', o)

      this.data.danmakuapi = o.danmakuapi
      this.data.src = o.src
      this.data.connected = true
    })
    tagAttrEmitter.on('src', (value, context) => {
      // console.log('src', value)
      // if (!this.danmakuPlayerOuO){
        // this.initialPlayer(value)
      // }
    })
    tagAttrEmitter.on('poster', (value, context) => {
      // console.log('poster:', value)
      // this.data.poster = value
      this.video_ouo.setPoster(value)
    })
    tagAttrEmitter.on('thumbnail', (value, context) => {
      // console.log('thubmnail', value)
      this.data.thumbnail = value
    })
    tagAttrEmitter.on('thumbnailtile', (value, context) => {
      // console.log('thumbnailtile', value)
      this.data.thumbnailtile = value
    })
    tagAttrEmitter.on('loop', (value, context) => {
      // console.log('loop', value)
      // this.video_ouo.danmakuPlayerOuO.$video.loop = JSON.parse(value)
      // this.video_ouo.setRepeat(value)

    })
    tagAttrEmitter.on('autoplay', (value, context) => {
      // console.log('autoplay', value)

      this.video_ouo.autoplay(value)

      if (value === 'true'){
        this.data.showComment = true

        this.data.play = JSON.parse(value)
      }
      //
    })
    tagAttrEmitter.on('playbackrate', (value, context) => {
      // console.log('playbackrate', value)

      this.video_ouo.playbackrate(value)
    })
    tagAttrEmitter.on('volume', (value, context) => {
      // console.log(this.video_ouo.$video)
      // this.video_ouo.danmakuPlayerOuO.$video.volume = value * 1
      this.video_ouo.setVolume(value)
    })
    tagAttrEmitter.on('play', (value, context) => {
      // console.log('play', value)
      this.video_ouo.play()
    })
    tagAttrEmitter.on('pause', (value, context) => {
      this.video_ouo.pause()
    })
    tagAttrEmitter.on('currentTime', (value, context) => {

    })
  }

  install (){
    this.data = {
      connected: false,
      src: '',
      danmakuapi: '',
      screenMode: 'normal_screen',
      autoplay: false,
      play: false,
      playbackrate: 3,
      fullScreen: false,
      brightness: 1,
      showSettingPannel: false,
      showWrap: false,
      showComment: false,
      thumbnail: '',
      thumbnailtile: '',
      thumbnailTime: {
        mm: 'mm',
        ss: 'ss'
      },
      enableSwitchDanmaku: true,
      enableSendDanmaku: true
    }
  }
  installed (){
    var {oninstalled} = this.props

    // this.listenVideoEvent()
    // setTimeout(() => {
      oninstalled()
    // }, 3333)

    // console.log(this.$video_wrap)
    // console.log('danmaku-player-xxx--installed')
  }

  sendDanmaku (text, param){
    // debugger
    this.video_ouo.sendDanmaku(text, param)
    let handle = this.props['onsenddanmaku']
    handle(text, param)
  }
  listenVideoEvent () {
    // console.log(this.video_ouo.danmakuPlayerOuO)
    // return
    var { $video } = this.video_ouo.danmakuPlayerOuO
    mediaEvents.forEach(name => {
      var handle = this.props[`on${name}`]
      if (handle) {
        $video.addEventListener(name, () => {
          handle()
        })
      }
    })
  }
  css () {
    return require('./_danmaku-player.less')
  }
  handlecanplay=() => {
    this.props.oncanplay()
  }
  handleended=() => {
    this.props.onended()
  }
  handleSliderMouseMove = (progress) => {
    var [ mm, ss ] = mmss(this.video_ouo.danmakuPlayerOuO.$video.duration * progress | 0)
    this.data.thumbnailTime = { mm, ss }
  }
  handleChangeCurrent = (percent) => {
    this.video_ouo.setCurrentTime(percent)

    this.handleTimeUpdate(this.video_ouo.danmakuPlayerOuO.$video)
  }
  handleFetchCompleted = () => {
    // return console.log('handleFetchCompleted')
    this.data.showWrap = true
  }
  handleLoadeddata = ($video) => {
    // return console.log('handleLoadeddata')
    this.control_wrap.updateCurrentProgress($video)
    this.props.onloadeddata()
  }
  handleTimeUpdate = ($video) => {
    // return console.log('handleTimeUpdate')
    this.control_wrap.updateCurrentProgress($video)

    // console.log('timeupdate:', this.props.ontimeupdate)
    this.props.ontimeupdate()
  }
  handleProgress = ($video) => {
    // return console.log('handleProgress')
    this.control_wrap.updateBuffProgress($video)
    this.props.onprogress()
  }
})

customElements.define('danmaku-player', class extends HTMLElement{
  static get observedAttributes () {
    return [
      'thumbnail',
      'thumbnailtile',
      'danmakuapi',

      'loop',
      'autoplay',
      'src',
      'poster'
    ]
  }
  static get observedProps (){
    return [
      'enableSwitchDanmaku',
      'enableSendDanmaku',
      'theme',

      'playbackrate',
      'volume',
      'paused',
      'ended',
      'currentTime',
      'duration'
    ]
  }
  constructor (){
    super()

    this.saveAttrAtPrepareTime = Object.create(null)
    this.completeConnected = false
    this.prepareFuc = Object.create(null)

    this.mediaEventHandles = Object.create(null)
    this.danmakuCustomEventHandles = Object.create(null)

    this.thoseAreReady(() => {
      // debugger
      tagAttrEmitter.emit('connected', {
        src: this.saveAttrAtPrepareTime.src,
        danmakuapi: this.saveAttrAtPrepareTime.danmakuapi
      }, this)

      Object.keys(this.saveAttrAtPrepareTime).forEach(name => {
        this[name] = this.saveAttrAtPrepareTime[name]
      })

      // 非observedAttributes的属性 ，在x-tag插入dom后定义的。在connectedCallback中获取到它们得异步
      // debugger

      // console.log('---playbackrate', this.playbackrate, '---')
      setTimeout(() => {
        tagAttrEmitter.emit('playbackrate', this.playbackrate, this)
        tagAttrEmitter.emit('volume', this.volume, this)
        tagAttrEmitter.emit('currentTime', this.currentTime, this)
        tagAttrEmitter.emit('enableSwitchDanmaku', this.enableSwitchDanmaku, this)
        tagAttrEmitter.emit('enableSendDanmaku', this.enableSendDanmaku, this)
      })
    })
    this.attachShadow({ mode: 'open' })
    // $player.shadowRoot.children[0].shadowRoot
    // $player.shadowRoot.children[0].shadowRoot.querySelector('section')

    // console.log('danmaku-player-start')
    var $sty = document.createElement('style')
    this.shadowRoot.appendChild($sty)
    $sty.textContent = `:host{display:inline-block;} `

    this.makeEvents()

    render(
      <danmaku-player-xxx ref={o => { this.danmaku_player_xxx = o }}
        {...this.mediaEventHandles}
        {...this.danmakuCustomEventHandles}
        oninstalled={() => {
        // console.log('installed')
        this.thePrepareIs('installed')
      }}/>,
      this.shadowRoot
    )

    this.constructor.observedProps.forEach(v => {
      Object.defineProperty(this, v, {
        get (){
          var val = this[`_${v}`]
          return val
        },
        set (val){
          this[`_${v}`] = val

            if (this.itsReady){
              tagAttrEmitter.emit(v, val, this)
            }
        }
      })
    })

    this.constructor.observedAttributes.forEach(v => {
      Object.defineProperty(this, v, {
        get (){
          return this.getAttribute(v)
        },
        set (val){
          // console.log(v, val)
          this.setAttribute(v, val)
        }
      })
    })

    {
      // 初始非observedAttributes
      ;[
        ['enableSwitchDanmaku', true],
        ['enableSendDanmaku', true],
        ['screenshot', false],
        ['theme', '#ff00ff'],

        ['playbackrate', 1],
        ['volume', 1],
        ['paused', false],
        ['ended', false],
        ['currentTime', 0],
        ['duration', 0]
      ].forEach((item) => {
        this[item[0]] = item[1]
      })
    }
  }

  makeEvents () {
    mediaEvents.forEach(name => {
      this[`${name}Event`] = new window.CustomEvent(name, {
        bubbles: true,
        cancelable: false,
        detail: { customEventName: name }
      })

      this.mediaEventHandles[`on${name}`] = () => {
        this.dispatchEvent(this[`${name}Event`])
      }
    })
    danmakuCustomEvents.forEach(name => {
      var detail = { customElements: name }

      this[`${name}Event`] = new window.CustomEvent(name, {
        bubbles: true,
        cancelable: false,
        detail
      })
      this.danmakuCustomEventHandles[`on${name}`] = (...args) => {
        Object.assign(detail, {
          ...args
        })
        this.dispatchEvent(this[`${name}Event`])
      }
    })
  }
  play (){
    // console.log('play--')
    setTimeout(() => {
      tagAttrEmitter.emit('play', 'OuO', this)
    })
  }
  pause (){
    setTimeout(() => {
      tagAttrEmitter.emit('pause', 'QvQ', this)
    })
  }
  sendDanmaku (text, param = {}){
    setTimeout(() => {
      param = Object.assign(
        {mode: 'linear', fontSize: 18, fill: 'rgb(255,255,255)', alpha: 1},
        param
      )

      this.danmaku_player_xxx.sendDanmaku(text, param)
    })
  }
  thoseAreReady (fuc){
    this.handle_thoseReay = fuc
  }
  get itsReady (){
    return Object.keys(this.prepareFuc).length === 2
  }
  thePrepareIs (name){
    this.prepareFuc[name] = {}
    if (this.itsReady){
      this.handle_thoseReay()
    }
  }
  // constructor attributeChangedCallback connectedCallback attributeChangedCallback
  connectedCallback (){
    // console.log('connectedCallback---')
    this.thePrepareIs('connectedCallback')
  }
  attributeChangedCallback (name, oldValue, newValue){
    // console.log('attributeChangedCallback--', name, newValue)
    var {observedAttributes} = this.constructor

    if (observedAttributes.some(v => name === v)){
      if (/autoplay|loop/.test(name) && !newValue){
        newValue = true
      }
      if (!this.itsReady){
        // 在没有准备完成期间，save存取属性的最后一次改变的值
        this.saveAttrAtPrepareTime[name] = newValue
      } else {
        // setTimeout(() => {
        tagAttrEmitter.emit(`${name}`, newValue, this)
       // })
      }
    } else {
      console.log(`没有obj这个attr:${name}`)
    }
  }
})
