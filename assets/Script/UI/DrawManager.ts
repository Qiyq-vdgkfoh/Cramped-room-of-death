import { _decorator, BlockInputEvents, Color, Component, Event, game, Graphics, UITransform, view } from "cc";

const { ccclass, property } = _decorator;

//屏幕宽高
const SCREEN_WIDTH = view.getVisibleSize().width;
const SCREEN_HEIGHT = view.getVisibleSize().height;

enum FADE_STATE_ENUM{
  IDLE = 'IDLE',
  FADE_IN = 'FADE_IN',
  FADE_OUT = 'FADE_OUT',
}

export const DEFAULT_DURATION = 1000; //阴影渐入渐出默认时间1秒

//阴影渐入渐出绘画
@ccclass('DrawManager')
export class DrawManager extends Component {

  private ctx: Graphics;
  private state: FADE_STATE_ENUM = FADE_STATE_ENUM.IDLE;
  private oldTime: number = 0;
  private duration: number = 0;
  private fadeResolve: (value:PromiseLike<null>) =>void;//类型为一个接收PromiseLike<null>参数的函数
  private block: BlockInputEvents;//阻止输入事件

  init(){
    this.block = this.addComponent(BlockInputEvents);//添加阻止输入事件，在屏幕渐进渐出时禁止用户输入
    this.ctx = this.addComponent(Graphics);//添加画布
    const transform = this.getComponent(UITransform);
    transform.setAnchorPoint(0.5, 0.5);
    transform.setContentSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    this.setAlpha(1);
  }

  setAlpha(percent: number){
    this.ctx.clear();
    this.ctx.rect(0, 0, SCREEN_HEIGHT, SCREEN_WIDTH);
    this.ctx.fillColor = new Color(0, 0, 0, percent*255);
    this.ctx.fill();
    this.block.enabled = percent === 1;
  }

  update(){
    const persent = (game.totalTime - this.oldTime) / this.duration;
    switch(this.state){
      case FADE_STATE_ENUM.FADE_IN:
        if(persent < 1){
          this.setAlpha(persent);
        }else{
          this.setAlpha(1);
          this.state = FADE_STATE_ENUM.IDLE;
          this.fadeResolve(null);
        }
        break;
      case FADE_STATE_ENUM.FADE_OUT:
        if(persent < 1){
          this.setAlpha(1 - persent);
        }else{
          this.setAlpha(0);
          this.state = FADE_STATE_ENUM.IDLE;
          this.fadeResolve(null);
        }
        break;
    }
  }

  fadeIn(duration: number = DEFAULT_DURATION){
    this.setAlpha(0);
    this.duration = duration;
    this.oldTime = game.totalTime;
    this.state = FADE_STATE_ENUM.FADE_IN;
    return new Promise((resolve) => {
      this.fadeResolve = resolve;
    })
  }

  fadeOut(duration: number = DEFAULT_DURATION){
    this.setAlpha(1);
    this.duration = duration;
    this.oldTime = game.totalTime;
    this.state = FADE_STATE_ENUM.FADE_OUT;
    return new Promise((resolve) => {
      this.fadeResolve = resolve;
    })
  }

  mask(){
    this.setAlpha(1);
    return new Promise((resolve) => {
      setTimeout(resolve, DEFAULT_DURATION);
    })
  }
}
