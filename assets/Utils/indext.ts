import {Layers, Node, SpriteFrame, UITransform, } from 'cc';

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

//正则表达式，用于匹配括号内的数字，str.match(reg):对相关字符串进行该正则表达式算法，返回一个数组，数组第一个元素是匹配到的整个字符串，第二个元素是括号内的数字
const reg = /\((\d+)\)/
const getNumberWithinString = (str:string) => parseInt(str.match(reg)?.[1] || '0');
export const sortSpriteFrame = (spriteFrames: SpriteFrame[]) =>
  spriteFrames.sort((a, b) => getNumberWithinString(a.name) - getNumberWithinString(b.name));


//返回相应长度的随机字符串
export const randomByLen = (len:number) =>
  Array.from({length:len}).reduce<string>((total:string, item) => total + Math.floor(Math.random() * 10), '');
