
import { _decorator } from 'cc';
import { EntityManager } from '../../Base/EntityManager';
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from '../../Enums';
import EventManager from '../../Runtime/EventManager';
import { DoorStateMachine } from './DoorStateMachine';
import DataManager from '../../Runtime/DataManager';


const { ccclass, property } = _decorator;

@ccclass('DoorManager')
export class DoorManager extends EntityManager {
  async init() {

    this.fsm = this.addComponent(DoorStateMachine);
    await this.fsm.init();
    super.init({
      x: 7,
      y: 8,
      type: ENTITY_TYPE_ENUM.DOOR,
      direction: DIRECTION_ENUM.TOP,
      state: ENTITY_STATE_ENUM.IDLE,
    });

    EventManager.Instance.on(EVENT_ENUM.DOOR_OPEN, this.onOpen, this);

  }
  onDestroy() {
    super.onDestroy();
    EventManager.Instance.off(EVENT_ENUM.DOOR_OPEN, this.onOpen);
  }

  update(){

    super.update();
  }

  onOpen() {
    if(
      DataManager.Instance.enemies.every(enemy => enemy.state === ENTITY_STATE_ENUM.DEATH) &&
      this.state !== ENTITY_STATE_ENUM.DEATH)
      {
        this.state = ENTITY_STATE_ENUM.DEATH;
      }
  }
}

