
import { StateMachine } from "../../../Base/StateMachine";
import { PARAMS_NAME_ENUM, SPIKES_COUNT_ENUM, SPIKES_COUNT_MAP_NUMBER_ENUM } from "../../../Enums";
import State from "../../../Base/State";
import { SubStateMachine } from "../../../Base/SubStateMachine";


const BASE_URL = 'texture/spikes/spikesthree';

export default class SpikesThreeSubStateMachine extends SubStateMachine {
  constructor(fsm: StateMachine) {
    super(fsm);
    this.stateMachines.set(SPIKES_COUNT_ENUM.ZERO,new State(fsm, `${BASE_URL}/zero`)),
    this.stateMachines.set(SPIKES_COUNT_ENUM.ONE,new State(fsm, `${BASE_URL}/one`)),
    this.stateMachines.set(SPIKES_COUNT_ENUM.TWO,new State(fsm, `${BASE_URL}/two`)),
    this.stateMachines.set(SPIKES_COUNT_ENUM.THREE,new State(fsm, `${BASE_URL}/three`)),
    this.stateMachines.set(SPIKES_COUNT_ENUM.FOUR,new State(fsm, `${BASE_URL}/four`))
  }

  run(): void {
    const value = this.fsm.getParams(PARAMS_NAME_ENUM.SPIKES_CUR_COUNT);
    this.currentState = this.stateMachines.get(SPIKES_COUNT_MAP_NUMBER_ENUM[value as number]) as State;
  }
}
