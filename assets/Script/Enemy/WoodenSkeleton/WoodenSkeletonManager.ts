
import { _decorator } from 'cc';
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from '../../../Enums';
import { WoodenSkeletonStateMachine } from './WoodenSkeletonStateMachine';
import EventManager from '../../../Runtime/EventManager';
import DataManager from '../../../Runtime/DataManager';
import { EnemyManager } from '../../../Base/EnemyManager';
import { IEntity } from '../../../Level';

const { ccclass, property } = _decorator;

@ccclass('WoodenSkeletonManager')
export class WoodenSkeletonManager extends EnemyManager {
  async init(params: IEntity) {

    this.fsm = this.addComponent(WoodenSkeletonStateMachine);
    await this.fsm.init();

    super.init(params);

    EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onAttack, this);
  }
  onDestroy() {
    super.onDestroy();
    EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.onAttack);
  }

  update(){
    super.update();
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
}

