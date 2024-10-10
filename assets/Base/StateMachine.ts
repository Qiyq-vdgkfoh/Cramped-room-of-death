import { _decorator, AnimationClip, Component, Animation, SpriteFrame } from "cc";

import State from "./State";
import { FSM_PARAMS_TYPE_ENUM } from "../Enums";
import { SubStateMachine } from "./SubStateMachine";
const { ccclass, property } = _decorator;

type ParamsValueType = boolean | number;
export interface IParamsValue {
  type:FSM_PARAMS_TYPE_ENUM,
  value:ParamsValueType
}
export const getInitParamsTrigger = ()=>{
  return {
    type:FSM_PARAMS_TYPE_ENUM.TRIGGER,
    value:false
  }
}
export const getInitParamsNumber = ()=>{
  return {
    type:FSM_PARAMS_TYPE_ENUM.NUMBER,
    value:0
  }
}

//有限状态机基类
@ccclass('StateMachine')
export abstract class StateMachine extends Component {

  private _currentState: State | SubStateMachine = null;
  params: Map<string, IParamsValue> = new Map();//状态机触发参数列表
  stateMachines: Map<string, State | SubStateMachine> = new Map();//状态机列表，根据对应参数切换不同状态
  animationComponent: Animation ;//动画组件
  waitingList: Array<Promise<SpriteFrame[]>> = [];//资源异步加载等待列表

  getParams(paramsName: string) {
    if(this.params.has(paramsName)){
      return this.params.get(paramsName).value;
    }
  }

  setParams(paramsName: string, value: ParamsValueType) {
    if(this.params.has(paramsName)){
      this.params.get(paramsName).value = value;
      this.run();//变更参数触发状态切换,并且重置该触发器避免一直触发
      this.resetTrigger();
    }
  }
  resetTrigger() {
    for(const [_, value] of this.params){
      if(value.type === FSM_PARAMS_TYPE_ENUM.TRIGGER){
        //如果参数列表该参数为trigger类型，则重置其value为false
        value.value = false;
      }
    }
  }

  get currentState() {
    return this._currentState as State;
  }

  set currentState(newState: State) {
    this._currentState = newState;
    this._currentState.run();//切换状态后播放动画
  }

  abstract init(): void;

  abstract run(): void;
}
