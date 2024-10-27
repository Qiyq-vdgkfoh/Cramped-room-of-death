import { _decorator, Component, Node, EventTarget, director } from "cc";
import { CONTROLLER_ENUM, EVENT_ENUM, SCENE_ENUM } from "../../Enums";
import EventManager from "../../Runtime/EventManager";
import FaderManager from "../../Runtime/FaderManager";
const { ccclass, property } = _decorator;


@ccclass('SatrtManager')
export class SatrtManager extends Component {
  onLoad(){
    FaderManager.Instance.fadeOut(1000);
    //node.once(事件类型, 回调函数, this)，once只会触发一次；Node.EventType.TOUCH_END触摸结束事件，存在于EventTarget类中
    this.node.once(Node.EventType.TOUCH_END, this.handleStart, this);
  }

  async handleStart(){
    await FaderManager.Instance.fadeIn(300);

    director.loadScene(SCENE_ENUM.Battle);//导演加载场景，加载的场景名要与cocos creator中保存的场景名一致
  }
}
