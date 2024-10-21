
import { _decorator, Component, Animation, Node, resources, Sprite, SpriteFrame, UITransform, AnimationClip, animation } from 'cc';
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager';
import ResourceManager from '../../Runtime/ResourceManager';
import { CONTROLLER_ENUM, DIRECTION_ENUM, DIRECTION_ORDER_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM, PARAMS_NAME_ENUM } from '../../Enums';
import EventManager from '../../Runtime/EventManager';
import { PlayerStateMachine } from './PlayerStateMachine';
import { EntityManager } from '../../Base/EntityManager';
import DataManager from '../../Runtime/DataManager';
import { IEntity } from '../../Level';
const { ccclass, property } = _decorator;

@ccclass('PlayerManager')
export class PlayerManager extends EntityManager {

  targetX: number = 0;
  targetY: number = 0;
  private readonly speed: number = 1/10;
  private ismoving: boolean = false;

  async init(params: IEntity) {

    this.fsm = this.addComponent(PlayerStateMachine);
    await this.fsm.init();

    super.init(params);
    this.targetX = this.x;
    this.targetY = this.y;

    EventManager.Instance.on(EVENT_ENUM.PLAYER_CTRL, this.inputHandle, this);
    EventManager.Instance.on(EVENT_ENUM.ATTACK_PLAYER, this.onDead, this);
  }
  onDestroy() {
    super.onDestroy();
    EventManager.Instance.off(EVENT_ENUM.PLAYER_CTRL, this.inputHandle);
    EventManager.Instance.off(EVENT_ENUM.ATTACK_PLAYER, this.onDead);
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

    if(Math.abs(this.x - this.targetX) < this.speed && Math.abs(this.y - this.targetY) < this.speed && this.ismoving){
      this.ismoving = false;
      this.x = this.targetX;
      this.y = this.targetY;
      EventManager.Instance.emit(EVENT_ENUM.PLAYER_MOVE_END);
    }
  }

  onDead(type: ENTITY_STATE_ENUM){
    this.state = type;
  }

  inputHandle(inputDirection: CONTROLLER_ENUM){
    //移动前用户输入处理

    if(this.state === ENTITY_STATE_ENUM.DEATH ||
      this.state === ENTITY_STATE_ENUM.AIRDEATH ||
      this.state === ENTITY_STATE_ENUM.ATTACK
    ){
      return;
    }

    if(this.ismoving){
      return;
    }

    const id = this.willAttack(inputDirection);
    if(id){
      EventManager.Instance.emit(EVENT_ENUM.ATTACK_ENEMY, id);
      EventManager.Instance.emit(EVENT_ENUM.DOOR_OPEN);
      return;
    }

    if(this.willBlock(inputDirection)){
      console.log('block');
      return;
    }

    this.move(inputDirection);
  }

  move(inputDirection: CONTROLLER_ENUM) {
    if(inputDirection === CONTROLLER_ENUM.TOP){
      this.targetY -= 1;
      this.ismoving = true;
    }else if(inputDirection === CONTROLLER_ENUM.BOTTOM){
      this.targetY += 1;
      this.ismoving = true;
    }else if(inputDirection === CONTROLLER_ENUM.LEFT){
      this.targetX -= 1;
      this.ismoving = true;
    }else if(inputDirection === CONTROLLER_ENUM.RIGHT){
      this.targetX += 1;
      this.ismoving = true;
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
      EventManager.Instance.emit(EVENT_ENUM.PLAYER_MOVE_END);
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
      EventManager.Instance.emit(EVENT_ENUM.PLAYER_MOVE_END);
    }
  }

