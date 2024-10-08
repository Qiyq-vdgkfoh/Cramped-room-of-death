import Singleton from "../Base/Singleton";
import { ITile } from "../Level";

//地图数据中心单例
export default class DataManager extends Singleton {

  //地图各瓦片信息及横竖坐标
  mapInfo:Array<Array<ITile>>;
  mapRowCount:number = 0;
  mapColumnCount:number = 0;
  levelIndex:number = 1

  static get Instance() {
    return super.GetInstance<DataManager>();
  }

  reset() {
    this.mapInfo = [];
    this.mapRowCount = 0;
    this.mapColumnCount = 0;
  }
}
