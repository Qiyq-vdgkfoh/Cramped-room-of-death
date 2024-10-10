/**
 * 1.需要知道自己的animationClip
 * 2.需要有播放动画的能力
 */

import { animation, AnimationClip, Sprite, SpriteFrame } from "cc";
import ResourceManager from "../Runtime/ResourceManager";
import { StateMachine } from "./StateMachine";

const ANIMATION_SPEED = 1/8;

export default class State {

  private animationClip:AnimationClip;

  constructor(
    private fsm:StateMachine,
    private path:string,
    private wrapMode: AnimationClip.WrapMode = AnimationClip.WrapMode.Normal
  ) {
    this.init();
  }

  async init(){
    const promise = ResourceManager.Instance.loadDir(this.path);
    this.fsm.waitingList.push(promise);
    const spriteFrames = await promise;

    this.animationClip = new AnimationClip();

    const track = new animation.ObjectTrack();//创建一个对象轨道
    track.path = new animation.TrackPath().toComponent(Sprite).toProperty('spriteFrame');//指定轨道的路径
    const frames: Array<[number, SpriteFrame]> = spriteFrames.map((item, index) => [ANIMATION_SPEED * index, item]);//创建动画帧数据
    track.channel.curve.assignSorted(frames);//指定轨道的帧数据

    this.animationClip.addTrack(track);//将轨道添加到动画剪辑中
    this.animationClip.name = this.path;//设置动画剪辑的名称
    this.animationClip.duration = frames.length * ANIMATION_SPEED;//整个动画剪辑的周期
    this.animationClip.wrapMode = this.wrapMode;//设置动画播放的循环模式

  }

  run() {
    this.fsm.animationComponent.defaultClip = this.animationClip;//设置默认动画剪辑
    this.fsm.animationComponent.play();
  }
}
