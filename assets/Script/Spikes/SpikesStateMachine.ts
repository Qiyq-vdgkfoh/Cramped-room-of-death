import { _decorator, AnimationClip, Component, Animation, SpriteFrame } from "cc";
import { getInitParamsNumber, getInitParamsTrigger, StateMachine } from "../../Base/StateMachine";
import { ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, PARAMS_NAME_ENUM, SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM } from "../../Enums";
import { EntityManager } from "../../Base/EntityManager";
import State from "../../Base/State";
import SpikesOneSubStateMachine from "./SubStateMachine/SpikesOneSubStateMachine";
import SpikesTwoSubStateMachine from "./SubStateMachine/SpikesTwoSubStateMachine";
import SpikesThreeSubStateMachine from "./SubStateMachine/SpikesThreeSubStateMachine";
import SpikesFourSubStateMachine from "./SubStateMachine/SpikesFourSubStateMachine";
import { SpikesManager } from "./SpikesManager";

const { ccclass, property } = _decorator;


@ccclass('SpikesStateMachine')
export class SpikesStateMachine extends StateMachine {

  async init() {
    this.animationComponent = this.addComponent(Animation);

    this.initParams();
    this.initStateMachines();
    this.initAnimationEvent();

    await Promise.all(this.waitingList);
  }

  initParams() {
    this.params.set(PARAMS_NAME_ENUM.SPIKES_CUR_COUNT, getInitParamsNumber());
    this.params.set(PARAMS_NAME_ENUM.SPIKES_TOTAL_COUNT, getInitParamsNumber());
  }

  initStateMachines() {
    this.stateMachines.set(ENTITY_TYPE_ENUM.SPIKES_ONE, new SpikesOneSubStateMachine(this));
    this.stateMachines.set(ENTITY_TYPE_ENUM.SPIKES_TWO, new SpikesTwoSubStateMachine(this));
    this.stateMachines.set(ENTITY_TYPE_ENUM.SPIKES_THREE, new SpikesThreeSubStateMachine(this));
    this.stateMachines.set(ENTITY_TYPE_ENUM.SPIKES_FOUR, new SpikesFourSubStateMachine(this));
  }

  initAnimationEvent() {
    this.animationComponent.on(Animation.EventType.FINISHED, () => {
      const name = this.animationComponent.defaultClip.name;
      const value = this.getParams(PARAMS_NAME_ENUM.SPIKES_TOTAL_COUNT);
      if(
        (value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_ONE && name.includes(`spikesone/two`)) ||
        (value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_TWO && name.includes(`spikestwo/three`)) ||
        (value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_THREE && name.includes(`spikesthree/four`)) ||
        (value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_FOUR && name.includes(`spikesfour/five`))
      ){
        this.node.getComponent(SpikesManager).backZero();
      }
    }
    )
  }

  run() {
    const value = this.params.get(PARAMS_NAME_ENUM.SPIKES_TOTAL_COUNT).value;
    switch(this.currentState){
      case this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_FOUR):
      case this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_THREE):
      case this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_TWO):
      case this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_ONE):
        if(value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_ONE){
          this.currentState = this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_ONE) as State;
        }else if(value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_TWO){
          this.currentState = this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_TWO) as State;
        }else if(value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_THREE){
          this.currentState = this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_THREE) as State;
        }else if(value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_FOUR){
          this.currentState = this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_FOUR) as State;
        }
        else{
          this.currentState = this.currentState;
        }
        break;
      default:
        this.currentState = this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_ONE) as State;
    }
  }
}
