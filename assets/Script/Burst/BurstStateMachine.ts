import { _decorator, AnimationClip, Component, Animation, SpriteFrame } from "cc";
import { getInitParamsNumber, getInitParamsTrigger, StateMachine } from "../../Base/StateMachine";
import { ENTITY_STATE_ENUM, PARAMS_NAME_ENUM } from "../../Enums";
import State from "../../Base/State";
import { EntityManager } from "../../Base/EntityManager";
const { ccclass, property } = _decorator;

const BASE_URL = 'texture/burst';

@ccclass('BurstStateMachine')
export class BurstStateMachine extends StateMachine {

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
    this.params.set(PARAMS_NAME_ENUM.ATTACK, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.DEATH, getInitParamsTrigger());
  }

  initStateMachines() {
    //因为地裂没有方向或者说只有一个方向，所以这里不使用子状态机而是直接创建各状态（帧动画）
    this.stateMachines.set(PARAMS_NAME_ENUM.IDLE, new State(this, `${BASE_URL}/idle`, AnimationClip.WrapMode.Loop));
    this.stateMachines.set(PARAMS_NAME_ENUM.ATTACK, new State(this, `${BASE_URL}/attack`));
    this.stateMachines.set(PARAMS_NAME_ENUM.DEATH, new State(this, `${BASE_URL}/death`));
  }

  initAnimationEvent() {
    // this.animationComponent.on(Animation.EventType.FINISHED, () => {
    //   const name = this.animationComponent.defaultClip.name;
    //   const whiteList = ['attack'];
    //   if(whiteList.some(v => name.includes(v))){
    //     this.node.getComponent(EntityManager).state = ENTITY_STATE_ENUM.IDLE;
    //   }
    // });
  }

  run() {
    switch(this.currentState){
      case this.stateMachines.get(PARAMS_NAME_ENUM.DEATH):
      case this.stateMachines.get(PARAMS_NAME_ENUM.ATTACK):
      case this.stateMachines.get(PARAMS_NAME_ENUM.IDLE):
        if(this.params.get(PARAMS_NAME_ENUM.IDLE).value){
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE) as State;
        }else if(this.params.get(PARAMS_NAME_ENUM.ATTACK).value){
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.ATTACK) as State;
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
