
import { _decorator } from 'cc';
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from '../../../Enums';
import { IronSkeletonStateMachine } from './IronSkeletonStateMachine';
import EventManager from '../../../Runtime/EventManager';
import DataManager from '../../../Runtime/DataManager';
import { EnemyManager } from '../../../Base/EnemyManager';
import { IEntity } from '../../../Level';

const { ccclass, property } = _decorator;

@ccclass('IronSkeletonManager')
export class IronSkeletonManager extends EnemyManager {
  async init(params: IEntity) {

    this.fsm = this.addComponent(IronSkeletonStateMachine);
    await this.fsm.init();

    super.init(params);
  }
}

