
import { _decorator, Component,  Sprite,  UITransform, } from 'cc';

import { DIRECTION_ENUM, DIRECTION_ORDER_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, PARAMS_NAME_ENUM } from '../Enums';
import { IEntity } from '../Level';
import { PlayerStateMachine } from '../Script/Player/PlayerStateMachine';
import { TILE_HEIGHT, TILE_WIDTH } from '../Script/Tile/TileManager';
const { ccclass, property } = _decorator;

@ccclass('EntityManager')
export class EntityManager extends Component {

  x: number = 0;
  y: number = 0;
  type: ENTITY_TYPE_ENUM;
  fsm:PlayerStateMachine;

  private _direction: DIRECTION_ENUM;
  private _state: ENTITY_STATE_ENUM;

  get direction() {
    return this._direction;
  }
  set direction(newDirection: DIRECTION_ENUM) {
    this._direction = newDirection;
    this.fsm.setParams(PARAMS_NAME_ENUM.DIRECTION, DIRECTION_ORDER_ENUM[this._direction]);
    //private _state:ENTITY_STATE_ENUM 是string类型(枚举)而StateMachine中params的value里方向是number类型无法接收string
    //所以DIRECTION_ORDER_ENUM[this._direction]通过两个同key枚举将string类型映射转换为number类型
  }

  get state() {
    return this._state;
  }
  set state(newState: ENTITY_STATE_ENUM) {
    this._state = newState;
    this.fsm.setParams(this._state, true);//变更角色状态的数据后驱动UI改变
  }

  async init(params: IEntity) {

    const sprite = this.addComponent(Sprite);
    sprite.sizeMode = Sprite.SizeMode.CUSTOM;

    const transform = this.getComponent(UITransform);
    transform.setContentSize(TILE_WIDTH*4, TILE_HEIGHT*4);

    this.x = params.x;
    this.y = params.y;
    this.type = params.type;
    this.direction = params.direction;
    this.state = params.state;
  }

  update(){

    this.node.setPosition(this.x * TILE_WIDTH - TILE_WIDTH * 1.5, -this.y * TILE_HEIGHT + TILE_HEIGHT * 1.5);
  }
}

