import {Layers, Node, UITransform, } from 'cc';

//通用空节点创建工具
export const createUINode = (name:string ='') => {
  const node = new Node(name);
  const transform = node.addComponent(UITransform);
  transform.setAnchorPoint(0, 1);
  node.layer = 1 << Layers.nameToLayer('UI_2D');
  return node;
}

//瓦片地图随机数生成工具
export const randomByRange = (start:number, end:number) => Math.floor(Math.random() * (end - start) + start);
