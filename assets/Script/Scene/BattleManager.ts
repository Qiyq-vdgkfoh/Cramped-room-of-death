
import { _decorator, Component, Node } from 'cc';
import { TileMapManager } from '../Tile/TileMapManager';
import { createUINode } from '../../Utils/indext';
import Levels, { ILevel } from '../../Level';
import DataManager from '../../Runtime/DataManager';
import { TILE_WIDTH } from '../Tile/TileManager';
import EventManager from '../../Runtime/EventManager';
import { EVENT_ENUM } from '../../Enums';
import { PlayerManager } from '../Player/PlayerManager';
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
            DataManager.Instance.mapInfo = this.level.mapInfo;
            DataManager.Instance.mapRowCount = this.level.mapInfo.length || 0;
            DataManager.Instance.mapColumnCount = this.level.mapInfo[0].length || 0;
            this.generateTileMap();
            this.generatePlayer();
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

    generateTileMap() {
        const tileMap = createUINode();
        tileMap.setParent(this.stage);
        const tileMapManager = tileMap.addComponent(TileMapManager);
        tileMapManager.init();

        this.adaptPos();
    }

    generatePlayer() {
        const player = createUINode();
        player.setParent(this.stage);
        const playerManager = player.addComponent(PlayerManager);
        playerManager.init();
    }

    adaptPos() {
        // 适配地图位置
        const { mapRowCount, mapColumnCount } = DataManager.Instance;
        const disX = (TILE_WIDTH * mapColumnCount) / 2;
        const disY = (TILE_WIDTH * mapRowCount) / 2 + 100;

        this.stage.setPosition(-disX, disY);
    }
}

