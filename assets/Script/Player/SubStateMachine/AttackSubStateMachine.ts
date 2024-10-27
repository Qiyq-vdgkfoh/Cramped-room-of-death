import { StateMachine } from "../../../Base/StateMachine";
import { DIRECTION_ENUM, SHAKE_TYPE_ENUM, } from "../../../Enums";
import State, { ANIMATION_SPEED } from "../../../Base/State";
import DirectionSubStateMachine from "../../../Base/DirectionSubStateMachine";
import { AnimationClip } from "cc";

const BASE_URL = 'texture/player/attack';

export default class AttackSubStateMachine extends DirectionSubStateMachine {
  constructor(fsm: StateMachine) {
    super(fsm);
    this.stateMachines.set(DIRECTION_ENUM.TOP,
      new State(fsm, `${BASE_URL}/top`,AnimationClip.WrapMode.Normal, ANIMATION_SPEED,
        [{//帧事件：触发帧数、回调函数、参数
          frame: ANIMATION_SPEED*4,
          func: 'onAttackShake',//寻找组件所在节点上是否有该方法
          params: [SHAKE_TYPE_ENUM.TOP]
        },]
      )),
    this.stateMachines.set(DIRECTION_ENUM.BOTTOM,
      new State(fsm, `${BASE_URL}/bottom`,AnimationClip.WrapMode.Normal, ANIMATION_SPEED,
        [{
          frame: ANIMATION_SPEED*4,
          func: 'onAttackShake',
          params: [SHAKE_TYPE_ENUM.BOTTOM]
        },]
      )),
    this.stateMachines.set(DIRECTION_ENUM.LEFT,
      new State(fsm, `${BASE_URL}/left`, AnimationClip.WrapMode.Normal, ANIMATION_SPEED,
        [{
          frame: ANIMATION_SPEED*4,
          func: 'onAttackShake',
          params: [SHAKE_TYPE_ENUM.LEFT]
        },]
      )),
    this.stateMachines.set(DIRECTION_ENUM.RIGHT,
      new State(fsm, `${BASE_URL}/right`, AnimationClip.WrapMode.Normal, ANIMATION_SPEED,
        [{
          frame: ANIMATION_SPEED*4,
          func: 'onAttackShake',
          params: [SHAKE_TYPE_ENUM.RIGHT]
        },]
      ))
  }
}
