import * as PIXI from 'pixi.js'
import TWEEN from '@tweenjs/tween.js'

class SplitText extends PIXI.Container{
  constructor (text, opt = {fill = '#ffffff', fontSize = 16, wireframe = false, alpha = 1} = {}){
    super()

    ;[...text].map((v, i) => {
      let fontSize = opt.fontSize
      let message = new PIXI.Text(v, new PIXI.TextStyle({
        fontSize,
        fill: opt.fill,

        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 2,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 1
      }))
      this.addChild(message)

      message.pivot.x = 0
      message.x = i * fontSize

     return message
    })

    this.pivot.x = this.width * .5
    this.pivot.y = this.height * .5
  }
}

export class Danmaku extends PIXI.Container {
  constructor (text, opt = {fill = '#ff00ff', fontSize = 16, wireframe = false, alpha = 1} = {}) {
    super()
    this.text = text
    this.alpha = opt.alpha
    this.opt = opt
    this.final_po = {x: 0, y: 0}
    this.is_moving = false
  }
  get bounding (){
    return {left: this.x - this.width * .5, right: this.x + this.width * .5}
  }
}

export class CurveDanmaku extends Danmaku {
  constructor (text, opt){
    super(text, opt)

    var message = new SplitText(text, opt)

    this.addChild(message)

    this.message = message

    this.pivot.x = this.width * .5
    this.pivot.y = this.height * .5
  }

  move ({duration = 10000} = {}){
    if (this.tw_final) this.tw_final.cancel()

    var by = this.y

    // Math.PI*8 / 3000

    var N = 0

    var dn = .03 + Math.random() * .03

    this.is_moving = true

    this.tw_final = new TWEEN.Tween({x: this.x, t: 0})
    .to({x: this.final_po.x, t: 1}, duration)
    .onUpdate(({x, t}) => {
      this.x = x
      this.y = by

      N += dn

      this.message.children.forEach((piece_text, i) => {
        var nn = N - i * .2

        piece_text.rotation = Math.atan2(-Math.cos(nn), 1)

        piece_text.y = Math.sin(nn) * 40
      })
    })
    .start()
  }
}
export class LinearDanmaku extends Danmaku {
  constructor (text, opt){
    super(text, opt)

    // var message = new PIXI.Text(text, new PIXI.TextStyle({
    //   fontSize: this.opt.fontSize,
    //   fill: this.opt.fill
    // }))
    var message = new PIXI.Text(text, new PIXI.TextStyle({
      fontSize: this.opt.fontSize,
      fill: this.opt.fill,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 1
    }))
    this.addChild(message)

    this.message = message

    this.pivot.x = this.width * .5
    this.pivot.y = this.height * .5

    if (this.opt.wireframe){
      // console.log(this.opt)
      let rectangle = new PIXI.Graphics()
      // rectangle.lineStyle(1, parseInt('#3d8483', 16), 1)
      rectangle.lineStyle(1, 0xffffff, 1)
      rectangle.drawRect(0, 0, this.width, this.height)
      rectangle.endFill()
      rectangle.x = 0
      rectangle.y = 0
      this.addChild(rectangle)
    }
  }
  get bounding (){
    return {left: this.x - this.width * .5, right: this.x + this.width * .5}
  }
  move ({duration = 10000} = {}){
    if (this.tw_final) this.tw_final.cancel()

    this.is_moving = true
    this.tw_final = new TWEEN.Tween({x: this.x, t: 0})
    .to({x: this.final_po.x, t: 1}, duration)
    .onUpdate(({x, t}) => {
      this.x = x
      // console.log('danmaku-move-x-y:', this.x,this.y,this.visible,this.message)
    })
    .start()
    /// ////////////////
  }
  update (){

  }
}

export class FixedDanmaku extends Danmaku {
  constructor (text, opt) {
    super(text, opt)
    var message = new PIXI.Text(text, new PIXI.TextStyle({
      fontSize: this.opt.fontSize,
      fill: this.opt.fill,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 1
    }))
    this.addChild(message)

    this.message = message

    this.pivot.x = this.width * .5
    this.pivot.y = this.height * .5
    if (this.opt.wireframe) {
      // console.log(this.opt)
      let rectangle = new PIXI.Graphics()
      rectangle.lineStyle(1, 0xffffff, 1)
      rectangle.drawRect(0, 0, this.width, this.height)
      rectangle.endFill()
      rectangle.x = 0
      rectangle.y = 0
      this.addChild(rectangle)
    }
  }
  delayRemove (){
    // console.log('destroy...')
    setTimeout(() => {
      this.destroy()
    }, 3333)
  }
}
