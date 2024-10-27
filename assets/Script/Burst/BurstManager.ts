
import { _decorator, UITransform } from 'cc';

import { EntityManager } from '../../Base/EntityManager';
import { IEntity } from '../../Level';
import EventManager from '../../Runtime/EventManager';
import DataManager from '../../Runtime/DataManager';
import { BurstStateMachine } from './BurstStateMachine';
import { ENTITY_STATE_ENUM, EVENT_ENUM, SHAKE_TYPE_ENUM } from '../../Enums';
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager';


const { ccclass, property } = _decorator;

@ccclass('BurstManager')
export class BurstManager extends EntityManager {
  async init(params: IEntity) {

    this.fsm = this.addComponent(BurstStateMachine);
    await this.fsm.init();

    super.init(params);

    const transform = this.getComponent(UITransform);
    transform.setContentSize(TILE_WIDTH, TILE_HEIGHT);

    EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onBurst, this);
  }
  onDestroy() {
    super.onDestroy();
    EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.onBurst);
  }

  update(){
    this.node.setPosition(this.x * TILE_WIDTH, -this.y * TILE_HEIGHT);
  }

  onBurst() {

    if(this.state === ENTITY_STATE_ENUM.DEATH || !DataManager.Instance.player){
      return;
    }

    const {x:playerX, y:playerY, state:playerState} = DataManager.Instance.player;

    //当玩家移动到当前位置时进入攻击状态，如果玩家下一次行动结束后仍在该位置则进入死亡状态并触发攻击玩家事件
    if(this.x === playerX && this.y === playerY && this.state === ENTITY_STATE_ENUM.IDLE){
      this.state = ENTITY_STATE_ENUM.ATTACK;
    }else if(this.state === ENTITY_STATE_ENUM.ATTACK){
      this.state = ENTITY_STATE_ENUM.DEATH;
      EventManager.Instance.emit(EVENT_ENUM.SCREEN_SHAKE, SHAKE_TYPE_ENUM.BOTTOM);
      if(this.x === playerX && this.y === playerY){
        EventManager.Instance.emit(EVENT_ENUM.ATTACK_PLAYER, ENTITY_STATE_ENUM.AIRDEATH);
      }
    }
  }
}

