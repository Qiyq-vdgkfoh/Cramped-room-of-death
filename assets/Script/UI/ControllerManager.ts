import { _decorator, Component } from "cc";
import { EVENT_ENUM } from "../../Enums";
import EventManager from "../../Runtime/EventManager";
const { ccclass, property } = _decorator;


@ccclass('ControllerManager')
export class ControllerManager extends Component {
  handleCtrl(){
    EventManager.Instance.emit(EVENT_ENUM.NEXT_LEVEL);
  }
}
