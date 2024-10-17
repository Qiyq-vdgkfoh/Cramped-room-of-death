
import { _decorator, Component, Animation, Node, resources, Sprite, SpriteFrame, UITransform, AnimationClip, animation } from 'cc';
import { EntityManager } from '../../../Base/EntityManager';
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from '../../../Enums';
import { WoodenSkeletonStateMachine } from './WoodenSkeletonStateMachine';
import EventManager from '../../../Runtime/EventManager';
import DataManager from '../../../Runtime/DataManager';

const { ccclass, property } = _decorator;

@ccclass('WoodenSkeletonManager')
export class WoodenSkeletonManager extends EntityManager {
  async init() {

    this.fsm = this.addComponent(WoodenSkeletonStateMachine);
    await this.fsm.init();

    super.init({
      x: 2,
      y: 4,
      type: ENTITY_TYPE_ENUM.ENEMY,
      direction: DIRECTION_ENUM.TOP,
      state: ENTITY_STATE_ENUM.IDLE,
    });

    EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onChangeDirection, this);
    EventManager.Instance.on(EVENT_ENUM.PLAYER_BORN, this.onChangeDirection, this);
    EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onAttack, this);
    EventManager.Instance.on(EVENT_ENUM.ATTACK_ENEMY, this.onDead, this);

    this.onChangeDirection(true);
  }
  onDestroy() {
    super.onDestroy();
    EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.onChangeDirection);
    EventManager.Instance.off(EVENT_ENUM.PLAYER_BORN, this.onChangeDirection);
    EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.onAttack);
    EventManager.Instance.off(EVENT_ENUM.ATTACK_ENEMY, this.onDead);
  }

  update(){

    super.update();
  }

  onChangeDirection(isInit: boolean = false) {

    if(this.state === ENTITY_STATE_ENUM.DEATH || !DataManager.Instance.player){
      return;
    }

    const {x:playerX, y:playerY} = DataManager.Instance.player;

    const disX = Math.abs(playerX - this.x);
    const disY = Math.abs(playerY - this.y);

    if(disX === disY && !isInit){
      return;
    }

    if(playerX >= this.x && playerY <= this.y){
      this.direction = disY > disX ? DIRECTION_ENUM.TOP : DIRECTION_ENUM.RIGHT;
    }else if(playerX <= this.x && playerY <= this.y){
      this.direction = disY > disX ? DIRECTION_ENUM.TOP : DIRECTION_ENUM.LEFT;
    }else if(playerX <= this.x && playerY >= this.y){
      this.direction = disY > disX ? DIRECTION_ENUM.BOTTOM : DIRECTION_ENUM.LEFT;
    }else if(playerX >= this.x && playerY >= this.y){
      this.direction = disY > disX ? DIRECTION_ENUM.BOTTOM : DIRECTION_ENUM.RIGHT;
    }
  }

  onAttack() {

    if(this.state === ENTITY_STATE_ENUM.DEATH || !DataManager.Instance.player){
      return;
    }

    const {x:playerX, y:playerY, state:playerState} = DataManager.Instance.player;

    if(
    (playerX === this.x && Math.abs(playerY - this.y) <= 1) ||
    (playerY === this.y && Math.abs(playerX - this.x) <= 1) &&
    playerState !== ENTITY_STATE_ENUM.DEATH &&
    playerState !== ENTITY_STATE_ENUM.ATTACK)
    {
      this.state = ENTITY_STATE_ENUM.ATTACK;
      EventManager.Instance.emit(EVENT_ENUM.ATTACK_PLAYER, ENTITY_STATE_ENUM.DEATH);
    }else{
      this.state = ENTITY_STATE_ENUM.IDLE;
    }
  }

  onDead(id:string) {
    if(this.state === ENTITY_STATE_ENUM.DEATH){
      return;
    }
    if(id === this.id){
      this.state = ENTITY_STATE_ENUM.DEATH;
    }
  }

}

