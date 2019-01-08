import * as PIXI from 'pixi.js'

export default class Snow extends PIXI.Container{
  constructor (r = 1, co = 0xffffff){
    super()

    this.x = 0
    this.y = 0
    this.r = r
    this.vx = this.vy = 0
    this.animate = true
    this.co = co

    let circle = new PIXI.Graphics()
    circle.beginFill(co)
    circle.drawCircle(0, 0, this.r)
    circle.endFill()

    this.addChild(circle)

    this.circle = circle
  }
  update (){
    this.x += this.vx
    this.y += this.vy
  }
  onRemove (fn){
    this.handle_remove = fn
  }
}
