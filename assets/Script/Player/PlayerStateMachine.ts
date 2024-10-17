import { _decorator, AnimationClip, Component, Animation, SpriteFrame } from "cc";
import { ENTITY_STATE_ENUM, PARAMS_NAME_ENUM } from "../../Enums";
import State from "../../Base/State";
import { getInitParamsNumber, getInitParamsTrigger, StateMachine } from "../../Base/StateMachine";
import IdleSubStateMachine from "./SubStateMachine/IdleSubStateMachine";
import TurnLeftSubStateMachine from "./SubStateMachine/TurnLeftSubStateMachine";
import TurnRightSubStateMachine from "./SubStateMachine/TurnRightSubStateMachine";
import BlockFrontSubStateMachine from "./SubStateMachine/BlockFrontSubStateMachine";
import { EntityManager } from "../../Base/EntityManager";
import BlockBackSubStateMachine from "./SubStateMachine/BlockBackSubStateMachine";
import BlockLeftSubStateMachine from "./SubStateMachine/BlockLeftSubStateMachine";
import BlockRightSubStateMachine from "./SubStateMachine/BlockRightSubStateMachine";
import BlockTurnLeftSubStateMachine from "./SubStateMachine/BlockTurnLeftSubStateMachine";
import BlockTurnRightSubStateMachine from "./SubStateMachine/BlockTurnRightSubStateMachine";
import DeathSubStateMachine from "./SubStateMachine/DeathSubStateMachine";
import AirDeathSubStateMachine from "./SubStateMachine/AirDeathSubStateMachine";
import AttackSubStateMachine from "./SubStateMachine/AttackSubStateMachine";
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
    this.params.set(PARAMS_NAME_ENUM.BLOCKFRONT, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.BLOCKBACK, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.BLOCKLEFT, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.BLOCKRIGHT, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.BLOCKTURNLEFT, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.BLOCKTURNRIGHT, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.ATTACK, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.DEATH, getInitParamsTrigger());
    this.params.set(PARAMS_NAME_ENUM.AIRDEATH, getInitParamsTrigger());
  }

  initStateMachines() {
    this.stateMachines.set(PARAMS_NAME_ENUM.IDLE, new IdleSubStateMachine(this));
    this.stateMachines.set(PARAMS_NAME_ENUM.TURNLEFT, new TurnLeftSubStateMachine(this));
    this.stateMachines.set(PARAMS_NAME_ENUM.TURNRIGHT, new TurnRightSubStateMachine(this));
    this.stateMachines.set(PARAMS_NAME_ENUM.BLOCKFRONT, new BlockFrontSubStateMachine(this));
    this.stateMachines.set(PARAMS_NAME_ENUM.BLOCKBACK, new BlockBackSubStateMachine(this));
    this.stateMachines.set(PARAMS_NAME_ENUM.BLOCKLEFT, new BlockLeftSubStateMachine(this));
    this.stateMachines.set(PARAMS_NAME_ENUM.BLOCKRIGHT, new BlockRightSubStateMachine(this));
    this.stateMachines.set(PARAMS_NAME_ENUM.BLOCKTURNLEFT, new BlockTurnLeftSubStateMachine(this));
    this.stateMachines.set(PARAMS_NAME_ENUM.BLOCKTURNRIGHT, new BlockTurnRightSubStateMachine(this));
    this.stateMachines.set(PARAMS_NAME_ENUM.DEATH, new DeathSubStateMachine(this));
    this.stateMachines.set(PARAMS_NAME_ENUM.AIRDEATH, new AirDeathSubStateMachine(this));
    this.stateMachines.set(PARAMS_NAME_ENUM.ATTACK, new AttackSubStateMachine(this));

  }

  initAnimationEvent() {
    this.animationComponent.on(Animation.EventType.FINISHED, () => {
      const name = this.animationComponent.defaultClip.name;
      const whiteList = ['block', 'turn', 'attack'];
      if(whiteList.some(v => name.includes(v))){
        //如果当前所播放动画的名称包含有白名单whiteList中的字符串，则播放完该动画后切换为IDLE状态
        // this.setParams(PARAMS_NAME_ENUM.IDLE, true);
        this.node.getComponent(EntityManager).state = ENTITY_STATE_ENUM.IDLE;
      }
    });
  }

  run(){
    switch(this.currentState){
      case this.stateMachines.get(PARAMS_NAME_ENUM.DEATH):
      case this.stateMachines.get(PARAMS_NAME_ENUM.AIRDEATH):
      case this.stateMachines.get(PARAMS_NAME_ENUM.ATTACK):
      case this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKTURNLEFT):
      case this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKTURNRIGHT):
      case this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKRIGHT):
      case this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKLEFT):
      case this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKBACK):
      case this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKFRONT):
      case this.stateMachines.get(PARAMS_NAME_ENUM.TURNRIGHT):
      case this.stateMachines.get(PARAMS_NAME_ENUM.TURNLEFT):
      case this.stateMachines.get(PARAMS_NAME_ENUM.IDLE):
        if(this.params.get(PARAMS_NAME_ENUM.IDLE).value){
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE) as State;
        }else if(this.params.get(PARAMS_NAME_ENUM.TURNLEFT).value){
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.TURNLEFT) as State;
        }else if(this.params.get(PARAMS_NAME_ENUM.TURNRIGHT).value){
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.TURNRIGHT) as State;
        }else if(this.params.get(PARAMS_NAME_ENUM.BLOCKFRONT).value){
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKFRONT) as State;
        }else if(this.params.get(PARAMS_NAME_ENUM.BLOCKBACK).value){
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKBACK) as State;
        }else if(this.params.get(PARAMS_NAME_ENUM.BLOCKLEFT).value){
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKLEFT) as State;
        }else if(this.params.get(PARAMS_NAME_ENUM.BLOCKRIGHT).value){
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKRIGHT) as State;
        }else if(this.params.get(PARAMS_NAME_ENUM.BLOCKTURNLEFT).value){
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKTURNLEFT) as State;
        }else if(this.params.get(PARAMS_NAME_ENUM.BLOCKTURNRIGHT).value){
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKTURNRIGHT) as State;
        }else if(this.params.get(PARAMS_NAME_ENUM.ATTACK).value){
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.ATTACK) as State;
        }else if(this.params.get(PARAMS_NAME_ENUM.DEATH).value){
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.DEATH) as State;
        }else if(this.params.get(PARAMS_NAME_ENUM.AIRDEATH).value){
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.AIRDEATH) as State;
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
