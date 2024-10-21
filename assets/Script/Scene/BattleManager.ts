import { WoodenSkeletonManager } from './../Enemy/WoodenSkeleton/WoodenSkeletonManager';

import { _decorator, Component, Node } from 'cc';
import { TileMapManager } from '../Tile/TileMapManager';
import { createUINode } from '../../Utils/indext';
import Levels, { ILevel } from '../../Level';
import DataManager from '../../Runtime/DataManager';
import { TILE_WIDTH } from '../Tile/TileManager';
import EventManager from '../../Runtime/EventManager';
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from '../../Enums';
import { PlayerManager } from '../Player/PlayerManager';
import { DoorManager } from '../Door/DoorManager';
import { IronSkeletonManager } from '../Enemy/IronSkeleton/IronSkeletonManager';
import { BurstManager } from '../Burst/BurstManager';
import { SpikesManager } from '../Spikes/SpikesManager';
const { ccclass, property } = _decorator;


@ccclass('BattleManager')
export class BattleManager extends Component {

    level:ILevel;
    stage:Node;

    onLoad () {
        EventManager.Instance.on(EVENT_ENUM.NEXT_LEVEL, this.nextLevel, this);//绑定事件(事件名称、回调函数、上下文)
    }
    onDestroy () {
        EventManager.Instance.off(EVENT_ENUM.NEXT_LEVEL, this.nextLevel);//解绑事件
    }

    start () {
        this.generateStage();
        this.initLevel();
    }

    initLevel() {
        const level = Levels[`level${DataManager.Instance.levelIndex}`];
        if (level) {
            this.clearLevel();
            this.level = level;
            //将关卡地图信息存储到数据中心
            DataManager.Instance.mapInfo = this.level.mapInfo;
            DataManager.Instance.mapRowCount = this.level.mapInfo.length || 0;
            DataManager.Instance.mapColumnCount = this.level.mapInfo[0].length || 0;

            this.generateTileMap();
            this.generateDoor();
            this.generateBurst();
            this.generateSpikes();
            this.generatePlayer();
            this.generateEnemy();
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
        await doorManager.init({
            x: 7,
            y: 8,
            type: ENTITY_TYPE_ENUM.DOOR,
            direction: DIRECTION_ENUM.TOP,
            state: ENTITY_STATE_ENUM.IDLE,
        });
        DataManager.Instance.door = doorManager;
    }

    async generateBurst() {
        const burst = createUINode();
        burst.setParent(this.stage);
        const burstManager = burst.addComponent(BurstManager);
        await burstManager.init({
            x: 2,
            y: 6,
            type: ENTITY_TYPE_ENUM.BURST,
            direction: DIRECTION_ENUM.TOP,
            state: ENTITY_STATE_ENUM.IDLE,
        })
        DataManager.Instance.bursts.push(burstManager);
    }

    async generateSpikes() {
        const spikes = createUINode();
        spikes.setParent(this.stage);
        const spikesManager = spikes.addComponent(SpikesManager);
        await spikesManager.init({
            x: 2,
            y: 5,
            type: ENTITY_TYPE_ENUM.SPIKES_FOUR,
            count: 0
        });
        DataManager.Instance.spikes.push(spikesManager);
    }

    async generatePlayer() {
        const player = createUINode();
        player.setParent(this.stage);
        const playerManager = player.addComponent(PlayerManager);
        await playerManager.init({
                x: 2,
                y: 8,
                type: ENTITY_TYPE_ENUM.PLAYER,
                direction: DIRECTION_ENUM.TOP,
                state: ENTITY_STATE_ENUM.IDLE,
            });
        DataManager.Instance.player = playerManager;
        EventManager.Instance.emit(EVENT_ENUM.PLAYER_BORN, true);
    }

    async generateEnemy() {
        const enmey = createUINode();
        enmey.setParent(this.stage);
        const woodenSkeletonManager = enmey.addComponent(WoodenSkeletonManager);
        await woodenSkeletonManager.init({
            x: 7,
            y: 6,
            type: ENTITY_TYPE_ENUM.SKELETON_WOODEN,
            direction: DIRECTION_ENUM.TOP,
            state: ENTITY_STATE_ENUM.IDLE,
        });
        DataManager.Instance.enemies.push(woodenSkeletonManager);

        // const enmey2 = createUINode();
        // enmey.setParent(this.stage);
        // const ironSkeletonManager = enmey.addComponent(IronSkeletonManager);
        // await ironSkeletonManager.init({
        //     x: 2,
        //     y: 2,
        //     type: ENTITY_TYPE_ENUM.SKELETON_IRON,
        //     direction: DIRECTION_ENUM.TOP,
        //     state: ENTITY_STATE_ENUM.IDLE,
        // });
        // DataManager.Instance.enemies.push(ironSkeletonManager);
    }

    adaptPos() {
        // 适配地图位置
        const { mapRowCount, mapColumnCount } = DataManager.Instance;
        const disX = (TILE_WIDTH * mapColumnCount) / 2;
        const disY = (TILE_WIDTH * mapRowCount) / 2 + 100;

        this.stage.setPosition(-disX, disY);
    }
}

