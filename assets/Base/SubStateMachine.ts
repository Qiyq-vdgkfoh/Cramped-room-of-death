
import State from "./State";
import { StateMachine } from "./StateMachine";



//子状态机基类（不是一个单独组件，而是有限状态机的一个概念，有限状态机是组件即@ccclass('StateMachine')），子状态机可以挂载在有限状态机组件上，通过有限状态机组件来管理切换各个子状态
export abstract class SubStateMachine {

  //子状态机的参数列表、动画组件等都是直接使用有限状态机的，所以只需保留状态(动画剪辑)属性即可
  private _currentState: State = null;
  stateMachines: Map<string, State> = new Map();//状态机列表，根据对应参数切换不同状态

  constructor(
    public fsm: StateMachine,
  ) {

  }

  get currentState() {
    return this._currentState;
  }

  set currentState(newState: State) {
    this._currentState = newState;
    this._currentState.run();//切换状态后播放动画
  }

  // abstract init(): void;

  abstract run(): void;
}
