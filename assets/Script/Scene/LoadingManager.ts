import { _decorator, Component, Node, EventTarget, director, resources, ProgressBar } from "cc";
import { CONTROLLER_ENUM, EVENT_ENUM, SCENE_ENUM } from "../../Enums";
import EventManager from "../../Runtime/EventManager";
import FaderManager from "../../Runtime/FaderManager";
const { ccclass, property } = _decorator;


@ccclass('LoadingManager')
export class LoadingManager extends Component {
  @property(ProgressBar)//面板绑定属性：进度条ProgressBar
  bar: ProgressBar = null;

  onLoad(){
    //资源预加载
    resources.preloadDir("textures", (cur, total) => {
      this.bar.progress = cur / total;//进度条百分比，cur为当前加载的文件数量，total为总文件数量
    }, ()=>{
      //加载完成回调函数
      director.loadScene(SCENE_ENUM.Start);
    }
    )
  }

}
