import { FlowObject } from "./types/flow-object.type";
import { FlowStatus } from './types/flow-status.const'
import { FlowInstance } from './types/flow-instance.type'
import { FlowCallBackFunction } from "./types/flow-callback-function.type";
import { Flows } from ".";
/**
 * Classetta di comunicazione by flow o by public/subscribe di Alessandro Avolio 
                                  .
     .              .   .'.     \   /
   \   /      .'. .' '.'   '  -=  o  =-
 -=  o  =-  .'   '              / | \
   / | \                          |
     |                            |
     |                            |
     |                      .=====|
     |=====.                |.---.|
     |.---.|                ||=o=||
     ||=o=||                ||   ||
     ||   ||                ||   ||
     ||   ||                ||___||
     ||___||                |[:::]|
jgs  |[:::]|                '-----'
     '-----'
 */

/*
     TODO gestione back e flow con callback
     */

export default class FlowCommunicator {

  /**
   * Track tha last active flow name
   */
  private lastActiveFlowName: string;

  /**
   * Meta informations about all active flow. Keys are flowName and value it's a flow instance array
   */
  private activeFlows: { [key: string]: Array<FlowInstance> } = {};

  /**
   * flag that define if debug it's enable
   */
  private isDebug = false;


  /**
   * Reset all flows
   */
  reset() {
    this.activeFlows = {};
  }

  /**
   * Enable or disable debug
   */
  debug(enable) {
    this.isDebug = enable;
  }

  /**
   * It's return the most recent FlowObject for a specific flow
   * @param flowName identify flow
   * @returns the most recent FlowObject of flow
   */
  private getActualCache(flowName: string): FlowObject<any> {
    let cache;
    cache = this.getActualActiveFlow(flowName).cache;
    if (!cache) {
      throw new Error("Flow >> Not exist a flow with name: " +
        flowName);

    }
    this.log(`Flow >> getActualCache('${flowName}') => `, cache);
    return cache;
  }

  /**
   * It's return the most recent FlowObject of flow
   * @param flowName identify flow
   * @returns the most recent FlowObject of flow
   */
  private getActualActiveFlow(flowName: string): FlowInstance {
    let flow;
    flow = this.activeFlows[flowName][this.activeFlows[flowName]["length"] - 1];
    if (!flow) {
      throw new Error("Flow with name " + flowName + " not exist");
    }
    this.log(`Flow >> getActualActiveFlows('${flowName}') => `, flow);
    return flow;
  }

  /**
   * This method return to the origin page/call the callback function of specific flow and put input obj as output of flow object
   * @param flowName identify flow
   * @param obj  object to return as output of flow (put undefined if there isn't output)
   */
  goBack<OutputType>(flowName: string, obj: OutputType) {
    //load the flow
    let activeFlow = this.getActualActiveFlow(flowName);
    //load the cache
    let cache = activeFlow.cache;
    if (cache) {
      //if exist
      cache.output = obj; //set output
      cache.status = FlowStatus.DONE; //set status to done
    }


    //if it's a url go back
    if (activeFlow.callBackUrl) {
      this.log(
        'Flow >> Go back for flow "' +
        flowName +
        '" to url: ' +
        activeFlow +
        " with flow object:",
        cache
      );

      window.history.pushState("", "", activeFlow.callBackUrl);
      history.back();
      history.forward();
    } else if (activeFlow.callBackUrl) {
      this.log(
        'Flow >> Callback for flow "' + flowName + +" with flow object:",
        cache
      );

      //otherwise call it
      activeFlow.callBackFn(cache);

    } else {
      console.error(
        "\t\t Flow >> There is not url to go back or callback function for " + flowName,
        ". The active flows are:",
        this.activeFlows
      );
    }
  }

  /**
   *  Add extra data to to a flow
   * @param flowName identify flow
   * @param dataKey  key to identify extra data
   * @param obj extra data object
   */
  addExtraDataToFlow<Type>(flowName: string, dataKey: string, obj: Type) {

    //load the cache
    let cache = this.getActualCache(flowName);

    if (cache[dataKey]) {
      console.warn(
        "Flow >> On " +
        flowName +
        " it' just present a extraData " +
        dataKey +
        ". I just overwrite it!"
      );
    }
    cache[dataKey] = obj;
  }

  /**
   * Get access to flow object
   * @param flowName identify flow
   * @param disableFlow will disable the flow after you take flow object (useful when you take object in origin page after back)
   * @returns
   */
  getFlowObject<FlowObject>(flowName: string, disableFlow = false): FlowObject {
    const obj = this.getActualCache(flowName);
    if (disableFlow) {
      this.disableFlow(flowName);
    }
    this.log(`Flow >> getFlowObject('${flowName}','${disableFlow}') =>`, obj);
    return (obj as unknown) as FlowObject;
  }

  /**
   * Enable a new flow
   * @param flowName identify flow
   * @param callBack the url to navigate back or a callback function. If undefined will be automatically set with window.location.href
   * @param extraData if you want add some extra data directly on flow creation
   */
  enableFlow(flowName: string, callBack?: string | FlowCallBackFunction, extraData?: any) {
    let flow = this.getActualActiveFlow(flowName);
    if (!flow) {
      this.activeFlows[flowName] = [];
    }
    // ERROR!!quest è cache
    let newFlow: FlowInstance;
    let cache: FlowObject<any> = { output: undefined, status: FlowStatus.PROGRESS };

    if (typeof callBack === "string") {
      newFlow = { cache: cache, callBackUrl: callBack };
    } else {
      newFlow = { cache: cache, callBackFn: callBack };
    }

    this.activeFlows[flowName].push(newFlow);
    this.lastActiveFlowName = flowName;
    this.log(`Flow >> enableFlow('${flowName}`, callBack, extraData);
  }


  /**
   * Disable a flow
   */
  disableFlow(flowName: string) {

    if (this.activeFlows[flowName]) {
      this.activeFlows[flowName].pop();
    }
    if (this.activeFlows[flowName].length == 0) {
      delete this.activeFlows[flowName];
      this.log(`Flow > disableFlow('${flowName}') => delete flow`);
    } else {

      this.log(`Flow > disableFlow('${flowName}') => pop flow. There are still ${this.activeFlows[flowName].length} into stack`);
    }

  }

  /**
   * Told you if there is an active flow with flowName
   * @param flowName  identify the flow
   * @returns true if flow it's active
   */
  isFlowActive(flowName: string | string[]) {
    if (!Array.isArray(flowName)) {
      flowName = [flowName];
    }
    if (flowName.indexOf(this.lastActiveFlowName) >= 0) {
      return this.lastActiveFlowName;
    };
    return false;
  }

  private log(...args: any[]) {
    if (this.isDebug) {
      console.log(...args);
    }
  }
}
