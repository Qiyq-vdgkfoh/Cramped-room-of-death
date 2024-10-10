
import { _decorator, Component, Animation, Node, resources, Sprite, SpriteFrame, UITransform, AnimationClip, animation } from 'cc';
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager';
import ResourceManager from '../../Runtime/ResourceManager';
import { CONTROLLER_ENUM, DIRECTION_ENUM, DIRECTION_ORDER_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM, PARAMS_NAME_ENUM } from '../../Enums';
import EventManager from '../../Runtime/EventManager';
import { PlayerStateMachine } from './PlayerStateMachine';
import { EntityManager } from '../../Base/EntityManager';
const { ccclass, property } = _decorator;

@ccclass('PlayerManager')
export class PlayerManager extends EntityManager {

  targetX: number = 0;
  targetY: number = 0;
  private readonly speed: number = 1/10;

  async init() {

    this.fsm = this.addComponent(PlayerStateMachine);
    await this.fsm.init();

    super.init({
      x: 0,
      y: 0,
      type: ENTITY_TYPE_ENUM.PLAYER,
      direction: DIRECTION_ENUM.TOP,
      state: ENTITY_STATE_ENUM.IDLE,
    });

    EventManager.Instance.on(EVENT_ENUM.PLAYER_CTRL, this.move, this);
  }

  update(){
    this.updateXY();
    super.update();
  }

  updateXY() {
    if(this.targetX < this.x){
      this.x -= this.speed;
    }else if(this.targetX > this.x){
      this.x += this.speed;
    }

    if(this.targetY < this.y){
      this.y -= this.speed;
    }else if(this.targetY > this.y){
      this.y += this.speed;
    }

    if(Math.abs(this.x - this.targetX) < this.speed && Math.abs(this.y - this.targetY) < this.speed){
      this.x = this.targetX;
      this.y = this.targetY;
    }
  }

  move(inputDirection: CONTROLLER_ENUM) {
    if(inputDirection === CONTROLLER_ENUM.TOP){
      this.targetY -= 1;
    }else if(inputDirection === CONTROLLER_ENUM.BOTTOM){
      this.targetY += 1;
    }else if(inputDirection === CONTROLLER_ENUM.LEFT){
      this.targetX -= 1;
    }else if(inputDirection === CONTROLLER_ENUM.RIGHT){
      this.targetX += 1;
    }else if(inputDirection === CONTROLLER_ENUM.TURNLEFT){
      if(this.direction === DIRECTION_ENUM.TOP){
        this.direction = DIRECTION_ENUM.LEFT;
      }else if(this.direction === DIRECTION_ENUM.LEFT){
        this.direction = DIRECTION_ENUM.BOTTOM;
      }else if(this.direction === DIRECTION_ENUM.BOTTOM){
        this.direction = DIRECTION_ENUM.RIGHT;
      }else if(this.direction === DIRECTION_ENUM.RIGHT){
        this.direction = DIRECTION_ENUM.TOP;
      }
      //this.fsm.setParams(PARAMS_NAME_ENUM.TURNLEFT, true);这里直接设置了UI
      //数据、UI分离思想：任何操作应当先改变数据，再由数据驱动UI改变(因为有时候需要记录一些数据方便后续其他操作)
      this.state = ENTITY_STATE_ENUM.TURNLEFT;//先改变状态的数据
    }else if(inputDirection === CONTROLLER_ENUM.TURNRIGHT){
      if(this.direction === DIRECTION_ENUM.TOP){
        this.direction = DIRECTION_ENUM.RIGHT;
      }else if(this.direction === DIRECTION_ENUM.RIGHT){
        this.direction = DIRECTION_ENUM.BOTTOM;
      }else if(this.direction === DIRECTION_ENUM.BOTTOM){
        this.direction = DIRECTION_ENUM.LEFT;
      }else if(this.direction === DIRECTION_ENUM.LEFT){
        this.direction = DIRECTION_ENUM.TOP;
      }
      this.state = ENTITY_STATE_ENUM.TURNRIGHT;
    }
  }
}

