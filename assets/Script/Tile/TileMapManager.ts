
import { _decorator, Component,  SpriteFrame } from 'cc';
import { createUINode, randomByRange } from '../../Utils/indext';
import { TileManager } from './TileManager';
import DataManager from '../../Runtime/DataManager';
import ResourceManager from '../../Runtime/ResourceManager';


const { ccclass, property } = _decorator;

@ccclass('TileMapManager')
export class TileMapManager extends Component {

  async init(){
    const {mapInfo} = DataManager.Instance
    const spriteFrames = await ResourceManager.Instance.loadDir('texture/tile/tile');
    for(let i = 0; i < mapInfo.length; i++){
      const column = mapInfo[i];
      for(let j = 0; j < column.length; j++){
        const item = column[j];
        if(item.src === null || item.type === null)
          continue;

        const node = createUINode();
        node.setParent(this.node);

        let number = item.src;
        if((number === 1 || number === 5 || number === 9) && i % 2 === 0 && j % 2 === 0){
          //对x、y为偶数的地板瓦片进行随机
          number += randomByRange(0,4);
        }
        const imgSrc = `tile (${number})`;
        const spriteFrame = spriteFrames.find((v: SpriteFrame) => v.name === imgSrc) || spriteFrames[0];

        const tileManager = node.addComponent(TileManager);
        tileManager.init(spriteFrame, i, j);
      }
    }
  }
}

