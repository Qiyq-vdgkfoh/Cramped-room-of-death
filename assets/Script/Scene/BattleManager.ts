
import { _decorator, Component, Node } from 'cc';
import { TileMapManager } from '../Tile/TileMapManager';
import { createUINode } from '../../Utils/indext';
import Levels, { ILevel } from '../../Level';
import DataManager from '../../Runtime/DataManager';
import { TILE_WIDTH } from '../Tile/TileManager';
const { ccclass, property } = _decorator;


@ccclass('BattleManager')
export class BattleManager extends Component {

    level:ILevel;
    stage:Node;

    start () {
        this.generateStage();
        this.initLevel();
    }

    initLevel() {
        const level = Levels[`level${1}`];
        if (level) {
            this.level = level;
            DataManager.Instance.mapInfo = this.level.mapInfo;
            DataManager.Instance.mapRowCount = this.level.mapInfo.length || 0;
            DataManager.Instance.mapColumnCount = this.level.mapInfo[0].length || 0;
            this.generateTileMap();
        }
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

    adaptPos() {
        // 适配地图位置
        const { mapRowCount, mapColumnCount } = DataManager.Instance;
        const disX = (TILE_WIDTH * mapColumnCount) / 2;
        const disY = (TILE_WIDTH * mapRowCount) / 2 + 100;

        this.stage.setPosition(-disX, disY);
    }
}

