import { game, RenderRoot2D } from "cc";
import Singleton from "../Base/Singleton";
import { DEFAULT_DURATION, DrawManager } from "../Script/UI/DrawManager";
import { createUINode } from "../Utils/indext";


//持久常驻单例，用于管理场景切换时的渐入渐出效果
export default class FaderManager extends Singleton {

  static get Instance(){
    return super.GetInstance<FaderManager>();
  }

  private _fader: DrawManager = null;

  get fader(){
    if(this._fader !== null){
      return this._fader;
    }

    const root = createUINode();
    root.addComponent(RenderRoot2D);

    const fadeNode = createUINode();
    fadeNode.setParent(root);
    this._fader = fadeNode.addComponent(DrawManager);
    this._fader.init();

    game.addPersistRootNode(root);//添加常驻属性，标记为常驻节点

    return this._fader;
  }

  fadeIn(duration: number = DEFAULT_DURATION){
    return this.fader.fadeIn(duration);//源自其组件DrawManager的fadeIn方法
  }

  fadeOut(duration: number = DEFAULT_DURATION){
    return this.fader.fadeOut(duration);
  }

}
