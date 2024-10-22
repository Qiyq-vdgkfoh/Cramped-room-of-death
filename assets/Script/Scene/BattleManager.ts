import { WoodenSkeletonManager } from './../Enemy/WoodenSkeleton/WoodenSkeletonManager';

import { _decorator, Component, Node } from 'cc';
import { TileMapManager } from '../Tile/TileMapManager';
import { createUINode } from '../../Utils/indext';
import Levels, { ILevel } from '../../Level';
import DataManager from '../../Runtime/DataManager';
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager';
import EventManager from '../../Runtime/EventManager';
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from '../../Enums';
import { PlayerManager } from '../Player/PlayerManager';
import { DoorManager } from '../Door/DoorManager';
import { IronSkeletonManager } from '../Enemy/IronSkeleton/IronSkeletonManager';
import { BurstManager } from '../Burst/BurstManager';
import { SpikesManager } from '../Spikes/SpikesManager';
import { SmokeManager } from '../Smoke/SmokeManager';
import FaderManager from '../../Runtime/FaderManager';
const { ccclass, property } = _decorator;


@ccclass('BattleManager')
export class BattleManager extends Component {

    level:ILevel;
    stage:Node;
    private smokeLayer:Node;

    onLoad () {
        DataManager.Instance.levelIndex = 1;
        EventManager.Instance.on(EVENT_ENUM.NEXT_LEVEL, this.nextLevel, this);//绑定事件(事件名称、回调函数、上下文)
        EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.checkArrived, this);
        EventManager.Instance.on(EVENT_ENUM.SHOW_SMOKE, this.generateSmoke, this);
    }
    onDestroy () {
        EventManager.Instance.off(EVENT_ENUM.NEXT_LEVEL, this.nextLevel);//解绑事件
        EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.checkArrived);
        EventManager.Instance.off(EVENT_ENUM.SHOW_SMOKE, this.generateSmoke);
    }

    start () {
        this.generateStage();
        this.initLevel();
    }

    async initLevel() {
        const level = Levels[`level${DataManager.Instance.levelIndex}`];
        if (level) {
            await FaderManager.Instance.fadeIn();

            this.clearLevel();
            this.level = level;
            //将关卡地图信息存储到数据中心
            DataManager.Instance.mapInfo = this.level.mapInfo;
            DataManager.Instance.mapRowCount = this.level.mapInfo.length || 0;
            DataManager.Instance.mapColumnCount = this.level.mapInfo[0].length || 0;

            await Promise.all([
                this.generateTileMap(),
                this.generateDoor(),
                this.generateBurst(),
                this.generateSpikes(),
                this.generateSmokeLayer(),
                this.generatePlayer(),
                this.generateEnemy(),
            ]);

            await FaderManager.Instance.fadeOut();
        }
    }

    nextLevel() {
        DataManager.Instance.levelIndex++;
        this.initLevel();
    }

    clearLevel() {
        this.stage.destroyAllChildren();
        DataManager.Instance.reset();
    }

    generateStage() {
        this.stage = createUINode();
        this.stage.setParent(this.node);
    }

    async generateTileMap() {
        const tileMap = createUINode();
        tileMap.setParent(this.stage);
        const tileMapManager = tileMap.addComponent(TileMapManager);
        await tileMapManager.init();

        this.adaptPos();
    }

    async generateDoor() {
        const door = createUINode();
        door.setParent(this.stage);
        const doorManager = door.addComponent(DoorManager);
        await doorManager.init(this.level.door);
        DataManager.Instance.door = doorManager;
    }

    async generateBurst() {
        const promise = [];
        for(let i = 0; i < this.level.bursts.length; i++){
            const burst = this.level.bursts[i];
            const onde = createUINode();
            onde.setParent(this.stage);
            const burstManager = onde.addComponent(BurstManager);
            promise.push(burstManager.init(burst));
            DataManager.Instance.bursts.push(burstManager);
        }
        await Promise.all(promise);
    }

    async generateSpikes() {
        const promise = [];
        for(let i = 0; i < this.level.spikes.length; i++){
            const spikes = this.level.spikes[i];
            const onde = createUINode();
            onde.setParent(this.stage);
            const spikesManager = onde.addComponent(SpikesManager);
            promise.push(spikesManager.init(spikes));
            DataManager.Instance.spikes.push(spikesManager);
        }
        await Promise.all(promise);
    }

    async generatePlayer() {
        const player = createUINode();
        player.setParent(this.stage);
        const playerManager = player.addComponent(PlayerManager);
        await playerManager.init(this.level.player);
        DataManager.Instance.player = playerManager;
        EventManager.Instance.emit(EVENT_ENUM.PLAYER_BORN, true);
    }

    async generateEnemy() {
        const promise = [];
        for(let i = 0; i < this.level.enemies.length; i++){
            const enemy = this.level.enemies[i];
            const onde = createUINode();
            onde.setParent(this.stage);
            const Manager = enemy.type === ENTITY_TYPE_ENUM.SKELETON_WOODEN ? WoodenSkeletonManager  : IronSkeletonManager;
            const manager = onde.addComponent(Manager);
            promise.push(manager.init(enemy));
            DataManager.Instance.enemies.push(manager);
        }
        await Promise.all(promise);
    }

    async generateSmoke(x:number, y:number, direction: DIRECTION_ENUM) {
        const item = DataManager.Instance.smokes.find(item => item.state === ENTITY_STATE_ENUM.DEATH);
        if(item){
            //如果存在死亡的烟雾，则复用免得频繁创建销毁
            item.x = x;
            item.y = y;
            item.direction = direction;
            item.state = ENTITY_STATE_ENUM.IDLE;
            item.node.setPosition(x*TILE_WIDTH - TILE_WIDTH*1.5, -y*TILE_HEIGHT + TILE_HEIGHT*1.5);
        }else{
            const smoke = createUINode();
            smoke.setParent(this.smokeLayer);//将烟雾置于烟雾图层中免得覆盖玩家
            const smokeManager = smoke.addComponent(SmokeManager);
            await smokeManager.init({
                x,
                y,
                direction,
                state: ENTITY_STATE_ENUM.IDLE,
                type: ENTITY_TYPE_ENUM.SMOKE
            });
            DataManager.Instance.smokes.push(smokeManager);
        }
    }

    //烟雾图层，先于玩家生成，将后续生成的烟雾置于该图层中(即设置其为烟雾的父节点)使得不会覆盖玩家
    async generateSmokeLayer(){
        this.smokeLayer = createUINode();
        this.smokeLayer.setParent(this.stage);
    }

    checkArrived(){
        const {x:playerX, y:playerY} = DataManager.Instance.player;
        const {x:doorX, y:doorY, state:doorState} = DataManager.Instance.door;
        if(playerX === doorX && playerY === doorY && doorState === ENTITY_STATE_ENUM.DEATH){
            EventManager.Instance.emit(EVENT_ENUM.NEXT_LEVEL);
        }
    }

    adaptPos() {
        // 适配地图位置
        const { mapRowCount, mapColumnCount } = DataManager.Instance;
        const disX = (TILE_WIDTH * mapColumnCount) / 2;
        const disY = (TILE_WIDTH * mapRowCount) / 2 + 200;

        this.stage.setPosition(-disX, disY);
    }
}

