import { WoodenSkeletonManager } from './../Enemy/WoodenSkeleton/WoodenSkeletonManager';

import { _decorator, Component, director, Node } from 'cc';
import { TileMapManager } from '../Tile/TileMapManager';
import { createUINode } from '../../Utils/indext';
import Levels, { ILevel } from '../../Level';
import DataManager, { IRecord } from '../../Runtime/DataManager';
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager';
import EventManager from '../../Runtime/EventManager';
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM, SCENE_ENUM } from '../../Enums';
import { PlayerManager } from '../Player/PlayerManager';
import { DoorManager } from '../Door/DoorManager';
import { IronSkeletonManager } from '../Enemy/IronSkeleton/IronSkeletonManager';
import { BurstManager } from '../Burst/BurstManager';
import { SpikesManager } from '../Spikes/SpikesManager';
import { SmokeManager } from '../Smoke/SmokeManager';
import FaderManager from '../../Runtime/FaderManager';
import { ShakeManager } from '../UI/ShakeManager';
const { ccclass, property } = _decorator;


@ccclass('BattleManager')
export class BattleManager extends Component {

    level:ILevel;
    stage:Node;
    private smokeLayer:Node;
    private inited:boolean = false;

    onLoad () {
        DataManager.Instance.levelIndex = 1;
        EventManager.Instance.on(EVENT_ENUM.NEXT_LEVEL, this.nextLevel, this);//绑定事件(事件名称、回调函数、上下文)
        EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.checkArrived, this);
        EventManager.Instance.on(EVENT_ENUM.SHOW_SMOKE, this.generateSmoke, this);
        EventManager.Instance.on(EVENT_ENUM.RECORD_STEP, this.record, this);
        EventManager.Instance.on(EVENT_ENUM.REVOKE_STEP, this.revoke, this);
        EventManager.Instance.on(EVENT_ENUM.RESTART_LEVEL, this.initLevel, this);
        EventManager.Instance.on(EVENT_ENUM.OUT_BATTLE, this.outBattle, this);
    }
    onDestroy () {
        EventManager.Instance.off(EVENT_ENUM.NEXT_LEVEL, this.nextLevel);//解绑事件
        EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.checkArrived);
        EventManager.Instance.off(EVENT_ENUM.SHOW_SMOKE, this.generateSmoke);
        EventManager.Instance.off(EVENT_ENUM.RECORD_STEP, this.record);
        EventManager.Instance.off(EVENT_ENUM.REVOKE_STEP, this.revoke);
        EventManager.Instance.off(EVENT_ENUM.RESTART_LEVEL, this.initLevel);
        EventManager.Instance.off(EVENT_ENUM.OUT_BATTLE, this.outBattle);
    }

    start () {
        this.generateStage();
        this.initLevel();
    }

    async initLevel() {
        const level = Levels[`level${DataManager.Instance.levelIndex}`];
        if (level) {
            if(this.inited) {
                await FaderManager.Instance.fadeIn();
            }else {
                await FaderManager.Instance.mask();
            }

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
            this.inited = true;
        }else {
            console.log('关卡不存在');
            this.outBattle();
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
        this.stage.addComponent(ShakeManager);//碰撞震动偏移组件
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
        const disX = (TILE_WIDTH * mapRowCount) / 2;
        const disY = (TILE_HEIGHT * mapColumnCount) / 2 + 80;
        this.stage.getComponent(ShakeManager).onStop();//适配地图时禁止发生震动偏移s
        this.stage.setPosition(-disX, disY);
    }

    //记录
    record(){
        const item: IRecord = {
            player:{
                x: DataManager.Instance.player.x,
                y: DataManager.Instance.player.y,
                direction: DataManager.Instance.player.direction,
                state:
                    DataManager.Instance.player.state === ENTITY_STATE_ENUM.IDLE ||
                    DataManager.Instance.player.state === ENTITY_STATE_ENUM.DEATH ||
                    DataManager.Instance.player.state === ENTITY_STATE_ENUM.AIRDEATH
                    ? DataManager.Instance.player.state : ENTITY_STATE_ENUM.IDLE,
                type: DataManager.Instance.player.type
            },
            enemies: DataManager.Instance.enemies.map(({x, y, direction, state, type}) =>({
                x,
                y,
                direction,
                state,
                type
            })
            ),
            spikes: DataManager.Instance.spikes.map(({x, y, count, type}) =>({
                x,
                y,
                count,
                type
            })
            ),
            door: {
                x: DataManager.Instance.door.x,
                y: DataManager.Instance.door.y,
                state: DataManager.Instance.door.state,
                type: DataManager.Instance.door.type,
                direction: DataManager.Instance.door.direction
            },
            bursts: DataManager.Instance.bursts.map(({x, y, direction, type}) =>({
                x,
                y,
                direction,
                type,
                state: ENTITY_STATE_ENUM.IDLE
            })
            ),
        }
        DataManager.Instance.records.push(item);
    }

    //回退
    revoke(){
        const item = DataManager.Instance.records.pop();
        if(item){
            DataManager.Instance.player.x = DataManager.Instance.player.targetX = item.player.x;
            DataManager.Instance.player.y = DataManager.Instance.player.targetY = item.player.y;
            DataManager.Instance.player.direction = item.player.direction;
            DataManager.Instance.player.state = item.player.state;

            DataManager.Instance.door.x = item.door.x;
            DataManager.Instance.door.y = item.door.y;
            DataManager.Instance.door.state = item.door.state;
            DataManager.Instance.door.direction = item.door.direction;

            DataManager.Instance.enemies.forEach((enemy, index) => {
                enemy.x = item.enemies[index].x;
                enemy.y = item.enemies[index].y;
                enemy.direction = item.enemies[index].direction;
                enemy.state = item.enemies[index].state;
            })

            DataManager.Instance.spikes.forEach((spike, index) => {
                spike.x = item.spikes[index].x;
                spike.y = item.spikes[index].y;
                spike.count = item.spikes[index].count;
                spike.type = item.spikes[index].type;
            })

            DataManager.Instance.bursts.forEach((burst, index) => {
                burst.x = item.bursts[index].x;
                burst.y = item.bursts[index].y;
                burst.state = item.bursts[index].state;
            })
        }
    }

    async outBattle(){
        await FaderManager.Instance.fadeIn();
        director.loadScene(SCENE_ENUM.Start);
    }
}

