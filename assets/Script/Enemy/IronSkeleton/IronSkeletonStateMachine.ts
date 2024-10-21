import { _decorator, AnimationClip, Component, Animation, SpriteFrame } from "cc";
import { getInitParamsNumber, getInitParamsTrigger, StateMachine } from "../../../Base/StateMachine";
import { ENTITY_STATE_ENUM, PARAMS_NAME_ENUM } from "../../../Enums";
import State from "../../../Base/State";
import IdleSubStateMachine from "./SubStateMachine/IdleSubStateMachine";
import DeathSubStateMachine from "./SubStateMachine/DeathSubStateMachine";
const { ccclass, property } = _decorator;


@ccclass('IronSkeletonStateMachine')
export class IronSkeletonStateMachine extends StateMachine {

  async init() {
    this.animationComponent = this.addComponent(Animation);

    this.initParams();
    this.initStateMachines();
    this.initAnimationEvent();

    await Promise.all(this.waitingList);
  }

  initParams() {
    this.params.set(PARAMS_NAME_ENUM.IDLE, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.DIRECTION, getInitParamsNumber());
    this.params.set(PARAMS_NAME_ENUM.DEATH, getInitParamsTrigger());
  }

  initStateMachines() {
    this.stateMachines.set(PARAMS_NAME_ENUM.IDLE, new IdleSubStateMachine(this));
    this.stateMachines.set(PARAMS_NAME_ENUM.DEATH, new DeathSubStateMachine(this));
  }

  initAnimationEvent() {

  }

  run() {
    switch(this.currentState){
      case this.stateMachines.get(PARAMS_NAME_ENUM.DEATH):
      case this.stateMachines.get(PARAMS_NAME_ENUM.IDLE):
        if(this.params.get(PARAMS_NAME_ENUM.IDLE).value){
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE) as State;
        }else if(this.params.get(PARAMS_NAME_ENUM.DEATH).value){
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.DEATH) as State;
        }
        else{
          this.currentState = this.currentState;
        }
        break;
      default:
        this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE) as State;
    }
  }
}
