
import { _decorator } from 'cc';
import { EntityManager } from './EntityManager';
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, EVENT_ENUM } from '../Enums';
import DataManager from '../Runtime/DataManager';
import EventManager from '../Runtime/EventManager';
import { IEntity } from '../Level';


const { ccclass, property } = _decorator;

@ccclass('EnemyManager')
export class EnemyManager extends EntityManager {
  async init(params: IEntity) {

    super.init(params);

    EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onChangeDirection, this);
    EventManager.Instance.on(EVENT_ENUM.PLAYER_BORN, this.onChangeDirection, this);
    EventManager.Instance.on(EVENT_ENUM.ATTACK_ENEMY, this.onDead, this);

    this.onChangeDirection(true);
  }
  onDestroy() {
    super.onDestroy();
    EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.onChangeDirection);
    EventManager.Instance.off(EVENT_ENUM.PLAYER_BORN, this.onChangeDirection);
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


  onDead(id:string) {
    if(this.state === ENTITY_STATE_ENUM.DEATH){
      return;
    }
    if(id === this.id){
      this.state = ENTITY_STATE_ENUM.DEATH;
    }
  }

}