  willBlock(inputDirection: CONTROLLER_ENUM): boolean {
    //解构当前人物与瓦片类型信息
    const {targetX:x, targetY:y, direction} = this;
    const {tileInfo} = DataManager.Instance;
    const {x:doorX, y:doorY, state:doorState} = DataManager.Instance.door;
    const enemies = DataManager.Instance.enemies.filter((enemy) => enemy.state !== ENTITY_STATE_ENUM.DEATH);

    let palyerNextX = x, palyerNextY = y;
    let weaponNextX, weaponNextY;
    let playerTile;
    let weaponTile;
    if(inputDirection === CONTROLLER_ENUM.TOP){
      palyerNextY = y - 1;
      if(palyerNextY < 0){
        this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
        return true;
      }

      if(direction === DIRECTION_ENUM.TOP){
        weaponNextY = y - 2;
        playerTile = tileInfo[x][palyerNextY];
        weaponTile = tileInfo[x][weaponNextY];
      }else if(direction === DIRECTION_ENUM.BOTTOM){
        weaponNextY = y;
        playerTile = tileInfo[x][palyerNextY];
        weaponTile = tileInfo[x][weaponNextY];
      }else if(direction === DIRECTION_ENUM.LEFT){
        weaponNextX = x - 1;
        weaponNextY = y - 1;
        playerTile = tileInfo[x][palyerNextY];
        weaponTile = tileInfo[weaponNextX][weaponNextY];
      }else if(direction === DIRECTION_ENUM.RIGHT){
        weaponNextX = x + 1;
        weaponNextY = y - 1;
        playerTile = tileInfo[x][palyerNextY];
        weaponTile = tileInfo[weaponNextX][weaponNextY];
      }

      //判断与门是否碰撞
      if(
        ((palyerNextX === doorX && palyerNextY === doorY) ||
          weaponNextX === doorX && weaponNextY === doorY) &&
        doorState !== ENTITY_STATE_ENUM.DEATH
      ){
        this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
        return true;
      }
      //判断与敌人是否碰撞
      for(let i = 0; i < enemies.length; i++){
        const enemy = enemies[i];
        if(
          (palyerNextX === enemy.x && palyerNextY === enemy.y) ||
          (weaponNextX === enemy.x && weaponNextY === enemy.y)
        ){
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
          return true;
        }
      }

      //判断地图是否碰撞
      if(playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)){
        //如果存在这个瓦片且可走、并且不存在武器瓦片或武器瓦片可转，则不会碰撞
      }else{
        this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
        return true;
      }

    }else if(inputDirection === CONTROLLER_ENUM.BOTTOM){
      palyerNextY = y + 1;
      if(palyerNextY >= tileInfo[0].length){
        this.state = ENTITY_STATE_ENUM.BLOCKBACK;
        return true;
      }

      if(direction === DIRECTION_ENUM.TOP){
        weaponNextY = y;
        playerTile = tileInfo[x][palyerNextY];
        weaponTile = tileInfo[x][weaponNextY];
      }else if(direction === DIRECTION_ENUM.BOTTOM){
        weaponNextY = y + 2;
        playerTile = tileInfo[x][palyerNextY];
        weaponTile = tileInfo[x][weaponNextY];
      }else if(direction === DIRECTION_ENUM.LEFT){
        weaponNextX = x - 1;
        weaponNextY = y + 1;
        playerTile = tileInfo[x][palyerNextY];
        weaponTile = tileInfo[weaponNextX][weaponNextY];
      }else if(direction === DIRECTION_ENUM.RIGHT){
        weaponNextX = x + 1;
        weaponNextY = y + 1;
        playerTile = tileInfo[x][palyerNextY];
        weaponTile = tileInfo[weaponNextX][weaponNextY];
      }

      if(
        ((palyerNextX === doorX && palyerNextY === doorY) || (weaponNextX === doorX && weaponNextY === doorY)) &&
        doorState !== ENTITY_STATE_ENUM.DEATH
      ){
        this.state = ENTITY_STATE_ENUM.BLOCKBACK;
        return true;
      }

      for(let i = 0; i < enemies.length; i++){
        const enemy = enemies[i];
        if(
          (palyerNextX === enemy.x && palyerNextY === enemy.y) ||
          (weaponNextX === enemy.x && weaponNextY === enemy.y)
        ){
          this.state = ENTITY_STATE_ENUM.BLOCKBACK;
          return true;
        }
      }

      //判断地图是否碰撞
      if(playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)){

      }else{
        this.state = ENTITY_STATE_ENUM.BLOCKBACK;
        return true;
      }

    }else if(inputDirection === CONTROLLER_ENUM.LEFT){
      palyerNextX = x - 1;
      if(palyerNextX < 0){
        this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
        return true;
      }

      if(direction === DIRECTION_ENUM.TOP){
        weaponNextX = x - 1;
        weaponNextY = y - 1;
        playerTile = tileInfo[palyerNextX][y];
        weaponTile = tileInfo[weaponNextX][weaponNextY];
      }else if(direction === DIRECTION_ENUM.BOTTOM){
        weaponNextX = x - 1;
        weaponNextY = y + 1;
        playerTile = tileInfo[palyerNextX][y];
        weaponTile = tileInfo[weaponNextX][weaponNextY];
      }else if(direction === DIRECTION_ENUM.LEFT){
        weaponNextX = x - 2;
        playerTile = tileInfo[palyerNextX][y];
        weaponTile = tileInfo[weaponNextX][y];
      }else if(direction === DIRECTION_ENUM.RIGHT){
        weaponNextX = x;
        playerTile = tileInfo[palyerNextX][y];
        weaponTile = tileInfo[weaponNextX][y];
      }

      if(
        ((palyerNextX === doorX && palyerNextY === doorY) || (weaponNextX === doorX && weaponNextY === doorY)) &&
        doorState !== ENTITY_STATE_ENUM.DEATH
      ){
        this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
        return true;
      }

      for(let i = 0; i < enemies.length; i++){
        const enemy = enemies[i];
        if(
          (palyerNextX === enemy.x && palyerNextY === enemy.y) ||
          (weaponNextX === enemy.x && weaponNextY === enemy.y)
        ){
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
          return true;
        }
      }

      //判断地图是否碰撞
      if(playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)){

      }else{
        this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
        return true;
      }

    }else if(inputDirection === CONTROLLER_ENUM.RIGHT){
      palyerNextX = x + 1;
      if(palyerNextX >= tileInfo.length){
        this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
        return true;
      }

      if(direction === DIRECTION_ENUM.TOP){
        weaponNextX = x + 1;
        weaponNextY = y - 1;
        playerTile = tileInfo[palyerNextX][y];
        weaponTile = tileInfo[weaponNextX][weaponNextY];
      }else if(direction === DIRECTION_ENUM.BOTTOM){
        weaponNextX = x + 1;
        weaponNextY = y + 1;
        playerTile = tileInfo[palyerNextX][y];
        weaponTile = tileInfo[weaponNextX][weaponNextY];
      }else if(direction === DIRECTION_ENUM.LEFT){
        weaponNextX = x;
        playerTile = tileInfo[palyerNextX][y];
        weaponTile = tileInfo[weaponNextX][y];
      }else if(direction === DIRECTION_ENUM.RIGHT){
        weaponNextX = x + 2;
        playerTile = tileInfo[palyerNextX][y];
        weaponTile = tileInfo[weaponNextX][y];
      }

      if(
        ((palyerNextX === doorX && palyerNextY === doorY) || (weaponNextX === doorX && weaponNextY === doorY)) &&
        doorState !== ENTITY_STATE_ENUM.DEATH
      ){
        this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
        return true;
      }

      for(let i = 0; i < enemies.length; i++){
        const enemy = enemies[i];
        if(
          (palyerNextX === enemy.x && palyerNextY === enemy.y) ||
          (weaponNextX === enemy.x && weaponNextY === enemy.y)
        ){
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
          return true;
        }
      }

      //判断地图是否碰撞
      if(playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)){

      }else{
        this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
        return true;
      }

    }else if(inputDirection === CONTROLLER_ENUM.TURNLEFT){
      let nextX, nextY;
      if(direction === DIRECTION_ENUM.TOP){
        nextX = x - 1;
        nextY = y - 1;
      }else if(direction === DIRECTION_ENUM.BOTTOM){
        nextX = x + 1;
        nextY = y + 1;
      }else if(direction === DIRECTION_ENUM.LEFT){
        nextX = x - 1;
        nextY = y + 1;
      }else if(direction === DIRECTION_ENUM.RIGHT){
        nextX = x + 1;
        nextY = y - 1;
      }

      //判断左前半三格子是否与门碰撞
      if(
        ((x === doorX && nextY === doorY) ||
          (nextX === doorX && y === doorY) ||
          (nextX === doorX && nextY === doorY)) &&
          doorState !== ENTITY_STATE_ENUM.DEATH
      ){
        this.state = ENTITY_STATE_ENUM.BLOCKTURNLEFT;
        return true
      }

      //判断左前半三格子是否与敌人碰撞
      for(let i = 0; i<enemies.length; i++){
        const {x: enemyX, y: enemyY} = enemies[i];
        if(
          (x === enemyX && nextY === enemyY) ||
          (nextX === enemyX && y === enemyY) ||
          (nextX === enemyX && nextY === enemyY)
        ){
          this.state = ENTITY_STATE_ENUM.BLOCKTURNLEFT;
          return true
        }
      }

      //判断左前半三个格子是否障碍物
      if (
        (!tileInfo[x]?.[nextY] || tileInfo[x]?.[nextY].turnable) &&
        (!tileInfo[nextX]?.[y] || tileInfo[nextX]?.[y].turnable) &&
        (!tileInfo[nextX]?.[nextY] || tileInfo[nextX]?.[nextY].turnable)
      ) {

      } else {
        this.state = ENTITY_STATE_ENUM.BLOCKTURNLEFT;
        return true
      }

    }else if(inputDirection === CONTROLLER_ENUM.TURNRIGHT){
      let nextX, nextY;
      if(direction === DIRECTION_ENUM.TOP){
        nextX = x + 1;
        nextY = y - 1;
      }else if(direction === DIRECTION_ENUM.BOTTOM){
        nextX = x - 1;
        nextY = y + 1;
      }else if(direction === DIRECTION_ENUM.LEFT){
        nextX = x - 1;
        nextY = y - 1;
      }else if(direction === DIRECTION_ENUM.RIGHT){
        nextX = x + 1;
        nextY = y + 1;
      }

      if(
        ((x === doorX && nextY === doorY) ||
          (nextX === doorX && y === doorY) ||
          (nextX === doorX && nextY === doorY)) &&
          doorState !== ENTITY_STATE_ENUM.DEATH
      ){
        this.state = ENTITY_STATE_ENUM.BLOCKTURNRIGHT;
        return true
      }

      for(let i = 0; i<enemies.length; i++){
        const {x: enemyX, y: enemyY} = enemies[i];
        if(
          (x === enemyX && nextY === enemyY) ||
          (nextX === enemyX && y === enemyY) ||
          (nextX === enemyX && nextY === enemyY)
        ){
          this.state = ENTITY_STATE_ENUM.BLOCKTURNRIGHT;
          return true
        }
      }

      if (
        (!tileInfo[x]?.[nextY] || tileInfo[x]?.[nextY].turnable) &&
        (!tileInfo[nextX]?.[y] || tileInfo[nextX]?.[y].turnable) &&
        (!tileInfo[nextX]?.[nextY] || tileInfo[nextX]?.[nextY].turnable)
      ) {

      } else {
        this.state = ENTITY_STATE_ENUM.BLOCKTURNRIGHT;
        return true
      }
    }

    return false;
  }

  willAttack(type: CONTROLLER_ENUM) {
    const enemies = DataManager.Instance.enemies.filter(enemy => enemy.state !== ENTITY_STATE_ENUM.DEATH);
    for(let i = 0; i < enemies.length; i++){
      const {x: enemyX, y: enemyY, id: enemyId} = enemies[i];
      if(
        type === CONTROLLER_ENUM.TOP &&
        this.direction === DIRECTION_ENUM.TOP &&
        enemyX === this.x && enemyY === this.targetY - 2
      ){
        this.state = ENTITY_STATE_ENUM.ATTACK;
        return enemyId;
      }else if(
        type === CONTROLLER_ENUM.BOTTOM &&
        this.direction === DIRECTION_ENUM.BOTTOM &&
        enemyX === this.x && enemyY === this.targetY + 2
      ){
        this.state = ENTITY_STATE_ENUM.ATTACK;
        return enemyId;
      }else if(
        type === CONTROLLER_ENUM.LEFT &&
        this.direction === DIRECTION_ENUM.LEFT &&
        enemyY === this.y && enemyX === this.targetX - 2
      ){
        this.state = ENTITY_STATE_ENUM.ATTACK;
        return enemyId;
      }else if(
        type === CONTROLLER_ENUM.RIGHT &&
        this.direction === DIRECTION_ENUM.RIGHT &&
        enemyY === this.y && enemyX === this.targetX + 2
      ){
        this.state = ENTITY_STATE_ENUM.ATTACK;
        return enemyId;
      }
    }

    return '';
  }
}

