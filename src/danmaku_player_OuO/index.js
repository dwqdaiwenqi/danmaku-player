import * as PIXI from 'pixi.js'
import OuO from './gl-ouo'
import Runway from './runway'
import { LinearDanmaku, FixedDanmaku, CurveDanmaku } from './danmakus'
import Snow from './snowflake'
import TWEEN from '@tweenjs/tween.js'
import { html, shimVisibilityChange, shimHidden } from './utils'
// console.log(PIXI.utils.rgb2hex([1.0, 0, 0]))
// debugger

export default function DanmakuPlayer ($video, {$container, constrain, danmakuapi, renderType = 'dom'} = {}) {
  const BOT_GAP = 0
  const DANMAKU_TYPES = ['curve', 'linear', 'fixed']
  const V_DEFAULT_W = 638
  const V_DEFAULT_H = 359
  const VIDEO_RATIO = V_DEFAULT_W / V_DEFAULT_H
  const DUR_FAC = 10000 / V_DEFAULT_W
  const EFFECT_COMMAND_RENDERING_MAX_WIDTH = 1000

  PIXI.utils.skipHello()

  // 10000 / 638 = 15.6739
  // 638 * 15.67   10000
  // 700

  var opt = arguments[1]

  const DanmakuPlayer = {
    $video,
    which_runway: null,
    enableVisibility: false,
    snowEffect: false,
    snow_st: 0,
    pixels: [],
    rect1: null,
    rect2: null,
    danmakuDuration: DUR_FAC * V_DEFAULT_W,
    init () {
      opt = Object.assign({}, {
        constrain: {
          left: 0,
          right: V_DEFAULT_W,
          top: 0,
          bottom: V_DEFAULT_W / VIDEO_RATIO - BOT_GAP
        }
      }, opt)

      this.opt = opt

      opt.$container.innerHTML = html`
        <style>${require('./_index.less')}</style>
        <div class="wrap_video">
          <div class="wrap_ouo" data-renderType="gl-canvas" >
            <section></section>
          </div>
          <div class="wrap_dom" data-renderType="dom-video" >
            <section><video class="dom_video" src="" style="width:${V_DEFAULT_W}px;"></video></section>
          </div>
          <div class="wrap_pixi">
            <section></section>
          </div>
        </div>
      `

      var $wrap_video = opt.$container.querySelector('.wrap_video')

      var $wrap_ouo = $wrap_video.querySelector('.wrap_ouo')
      var $wrap_dom = $wrap_video.querySelector('.wrap_dom')
      var $wrap_pixi = $wrap_video.querySelector('.wrap_pixi')
      var $dom_video = $wrap_video.querySelector('.dom_video')

      this.$wrap_video = $wrap_video
      this.$wrap_ouo = $wrap_ouo
      this.$wrap_dom = $wrap_dom
      this.$dom_video = $dom_video

      // console.log(this.$wrap_ouo,this.$wrap_dom)

      // document.body.appendChild(app.view)
      var appOuO = OuO.App(V_DEFAULT_W, V_DEFAULT_H, {})
      $wrap_ouo.children[0].appendChild(appOuO.$el)
      this.appOuO = appOuO

      var app = new PIXI.Application({
        width: appOuO.canvas.width,
        height: appOuO.canvas.height,
        transparent: true
      })

      $wrap_pixi.children[0].appendChild(app.view)
      this.app = app

      this.runway_group = new PIXI.Container()
      this.snow_container = new PIXI.Container()
      this.fixed_group = new PIXI.Container()
      this.user_runway = new PIXI.Container()
      this.user_fixed_runway = new PIXI.Container()

      app.stage.addChild(this.snow_container)
      app.stage.addChild(this.runway_group)
      app.stage.addChild(this.fixed_group)
      app.stage.addChild(this.user_runway)
      app.stage.addChild(this.user_fixed_runway)
      this.danmaku_offset = { x: 100 }

      this._setupVideo().then(res => {
        this.$video.addEventListener('loadeddata', () => {
          var rect1 = OuO.Rectangle([appOuO.canvas.width, appOuO.canvas.height], [this.$gl_video], {
            vs: `
              attribute vec2 a_position;
              uniform vec2 u_resolution;
              uniform vec2 u_translation;
              uniform vec2 u_scale;
              attribute vec2 a_texCoord;
              varying vec2 v_texCoord;
    
              void main(){
                
                vec2 position = a_position * u_scale + u_translation;
                vec2 zeroToTwo = (position / u_resolution)*2.;
                vec2 clipSpace = zeroToTwo-1.;
    
                v_texCoord = a_texCoord;
    
                gl_Position = vec4(clipSpace*vec2(1,-1),0,1);
              }
            `,
             fs: `
              precision mediump float;
    
              varying vec2 v_texCoord;
              uniform sampler2D u_texture;
              uniform vec2 textureSize;
    
              
              vec4 toGray(vec4 co){
                float gray =( co.x+co.y+co.z)/3.;
                return vec4(vec3(gray),1.);
              }
    
              void main() {
    
                float xDerivative_kernel[9];                
                xDerivative_kernel[0] = -1.; xDerivative_kernel[1] = -2.; xDerivative_kernel[2] = -1.;
                xDerivative_kernel[3] = 0.; xDerivative_kernel[4] = 0.; xDerivative_kernel[5] = 0.;
                xDerivative_kernel[6] = 1.; xDerivative_kernel[7] = 2.; xDerivative_kernel[8] = 1.;
        
                float yDerivative_kernel[9];                
                yDerivative_kernel[0] = -1.; yDerivative_kernel[1] = 0.; yDerivative_kernel[2] = 1.;
                yDerivative_kernel[3] = -2.; yDerivative_kernel[4] = 0.; yDerivative_kernel[5] = 2.;
                yDerivative_kernel[6] = -1.; yDerivative_kernel[7] = 0.; yDerivative_kernel[8] = 1.;
      
                vec2 v_texCoord = v_texCoord.xy;
      
                vec2 onePixel = vec2(1) / textureSize;
      
                vec4 sumx = 
                  // 
                  toGray(texture2D(u_texture, v_texCoord + onePixel * vec2(-1, -1)) )* xDerivative_kernel[0] +
                  toGray(texture2D(u_texture, v_texCoord + onePixel * vec2( 0, -1)) )* xDerivative_kernel[1] +
                  toGray(texture2D(u_texture, v_texCoord + onePixel * vec2( 1, -1)) )* xDerivative_kernel[2] +
                  toGray(texture2D(u_texture, v_texCoord + onePixel * vec2(-1,  0)) )* xDerivative_kernel[3] +
                  toGray(texture2D(u_texture, v_texCoord + onePixel * vec2( 0,  0)) )* xDerivative_kernel[4] +
                  toGray(texture2D(u_texture, v_texCoord + onePixel * vec2( 1,  0)) )* xDerivative_kernel[5] +
                  toGray(texture2D(u_texture, v_texCoord + onePixel * vec2(-1,  1)) )* xDerivative_kernel[6]+
                  toGray(texture2D(u_texture, v_texCoord + onePixel * vec2( 0,  1)) )* xDerivative_kernel[7]+
                  toGray(texture2D(u_texture, v_texCoord + onePixel * vec2( 1,  1)) )* xDerivative_kernel[8] ;
      
                vec4 sumy = 
                  // 
                  toGray(texture2D(u_texture, v_texCoord + onePixel * vec2(-1, -1)) )* yDerivative_kernel[0] +
                  toGray(texture2D(u_texture, v_texCoord + onePixel * vec2( 0, -1)) )* yDerivative_kernel[1] +
                  toGray(texture2D(u_texture, v_texCoord + onePixel * vec2( 1, -1)) )* yDerivative_kernel[2] +
                  toGray(texture2D(u_texture, v_texCoord + onePixel * vec2(-1,  0)) )* yDerivative_kernel[3] +
                  toGray(texture2D(u_texture, v_texCoord + onePixel * vec2( 0,  0)) )* yDerivative_kernel[4] +
                  toGray(texture2D(u_texture, v_texCoord + onePixel * vec2( 1,  0)) )* yDerivative_kernel[5] +
                  toGray(texture2D(u_texture, v_texCoord + onePixel * vec2(-1,  1)) )* yDerivative_kernel[6]+
                  toGray(texture2D(u_texture, v_texCoord + onePixel * vec2( 0,  1)) )* yDerivative_kernel[7]+
                  toGray(texture2D(u_texture, v_texCoord + onePixel * vec2( 1,  1)) )* yDerivative_kernel[8] ;
    
                gl_FragColor = vec4(sqrt(sumx*sumx+sumy*sumy).xyz  , 1.0);
    
              }
            `,
             uniforms: {
              textureSize: [appOuO.canvas.width, appOuO.canvas.height]
            }

          })
          appOuO.addChild(rect1)
          rect1.translation = [0, 0]

          rect1.readPixels(data => {
            this.pixels = data
          })
          rect1.visible = false
          this.rect1 = rect1

          var rect2 = OuO.Rectangle([rect1.width, rect1.height], [this.$gl_video], { })
          appOuO.addChild(rect2)
          rect2.translation = [0, 0]

          this.rect2 = rect2

        //   appOuO.addChild(rect1)
        //   rect1.translation = [0, 0]

        //   rect1.readPixels(data => {
        //     this.pixels = data
        //   })
        //   rect1.visible = false
        //   this.rect1 = rect1

        //   var rect2 = OuO.Rectangle([rect1.width, rect1.height], [this.$gl_video], { })
        //  // appOuO.addChild(rect2)
        //   rect2.translation = [0, 0]

        //   this.rect2 = rect2

          this._createRunway(9)
          this._createUserRunway()

          this._update()
        })
        {
          document.addEventListener(shimVisibilityChange, () => {
            if (!this.enableVisibility) return

            if (document[shimHidden]) {
              this.$video.pause()

              // console.log('%c visibility hidden', 'color:aqua;')
            } else {
              this.$video.play()
              // console.log('%c visibility visible', 'color:teal;')
            }
          })
        }

        this._fetchDanmakuList().then(res => {
          this.handleFetchCompleted && this.handleFetchCompleted()
          this._timeupdate(res)
        }).catch(e => {
          window.alert('弹幕资源发生错误')
          this.handleFetchCompleted && this.handleFetchCompleted()
        })
      })
      return this
    },
    hideDanmaku () {
      // this.appOuO.canvas.style.visibility =
      // this.app.view.style.visibility =  'hidden'
      // this.app.stage.visible = false

      this.runway_group.visible = false
    },
    showDanmaku () {
      // this.appOuO.canvas.style.visibility =
      // this.app.view.style.visibility =  'visible'
      // this.app.stage.visible = true
      this.runway_group.visible = true
    },
    get renderType (){
      return this.opt.renderType
    },
    set renderType (v) {
      this.opt.renderType = v

      ;['volume', 'currentTime', 'loop', 'playbackRate', 'autoplay'].forEach(attr => {
        this.$dom_video[attr] = this.$gl_video[attr] = this.$video[attr]
      })
      this.$gl_video.pause()
      this.$dom_video.pause()

      this.$wrap_ouo.style.display = v === 'webgl' ? 'block' : 'none'
      this.$wrap_dom.style.display = v === 'webgl' ? 'none' : 'block'
      this.$video = v === 'webgl' ? this.$gl_video : this.$dom_video

      console.log('set renderType:', v)
      this.$video.play()
    },
    _setupVideo () {
      return new Promise(resolve => {
        this.$gl_video = document.createElement('video')
        this.$gl_video.src = this.$video
        this.$gl_video.crossOrigin = '*'
        this.$gl_video.preload = 'auto'
        this.$gl_video.setAttribute('renderType', 'webgl')

        this.$dom_video.src = this.$video
        this.$dom_video.crossOrigin = '*'
        this.$dom_video.preload = 'auto'
        this.$dom_video.setAttribute('renderType', 'dom')

        if (this.opt.renderType === 'webgl') {
          this.$wrap_ouo.style.display = 'block'
          this.$video = this.$gl_video
          resolve(this.$gl_video)
        } else {
        // debugger
          this.$wrap_dom.style.display = 'block'
          this.$video = this.$dom_video
          resolve(this.$dom_video)
        }
      })
    },
    _fetchDanmakuList () {
      return new Promise((resolve, reject) => {
        var api = this.opt.danmakuapi

        if (!api) {
          return resolve({})
        }
        var xhr = new window.XMLHttpRequest()
        xhr.onload = () => {
          var danmakuList = {}
          try {
            danmakuList = JSON.parse(xhr.responseText)
          } catch (e) {
            console.log(e)
            return reject(new Error())
         }

          resolve(danmakuList)
        }

        xhr.onerror = () => {
          reject(new Error())
        }
        xhr.open('GET', api)
        xhr.send(null)
      })
    },
    _chooseFixedRunway () {
      var runway
      var i = 0

      if (this.fixed_group.children.every(runway => runway.danmakus.length !== 0)){
        runway = this.fixed_group.children[Math.random() * this.fixed_group.children.length | 0]
      } else {
        runway = this.fixed_group.children[i]
        while (runway.danmakus.length) runway = this.fixed_group.children[i++]
      }
      return runway
    },
    onFetchCompleted (fn) {
      this.handleFetchCompleted = fn
    },
    onEffectCommand (fn) {
      this.handleEffectCommand = fn
    },
    _update () {
      var generateSnowflake = () => {
        ;[...Array(5 + Math.random() * 5 | 0)].forEach(() => {
          let snow = new Snow(.5 + Math.random() * 1.5, 0xffffff)
          this.snow_container.addChild(snow)
          snow.x = this.app.screen.width * Math.random()
          snow.y = -snow.r - Math.random() * 20
          // snow.y = 10
          snow.vx = .5 - Math.random() * 1
          snow.vy = 1 + 3 * Math.random()

          snow.onRemove(() => {
            snow.parent.removeChild(snow)
            // snows = snows.filter(other_snow=>snow!=other_snow)
          })
        })
      }
      var RenderAction = {
        dom (that) {

        },
        webgl (that) {
          that.appOuO.update()
        }
      }

      this.app.ticker.add(() => {
        TWEEN.update()

        RenderAction[this.opt.renderType](this)

        this.runway_group.children.forEach(runway => {
          // console.log(runway.danmakus.length);
          runway.danmakus.forEach(danmaku => {
            if (!danmaku.is_moving) return

            // console.log(danmaku.x)
            if (danmaku.x + danmaku.width * .5 < this.contain.x - 10){
              // console.count('destory-danmaku')

              runway.w_of_sum -= danmaku.width
              danmaku.parent.removeChild(danmaku)
            }
          })
        })

        this.user_runway.danmakus.forEach(danmaku => {
          if (!danmaku.is_moving) return
          if (danmaku.x + danmaku.width * .5 < this.contain.x - 10){
            this.user_runway.w_of_sum -= danmaku.width
            this.user_runway.removeChild(danmaku)
          }
        })

        if (!this.snowEffect) return

        /// ///  / ///
        if (!this.snow_st) this.snow_st = Date.now()

        if (Date.now() - this.snow_st > 200){
          this.snow_st = Date.now()
          generateSnowflake()
        }

        // console.log(this.app.screen.width)

        this.snow_container.children.forEach(snow => {
          snow.animate = true

          var x = snow.x | 0
          // var y = e.pageY-rect.top

          var y = (this.app.screen.height - snow.y) | 0
          // var y = rect1.height-(e.pageY-rect.top)

          var idx = (y * this.app.screen.width + x) * 4 | 0

          var [r, g, b] = [this.pixels[idx], this.pixels[idx + 1], this.pixels[idx + 2]]

          // document.body.style.background = `rgba(${r},${g},${b},255)`

          let brightness = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255
          // console.log(brightness);
          // 是边缘 但是 这个边缘点没有被对象占领
          if (snow.animate && brightness < .47){
            snow.animate = false

            snow.will_remove = true
          }

          if (snow.animate){
            snow.will_remove = false
            snow.will_remove_t = 0
            snow.update()
          }

          if (snow.will_remove){
            if (!snow.will_remove_t) snow.will_remove_t = Date.now()

            if (Date.now() - snow.will_remove_t > 15000){
              snow.will_remove_t = Date.now()

              snow.parent.removeChild(snow)
            }
          }

          if (snow.y > this.app.screen.height + snow.r ||
            snow.x < snow.r ||
            snow.x > this.app.screen.width + snow.r
          ){
            snow.parent.removeChild(snow)
          }
        })
      })
    },
     _timeupdate (danmaku_list){
      var currentTime_
      var danmakus = []
      var runway_i = 0

      this.contain = {
        x: this.app.screen.width * 0
      }

      var handle_timeupdate = () => {
        // console.log('renderType:', this.$video.getAttribute('renderType'), 'currentTime:',this.$video.currentTime)
        // console.log('renderTYpe:', this.$video.getAttribute('renderType'))
        if (this.$video.paused) return

        var [currentTime] = [
          Math.round(this.$video.currentTime), Math.round(this.$video.duration)
        ]

        if (currentTime === currentTime_) return

        currentTime_ = currentTime

        if (!danmaku_list) return
        if (!danmaku_list[currentTime_]) return

        danmakus = []
        runway_i = 0
        // fixedRunwayIdx = 0
        danmaku_list[currentTime].data.forEach(o => {
          this.which_runway = this.runway_group.children[runway_i]

          {
            if (this.which_runway.w_of_sum > this.app.screen.width * .7){
            // if(this.which_runway.w_of_sum > this.app.screen.width*.2){
              runway_i = ++runway_i % this.runway_group.children.length
            }
          }
          // console.log(this.runway_group.children.length)

          let danmaku = this._danmakuFactory(o.text, {...o})

          if (danmaku instanceof FixedDanmaku){
            this.whichFixedRunway = this._chooseFixedRunway()

            this.whichFixedRunway.addChild(danmaku)

            danmaku.x = this.app.screen.width * .5
            danmaku.y = this.whichFixedRunway.height * .5

            danmaku.delayRemove()
          } else {
            this.which_runway.w_of_sum += danmaku.width

            this.which_runway.addChild(danmaku)
            danmaku.__idx__ = this.which_runway.danmakus.length - 1
            danmakus.push(danmaku)
          }
          /// //////

          /// //////
        })

        // 每帧的弹幕设置起至和结束位置并线性移动
        //
        danmakus.forEach((danmaku) => {
          this._giveDanmakuStartPo(danmaku, danmaku.__idx__, danmaku.parent.danmakus)
          this._giveDanmakuEndPo(danmaku, danmaku.__idx__, danmaku.parent.danmakus)
          danmaku.y = this.which_runway.default_height * .5
          // danmaku.move()
          danmaku.move({ duration: this.danmakuDuration })
        })
      }

      this.$gl_video.addEventListener('timeupdate', handle_timeupdate)
      this.$dom_video.addEventListener('timeupdate', handle_timeupdate)
    },
     _createUserRunway (){
      let gapY = this.app.screen.height * .1
      this.app.stage.removeChild(this.user_runway)
      let w_of_runway = this.app.screen.width
      let h_of_runway = this.app.screen.height / this.runway_group.children.length
      this.user_runway = new Runway(w_of_runway, h_of_runway)
      this.app.stage.addChild(this.user_runway)
      this.user_runway.x = 0
      this.user_runway.y = gapY

      this.app.stage.removeChild(this.user_fixed_runway)
      w_of_runway = this.app.screen.width
      h_of_runway = this.app.screen.height / this.runway_group.children.length
      this.user_fixed_runway = new Runway(w_of_runway, h_of_runway, 0x0000ff, true)
      this.app.stage.addChild(this.user_fixed_runway)
      this.user_fixed_runway.x = 0
      this.user_fixed_runway.y = gapY
    },
     _createRunway (num = 9){
      // debugger
      num *= 1

      // scroll
      this.runway_group.removeChild(...this.runway_group.children)

      let num_of_runway = num
      let w_of_runway = this.app.screen.width
      let h_of_runway = this.app.screen.height / num_of_runway

      ;[...Array(num_of_runway)].forEach((v, i) => {
        // if(i!=5) return
        let runway = new Runway(w_of_runway, h_of_runway, 0xff00ff, true)
        this.runway_group.addChild(runway)
        runway.x = 0
        runway.y = i / num_of_runway * this.app.screen.height
      })

      // fixed
      this.fixed_group.removeChild(...this.fixed_group.children)
      num_of_runway = num
      w_of_runway = this.app.screen.width
      h_of_runway = this.app.screen.height / num_of_runway

      ;[...Array(num_of_runway)].forEach((v, i) => {
        let runway = new Runway(w_of_runway, h_of_runway)
        this.fixed_group.addChild(runway)
        runway.x = 0
        runway.y = i / num_of_runway * this.app.screen.height
      })
    },
     _giveDanmakuStartPo (danmaku, i, danmakus, s){
      i = (function (){
        for (let j = 0, len = danmakus.length; j < len; j++){
          if (danmaku === danmakus[j]) return j
        }
      })()
      // console.log(i);

      if (i === 0){
        danmaku.x = this.app.screen.width * 1 + danmaku.width * .5
      } else {
        // 前面的对象完全在屏幕内
        try {
          let in_view = danmakus[i - 1].bounding.right < this.app.screen.width

          if (in_view){
            danmaku.x = this.app.screen.width * 1 + danmaku.width * .5
          } else {
            //
            danmaku.x = danmakus[i - 1].bounding.right + danmaku.width * .5 +
            Math.random() * this.danmaku_offset.x
          }
        } catch (e){
          // danmakus,danmaku
          // debugger
          // (23) Array, 83
          // console.log('err',danmakus,i);
          console.log(e)
        }
      }
    },
     _giveDanmakuEndPo (danmaku, i, danmakus, runway_i){
      i = (function (){
        for (let j = 0, len = danmakus.length; j < len; j++){
          if (danmaku === danmakus[j]) return j
        }
      })()

      danmaku.final_po.x = this.contain.x

      var len = danmakus.length
      for (let j = i + 1; j < len; j++){
        danmaku.final_po.x -= danmakus[j].width
      }
      danmaku.final_po.x -= danmaku.width * .5

      // console.log(danmaku.final_po.x);
    },
     _danmakuFactory (text, opt){
      // debugger
      if (!DANMAKU_TYPES.some(v => v = opt.mode)) return console.warn('not defined this mode..')

      return {
        curve (){
          return new CurveDanmaku(text, opt)
        },
         linear (){
          return new LinearDanmaku(text, opt)
        },
         fixed (){
          return new FixedDanmaku(text, opt)
        }
      }[opt.mode]()
    },
     _effectAction (s){
      var effects = ['#下雪']

      if (!effects.some(v => v === s)){
        return void 1
      }

      return {
        ex (that) {
          // debugger
          that.snowEffect = !that.snowEffect
          if (!that.snowEffect){
            that.renderType = 'dom'
            that.snow_container.removeChildren()

            that.snow_st = 0

            that.rect1.visible = that.rect1.canReadPixels = false
          } else {
            that.renderType = 'webgl'
            that.rect1.visible = that.rect1.canReadPixels = true
          }
        }
      }
    },

     sendDanmaku (text, opt = {mode, fill, fontSize, alpha} = {}){
      // command
      let effect
      if (effect = this._effectAction(text)) {
        if (this.appOuO.canvas.width > EFFECT_COMMAND_RENDERING_MAX_WIDTH) {
          console.warn('***渲染面积过大，可能存在卡顿***')

          // console.log(window.prompt('渲染面积过大，可能存在卡顿! 确定开启吗?'))
          // if (!window.prompt('渲染面积过大，可能存在卡顿! 确定开启吗?')){
          //   return
          // }

          return
        }

        this.handleEffectCommand && this.handleEffectCommand(text)
        return effect.ex(this)
      }

      // this.$video
      opt.wireframe = true
      var danmaku = this._danmakuFactory(text, opt)

      // console.log(danmaku)
      var runway

      if (danmaku instanceof FixedDanmaku){
        // debugger
        runway = this.user_fixed_runway
        runway.addChild(danmaku)

        // danmaku.x = this.user_fixed_runway.width*.5
        danmaku.x = this.app.screen.width * .5

        // debugger
        danmaku.y = this.user_fixed_runway.height * .5

        danmaku.delayRemove()
      } else {
        runway = this.user_runway
        runway.w_of_sum += danmaku.width
        runway.addChild(danmaku)
        danmaku.__idx__ = runway.danmakus.length - 1

        this._giveDanmakuStartPo(danmaku, danmaku.__idx__, danmaku.parent.danmakus)
        this._giveDanmakuEndPo(danmaku, danmaku.__idx__, danmaku.parent.danmakus)
        danmaku.y = runway.default_height * .5
        danmaku.move()
      }
    },
     wideScreen (){
      console.log('wide')
      this.adjustWidth()

      this._createRunway(12)
      this._createUserRunway()
    },
     fullScreen (){
      console.log('full')
      this.adjustWidth()
      this._createRunway(20)
      this._createUserRunway()

      this.danmakuDuration = DUR_FAC * this.app.screen.width

      // console.log('danmakuduration',this.danmakuDuration)
    },
     normal (){
      // debugger
      console.log('normal')
      this.adjustWidth()
      this._createRunway(9)
      this._createUserRunway()

      this.danmakuDuration = DUR_FAC * V_DEFAULT_W

      // console.log('danmakuduration',this.danmakuDuration)
    },
     adjustWidth (){
      // console.log(this.opt.$container.offsetWidth)

      var scale = this.opt.$container.offsetWidth / V_DEFAULT_W

      if (scale * V_DEFAULT_H > this.opt.$container.offsetHeight){
        scale = this.opt.$container.offsetHeight / V_DEFAULT_H
      }

      var [w, h] = [Math.round(scale * V_DEFAULT_W), Math.round(scale * V_DEFAULT_H)]

      this.app.renderer.resize(w, h)

      this.appOuO.resize(w, h)
      this.appOuO.children.forEach(o => o.scale = [scale, scale])

      this.$dom_video.style.width = w + 'px'
      this.$dom_video.style.height = h + 'px'
    },
     saveScreenshots (){

    }
  }

  return DanmakuPlayer.init()
}
