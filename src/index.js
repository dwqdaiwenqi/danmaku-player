import { define, render, WeElement } from 'omi'
import cs from 'classnames'
import './fullscreen-api-polyfill'

import { EventEmitter } from 'events'

import { mmss } from './util'
import './video-ouo'
import './control-wrap'

let tagAttrEmitter = new EventEmitter()

var mediaEvents = [
  'loadeddata', 'loadstart', 'canplay', 'timeupdate', 'play', 'playing',
  'pause', 'error', 'ended', 'waiting', 'progress', 'abort'
]

var danmakuCustomEvents = [
  'senddanmaku'
]

define('danmaku-player-xxx', class extends WeElement {
  static observe = true
  render (props) {
    return (
      <div className={cs(this.data.screenMode)} style={{filter: `brightness(${this.data.brightness})`}}>
        <div className="danmaku_player_wrap">
          <video-ouo danmakuapi={props.danmakuapi} onLoadeddata={this.handleLoadeddata} onFetchCompleted={this.handleFetchCompleted} onTimeUpdate={this.handleTimeUpdate} poster={this.props.poster} onProgress={this.handleProgress} src={props.src} ref={o => this.video_ouo = o }></video-ouo>

          {
            <control-wrap play={this.data.play} showWrap={this.data.showWrap} screenshot={props.screenshot} thumbnailtile={props.thumbnailtile} thumbnail={props.thumbnail} thumbnailTime={this.data.thumbnailTime} playbackrate={this.data.playbackrate} onSliderMouseMove={this.handleSliderMouseMove} fullScreen={this.data.fullScreen} onChangeCurrent={this.handleChangeCurrent} $playerRoot={this} ref={o => this.control_wrap = o}
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
            }}
            onplayChange={(v) => {
              this.data.play = !this.data.play
              if (this.data.play) {
                this.video_ouo.play()
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
              this.video_ouo.sendDanmaku(text, param)
              let handle = this.props['onsenddanmaku']
              handle(text, param)
            }}
            onSwitchDanamku={(val) => {
              if (!val) {
                this.video_ouo.showDanmaku()
              } else {
                this.video_ouo.hideDanmaku()
              }
            }} onrepeatChange={(val) => {
                this.video_ouo.setRepeat(val)
            }}></control-wrap>
          }
        </div>
      </div>
    )
  }
  handleFetchCompleted = () => {
    this.data.showWrap = true
  }
  handleLoadeddata = ($video) => {
    // debugger
    this.control_wrap.updateCurrentProgress($video)
  }
  handleProgress = ($video) => {
    this.control_wrap.updateBuffProgress($video)
  }
  handleChangeCurrent = (percent) => {
    
    this.video_ouo.setCurrentTime(percent)

    this.handleTimeUpdate(this.video_ouo.danmakuPlayerOuO.$video)
  }
  handleTimeUpdate = ($video) => {
    // var { onTimeUpdate } = this.props
    this.control_wrap.updateCurrentProgress($video)
  }

  handleSliderMouseMove = (progress) => {
    var [ mm, ss ] = mmss(this.video_ouo.danmakuPlayerOuO.$video.duration * progress | 0)
    this.data.thumbnailTime = { mm, ss }
  }
  install () {
    this.data = {
      screenMode: 'normal_screen',
      autoplay: false,
      play: false,
      playbackrate: 3,
      fullScreen: false,
      brightness: 1,
      showSettingPannel: false,
      showWrap: false,
      thumbnailTime: {
        mm: 'mm',
        ss: 'ss'
      }
    }
  }
  installed (p) {
    // console.log('danmaku-player installed!!!')
    var { props } = this

    this.listenVideoEvent()

    var actions = {
      autoplayChange (val) {
        this.video_ouo.autoplay(val)
      },
      playbackrateChange (val) {
        this.video_ouo.playbackrate(val)
      },
      posterChange (val) {
        this.video_ouo.setPoster(val)
      },
      playChange (val) {
        this.data.play = !this.data.play
        if (this.data.play) {
          this.video_ouo.play()
        } else {
          this.video_ouo.pause()
        }
      }
    }
    this.props.observedAttributes.forEach(attr => {
      tagAttrEmitter.on(`${attr}Change`, (val, emitterOrigin) => {
        let action
        if (action = actions[`${attr}Change`]) {
          action.call(this, val, emitterOrigin)
        }
      })
    })
    if (props.autoplay) {
      try {
        // console.log(props,props.autoplay)
        this.data.play = JSON.parse(props.autoplay)
      } catch (e) { console.log(e) }
      tagAttrEmitter.emit('autoplayChange', props.autoplay)
    }
    if (props.playbackrate) {
      tagAttrEmitter.emit('playbackrateChange', props.playbackrate)
    }
    if (props.poster) {
      tagAttrEmitter.emit('posterChange', props.poster)
    }
  }
  listenVideoEvent () {
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
})

window.customElements.define('danmaku-player', class extends window.HTMLElement {
  static get observedAttributes () {
    return [
      'volume', 'loop', 'poster', 'autoplay', 'src', 'playbackrate', 'play',
      'thumbnail', 'thumbnailtile', 'screenshot', 'danmakuapi'
    ]
  }
  constructor () {
    super()

    this.completeConnectedCallback = false
    this.firstChangeOfAttr = Object.create(null)
    this.mediaEventHandles = Object.create(null)
    this.danmakuCustomEventHandles = Object.create(null)

    this.constructor.observedAttributes.forEach(k => {
      let k_ = k
      if (k === 'playbackrate') k_ = 'playbackRate'

      Object.defineProperty(this, k_, {
        get () {
          return this.getAttribute(k)
        },
        set (val) {
          this.setAttribute(k, val)
        }
      })
    })
  }

  connectedCallback () {
    this.attachShadow({ mode: 'open' })

    var $sty = document.createElement('style')
    this.shadowRoot.appendChild($sty)
    $sty.textContent = `:host{display:inline-block;} `

    this.completeConnectedCallback = true
    this.makeEvents()

    render(
      <danmaku-player-xxx
        observedAttributes={this.constructor.observedAttributes}
        {...this.firstChangeOfAttr}
        {...this.mediaEventHandles}

        {...this.danmakuCustomEventHandles}
        ref={o => this.danmakuPlayer = o}
      ></danmaku-player-xxx>,
      this.shadowRoot
    )
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
  attributeChangedCallback (name, oldValue, newValue) {
    var observedAttributes = this.constructor.observedAttributes
    if (observedAttributes.some(v => v === name)) {
      if (!this.completeConnectedCallback) {
        this.firstChangeOfAttr[name] = newValue
      } else {
        // console.log('emit....',name)
        tagAttrEmitter.emit(`${name}Change`, newValue, this)
      }
    } else {
      console.log(`没有被ob的属性,`, name)
    }
  }
})
