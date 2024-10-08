import { resources, SpriteFrame } from "cc";
import Singleton from "../Base/Singleton";


//资源加载单例
export default class ResourceManager extends Singleton {

  static get Instance() {
    return super.GetInstance<ResourceManager>();
  }

  loadDir(patch:string, type:typeof SpriteFrame = SpriteFrame){
    return new Promise<SpriteFrame[]>((resolve, reject) => {
      resources.loadDir(patch, type, function(err, assets){
        if (err) {
          reject(err);
          return;
        }
        resolve(assets);
      })
    })
  }
}
