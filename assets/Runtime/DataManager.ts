import { EnemyManager } from "../Base/EnemyManager";
import Singleton from "../Base/Singleton";
import { ILevel, ITile } from "../Level";
import { BurstManager } from "../Script/Burst/BurstManager";
import { DoorManager } from "../Script/Door/DoorManager";
import { PlayerManager } from "../Script/Player/PlayerManager";
import { SmokeManager } from "../Script/Smoke/SmokeManager";
import { SpikesManager } from "../Script/Spikes/SpikesManager";
import { TileManager } from "../Script/Tile/TileManager";

export type IRecord = Omit<ILevel, 'mapInfo'>;//记录数据(由ILevel忽略MapInfo字段生成)

//地图数据中心单例
export default class DataManager extends Singleton {

  //地图各瓦片信息及横竖坐标
  mapInfo:Array<Array<ITile>>;
  mapRowCount:number = 0;
  mapColumnCount:number = 0;
  tileInfo:Array<Array<TileManager>>;
  levelIndex:number = 1;
  door: DoorManager;
  bursts: BurstManager[];
  spikes: SpikesManager[];
  player:PlayerManager;
  enemies: EnemyManager[];
  smokes: SmokeManager[];
  records: IRecord[];

  static get Instance() {
    return super.GetInstance<DataManager>();
  }

  reset() {
    this.mapInfo = [];
    this.mapRowCount = 0;
    this.mapColumnCount = 0;
    this.tileInfo = [];
    this.door = null;
    this.bursts = [];
    this.spikes = [];
    this.player = null;
    this.enemies = [];
    this.smokes = [];
    this.records = [];
  }
}
