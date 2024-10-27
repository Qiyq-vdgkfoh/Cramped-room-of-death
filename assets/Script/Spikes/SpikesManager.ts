
import { _decorator, Component,  Sprite,  UITransform, } from 'cc';
import { randomByLen } from '../../Utils/indext';
import { StateMachine } from '../../Base/StateMachine';
import { IEntity, ISpikes } from '../../Level';
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager';
import { DIRECTION_ENUM, DIRECTION_ORDER_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM, PARAMS_NAME_ENUM, SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM } from '../../Enums';
import { SpikesStateMachine } from './SpikesStateMachine';
import EventManager from '../../Runtime/EventManager';
import DataManager from '../../Runtime/DataManager';

const { ccclass, property } = _decorator;

@ccclass('SpikesManager')
export class SpikesManager extends Component {

  id: string = randomByLen(12);
  x: number = 0;
  y: number = 0;
  type: ENTITY_TYPE_ENUM;
  fsm:StateMachine;

  private _count: number;
  private _totalCount: number;

  get count() {
    return this._count;
  }
  set count(newCount: number) {
    this._count = newCount;
    this.fsm.setParams(PARAMS_NAME_ENUM.SPIKES_CUR_COUNT, newCount);
  }

  get totalCount() {
    return this._totalCount;
  }
  set totalCount(newCount: number) {
    this._totalCount = newCount;
    this.fsm.setParams(PARAMS_NAME_ENUM.SPIKES_TOTAL_COUNT, newCount);
  }

  async init(params: ISpikes) {

    const sprite = this.addComponent(Sprite);
    sprite.sizeMode = Sprite.SizeMode.CUSTOM;

    const transform = this.getComponent(UITransform);
    transform.setContentSize(TILE_WIDTH*4, TILE_HEIGHT*4);

    this.fsm = this.addComponent(SpikesStateMachine);
    await this.fsm.init();

    this.x = params.x;
    this.y = params.y;
    this.type = params.type;
    this.count = params.count;
    this.totalCount = SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM[this.type];

    EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onLoop, this);
  }
  onDestroy(){
    EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.onLoop);
  }

  update(){

    this.node.setPosition(this.x * TILE_WIDTH - TILE_WIDTH * 1.5, -this.y * TILE_HEIGHT + TILE_HEIGHT * 1.5);
  }

  onLoop(){
    if(this.count === this.totalCount){
      this.count = 1;
    }else{
      this.count++;
    }

    this.onAttack();
  }

  backZero(){
    this.count = 0;
  }

  onAttack(){
    if(!DataManager.Instance.player){
      return;
    }

    const {x:playerX, y:playerY} = DataManager.Instance.player;
    if(this.x === playerX && this.y === playerY && this.count === this.totalCount){
      EventManager.Instance.emit(EVENT_ENUM.ATTACK_PLAYER, ENTITY_STATE_ENUM.DEATH);
    }
  }
}

