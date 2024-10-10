import { _decorator, AnimationClip, Component, Animation, SpriteFrame } from "cc";
import { PARAMS_NAME_ENUM } from "../../Enums";
import State from "../../Base/State";
import { getInitParamsNumber, getInitParamsTrigger, StateMachine } from "../../Base/StateMachine";
import IdleSubStateMachine from "./SubStateMachine/IdleSubStateMachine";
import TurnLeftSubStateMachine from "./SubStateMachine/TurnLeftSubStateMachine";
import TurnRightSubStateMachine from "./SubStateMachine/TurnRightSubStateMachine";
const { ccclass, property } = _decorator;


//角色有限状态机
@ccclass('PlayerStateMachine')
export class PlayerStateMachine extends StateMachine {

  async init() {
    this.animationComponent = this.addComponent(Animation);

    this.initParams();
    this.initStateMachines();
    this.initAnimationEvent();

    await Promise.all(this.waitingList);
  }

  initParams() {
    this.params.set(PARAMS_NAME_ENUM.IDLE, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.TURNLEFT, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.TURNRIGHT, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.DIRECTION, getInitParamsNumber());//方向参数是number类型
  }

  initStateMachines() {
    this.stateMachines.set(PARAMS_NAME_ENUM.IDLE, new IdleSubStateMachine(this));
    this.stateMachines.set(PARAMS_NAME_ENUM.TURNLEFT, new TurnLeftSubStateMachine(this));
    this.stateMachines.set(PARAMS_NAME_ENUM.TURNRIGHT, new TurnRightSubStateMachine(this));
  }

  initAnimationEvent() {
    this.animationComponent.on(Animation.EventType.FINISHED, () => {
      const name = this.animationComponent.defaultClip.name;
      const whiteList = ['turn'];
      if(whiteList.some(v => name.includes(v))){
        //如果当前所播放动画的名称包含有白名单whiteList中的字符串，则播放完该动画后切换为IDLE状态
        this.setParams(PARAMS_NAME_ENUM.IDLE, true);
      }
    });
  }

  run(){
    switch(this.currentState){
      case this.stateMachines.get(PARAMS_NAME_ENUM.TURNRIGHT):
      case this.stateMachines.get(PARAMS_NAME_ENUM.TURNLEFT):
      case this.stateMachines.get(PARAMS_NAME_ENUM.IDLE):
        if(this.params.get(PARAMS_NAME_ENUM.IDLE).value){
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE) as State;
        }else if(this.params.get(PARAMS_NAME_ENUM.TURNLEFT).value){
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.TURNLEFT) as State;
        }else if(this.params.get(PARAMS_NAME_ENUM.TURNRIGHT).value){
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.TURNRIGHT) as State;
        }
        else{
          //当只改变方向时不会触发上面的trigger判断(因为方向的value值是number)，所以需要在这里重置状态执行run方法以播放动画
          this.currentState = this.currentState;
        }
        break;
      default:
        this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE) as State;
    }
  }
}
