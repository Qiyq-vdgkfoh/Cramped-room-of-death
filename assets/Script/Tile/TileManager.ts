
import { _decorator, Component, Layers, Node, resources, Sprite, SpriteFrame, UITransform } from 'cc';
import Levels from '../../Level';
import { createUINode } from '../../Utils/indext';
import { TILE_TYPE_ENUM } from '../../Enums';

const { ccclass, property } = _decorator;


export const TILE_WIDTH = 55;
export const TILE_HEIGHT = 55;

@ccclass('TileManager')
export class TileManager extends Component {
  //十种瓦片共三种类型：可走可走、不可走可转、不可走不可转
  type: TILE_TYPE_ENUM;
  moveable: boolean;
  turnable: boolean;

  init(type: TILE_TYPE_ENUM, spriteFrame: SpriteFrame, i: number, j: number) {
    this.type = type;
    if(this.type === TILE_TYPE_ENUM.WALL_ROW ||
      this.type === TILE_TYPE_ENUM.WALL_COLUMN ||
      this.type === TILE_TYPE_ENUM.WALL_LEFT_TOP ||
      this.type === TILE_TYPE_ENUM.WALL_RIGHT_TOP ||
      this.type === TILE_TYPE_ENUM.WALL_LEFT_BOTTOM ||
      this.type === TILE_TYPE_ENUM.WALL_RIGHT_BOTTOM
    ) {
      //六种墙壁不可走不可转
      this.moveable = false;
      this.turnable = false;
    } else if(this.type === TILE_TYPE_ENUM.CLIFF_CENTER ||
      this.type === TILE_TYPE_ENUM.CLIFF_LEFT ||
      this.type === TILE_TYPE_ENUM.CLIFF_RIGHT
    ){
      //三种悬崖不可走可转
      this.moveable = false;
      this.turnable = true;
    }else if(this.type === TILE_TYPE_ENUM.FLOOR) {
      //一种地板可走可转
      this.moveable = true;
      this.turnable = true;
    }


    const sprite = this.addComponent(Sprite);
    sprite.spriteFrame = spriteFrame;

    const transform = this.getComponent(UITransform);
    transform.setContentSize(TILE_WIDTH, TILE_HEIGHT);

    this.node.setPosition(i * TILE_WIDTH, -j * TILE_HEIGHT);
  }
}

