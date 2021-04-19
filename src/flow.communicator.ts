import { FlowObject } from "./types/flow-object.type";
import { FlowStatus } from './types/flow-status.const'
import { FlowInstance } from './types/flow-instance.type'
import { FlowCallBackFunction } from "./types/flow-callback-function.type";
import { FlowInterceptor } from "./types/flow-interceptor.type";
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

export default class FlowCommunicator {

  /**
   * Track tha last active flow name
   */
  private lastActiveFlowName: string[]=[];

  /**
   * Meta informations about all active flow. Keys are flowName and value it's a flow instance array
   */
  private activeFlows: { [key: string]: Array<FlowInstance> } = {};

  /**
   * flag that define if debug it's enable
   */
  private isDebug = false;

  /**
   * list of interceptors
   */
  private interceptors: FlowInterceptor[] = [];

  /**
   * Reset all flows
   */
  reset() {
    this.activeFlows = {};
    this.lastActiveFlowName=[];
    this.interceptors=[];
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
    let flow=this.getActualActiveFlow(flowName);
    if(!flow){return}
    cache = flow.cache;
    // if (!cache) {
    //   throw new Error("Flow >> Not exist a flow with name: " +
    //     flowName);

    // }
    this.log(`Flow >> getActualCache('${flowName}') => `, cache);
    return cache;
  }

  /**
   * It's return the most recent FlowObject of flow
   * @param flowName identify flow
   * @returns the most recent FlowObject of flow
   */
  private getActualActiveFlow(flowName: string, checkForNew=false): FlowInstance {
    let flow;
    if (this.activeFlows[flowName]) {
      flow = this.activeFlows[flowName][this.activeFlows[flowName].length - 1]
    }else if(!checkForNew){
    
        console.error(
          "Flow >> Not exist a flow with name: "+flowName 
        );
        return;
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

    if(this.notify(flowName, activeFlow,"BACK")){ //if return true -> block because it's manage by interceptor
      return;
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
    } else if (activeFlow.callBackFn) {
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
    if(!cache){return}
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
    let flow = this.getActualActiveFlow(flowName,true);
    if (!flow) {
      this.activeFlows[flowName] = [];
    }
    // ERROR!!quest è cache
    let newFlow: FlowInstance;
    let cache: FlowObject<any> = { output: undefined, status: FlowStatus.PROGRESS };
    if(!callBack){
      newFlow = { cache: cache, callBackUrl: window.location.href };
    }else if (typeof callBack === "string") {
      newFlow = { cache: cache, callBackUrl: callBack };
    } else {
      newFlow = { cache: cache, callBackFn: callBack };
    }
    if(this.notify(flowName,newFlow,"ENABLE")){ //if return true -> block because it's manage by interceptor
      return;
    }
    this.activeFlows[flowName].push(newFlow);
    this.lastActiveFlowName.push(flowName);
  
    this.log(`Flow >> enableFlow('${flowName}`, callBack, extraData);
  }
  


  /**
   * Disable a flow
   */
  disableFlow(flowName: string) {
    if(this.notify(flowName,this.getActualActiveFlow(flowName),"DISABLE")){ //if return true -> block because it's manage by interceptor
      return;
    }
    let deleted;
    if (this.activeFlows[flowName]) {
      deleted=this.activeFlows[flowName].pop();
    }
    if (this.activeFlows[flowName].length == 0) {
      delete this.activeFlows[flowName];
      this.log(`Flow > disableFlow('${flowName}') => delete flow`);
    } else {
      this.log(`Flow > disableFlow('${flowName}') => pop flow. There are still ${this.activeFlows[flowName].length} into stack`);
    }
    
    //clean the last occurrence of flowName
    for (let index = this.lastActiveFlowName.length; index > 0; index--) {
      const element = this.lastActiveFlowName[index];
      if(element===flowName){
        this.lastActiveFlowName.splice(index,1);
        break;
      }
    }
   

  }

  /**
   * Told you if there is an active flow with flowName
   * @param flowName  identify the flow
   * @returns true if flow it's active and only 1 flowName in input, otherwise the most recent flow active
   */
  isFlowActive(...flowName: string[]) {
    let lastName=this.getLastActiveFlowName();
    if(flowName.length==1){
      return lastName===flowName[0];
    }
    if (flowName.indexOf(lastName) >= 0) {
      return lastName;
    };
    return false;
  }

  /**
   * it returns last active flow name if exist or undefined
   * @returns last active flow name if exist or undefined
   */
  private getLastActiveFlowName(){
    if(this.lastActiveFlowName.length>0){
      return this.lastActiveFlowName[this.lastActiveFlowName.length-1];
    }
  }
  private log(...args: any[]) {
    if (this.isDebug) {
      console.log(...args);
    }
  }


  addInterceptor(interceptor: FlowInterceptor) {
    this.interceptors.push(interceptor);
  }

  removeInterceptor(interceptor: FlowInterceptor) {
    let index = this.interceptors.indexOf(interceptor);
    if (index >= 0) {
      this.interceptors.splice(index, 1);
    }
  }

  notify(flowName: string, flowInstance: FlowInstance, event: "ENABLE"|"DISABLE"|"BACK") {
    let stop=false;
    for (let i = 0; i < this.interceptors.length &&!stop; i++) {
      stop=!!this.interceptors[i](flowName,flowInstance,event);
    }
    return stop;
  }
  
}
