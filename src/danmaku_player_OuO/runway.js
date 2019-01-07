import * as PIXI from 'pixi.js'
import {Danmaku, LinearDanmaku} from './danmakus'

export default class Runway extends PIXI.Container {
  constructor(width, height, strokeColor=0xFF3300, wireframe){
    super()
    if(wireframe){
      // let rectangle = new PIXI.Graphics()
      // this.addChild(rectangle)
      // rectangle.lineStyle(1, strokeColor)
      // rectangle.drawRect(0, 0, width,height)
      // rectangle.endFill()
      // rectangle.alpha = .666
    }
    
    
    this.default_height = height;

    this.hold_danmakus = []

    this.w_of_sum = 0


  }
  get danmakus(){
    //debugger
    //console.log(this.children);
  
    return this.children.filter(o=>o instanceof Danmaku)
  }

}