import { TILE_TYPE_ENUM } from "../Enums"
import level1 from "./level1"


const Levels: Record<string, ILevel> = {
  level1
}

export default Levels


export interface ITile {
  src: number | null,
  type: TILE_TYPE_ENUM | null
}

export interface ILevel {
  mapInfo: Array<Array<ITile>>
}
