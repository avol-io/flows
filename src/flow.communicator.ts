import FlowObject from "./types/flow-object.type";
import {FlowStatus} from './types/flow-status.const'
export type FlowCallBack = (cache: FlowObject<any>) => undefined;
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
   * Cache of flows. Key it's flowName and value it's its flowObject
   */
  private cache: {
    [key: string]: Array<FlowObject<any>> | FlowObject<any>;
  } = {};

  /**
   * Meta information about all active flow. Keys are flowName and value it's its callback url
   */
  private activeFlows: { [key: string]: string | FlowCallBack | Array<string| FlowCallBack>  } = {};

  private isDebug = false;

  constructor() {
    // console.log("FlowCommunicator new instance active");
  }

  /**
   * Reset all flows
   */
  reset(){
    this.cache={};
    this.activeFlows={};
  }
  /**
   * Enable or disable debug
   */
  debug(enable) {
    this.isDebug = enable;
  }

  /**
   * It's return the most recent FlowObject of flow
   * @param flowName identify flow
   * @returns the most recent FlowObject of flow
   */
  private getActualCache(flowName: string): FlowObject<any> {
    let cache;
    if (Array.isArray(this.cache[flowName])) {
      cache = this.cache[flowName][this.cache[flowName]["length"] - 1];
    } else {
      cache = this.cache[flowName] as FlowObject<any>;
    }
    this.log(`Flow >> getActualCache('${flowName}') => `, cache);
    return cache;
  }

  /**
   * It's return the most recent FlowObject of flow
   * @param flowName identify flow
   * @returns the most recent FlowObject of flow
   */
   private getActualActiveFlows(flowName: string): FlowCallBack | string {
    let flow;
    if (Array.isArray(this.activeFlows[flowName])) {
      flow = this.activeFlows[flowName][this.activeFlows[flowName]["length"] - 1];
    } else {
      flow = this.activeFlows[flowName] as FlowCallBack;
    }
    this.log(`Flow >> getActualActiveFlows('${flowName}') => `, flow);
    return flow;
  }

  /**
   * This method return to the origin page of specific flow and put input obj as output of flow object
   * @param flowName identify flow
   * @param obj  object to return as output of flow (put undefined if there isn't output)
   */
  goBack<OutputType>(flowName: string, obj: OutputType) {
    //load the cache
    let cache = this.getActualCache(flowName);
    if (cache) {
      //if exist
      cache["output"] = obj; //set output
      cache["status"] = FlowStatus.DONE; //set status to done
    }
    let activeFlow=this.getActualActiveFlows(flowName);
    if (activeFlow) {
      //if it's a url go back
      if (typeof activeFlow === "string") {
        this.log(
          'Flow >> Go back for flow "' +
            flowName +
            '" to url: ' +
            activeFlow +
            " with flow object:",
          cache
        );

        window.history.pushState("", "", activeFlow as string);
        history.back();
        history.forward();
      } else {
        this.log(
          'Flow >> Callback for flow "' + flowName + +" with flow object:",
          cache
        );

        //otherwise call it
        (activeFlow as FlowCallBack)(cache);
      }
    } else {
      console.error(
        "\t\t Flow >> There is not url to go back for " + flowName,
        ". The active flow are:",
        this.activeFlows
      );
    }
  }

  /**
   *  Add extra datato to a flow
   * @param flowName identify flow
   * @param dataKey  key to identify extra data
   * @param obj extra data object
   */
  addExtraDataToFlow<Type>(flowName: string, dataKey: string, obj: Type) {
    // if (this.cache[flowName]) {
    //   this.cache[flowName][dataKey] = obj;
    // } else {
    //   this.cache[flowName] = {};
    //   this.cache[flowName][dataKey] = obj;
    // }

    //load the cache
    let cache = this.getActualCache(flowName);
    if(!cache){
      console.warn(  "Flow >> Not exist a flow with name: " +
      flowName);
      return;
    }
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
   * @param disableFlow will disable the flow after you take flow object (userful when you take object in origin page after back)
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
   */
  enableFlow(flowName: string, urlCallBack?) {
    if(Array.isArray(this.activeFlows[flowName])){
      (this.activeFlows[flowName]as Array<string|FlowCallBack> ).push(urlCallBack)
    }else{
      if( this.activeFlows[flowName]){
        this.activeFlows[flowName]=[this.activeFlows[flowName], urlCallBack || window.location.href];
      }else{
        this.activeFlows[flowName] = urlCallBack || window.location.href; //window.location.href.split("#")[1];
      }
    }
   

    //manage cache
    this.createCache(flowName);
    this.log(`Flow >> enableFlow('${flowName}', '${urlCallBack}') `);
  }
  private createCache(flowName: string) {
    let newCache = { output: undefined, status: FlowStatus.PROGRESS };
    if (!this.getActualCache(flowName)) {
      //if not exist a create new one
      this.cache[flowName] = newCache;
    } else {
      //if exist i have to push new one in the array or create a stack if isn't.
      if (!Array.isArray(this.cache[flowName])) {
        this.cache[flowName] = [this.cache[flowName] as FlowObject<any>];
      }
      (this.cache[flowName] as Array<FlowObject<any>>).push(newCache);
    }
  }

  /**
   * Disable a flow
   */
  disableFlow(flowName: string) {
    if(Array.isArray(this.cache[flowName]) && (this.cache[flowName] as Array<FlowObject<any>>).length>1){
      (this.activeFlows[flowName] as Array<string|FlowCallBack>).pop();
      (this.cache[flowName] as Array<FlowObject<any>>).pop();
      this.log(`Flow > disableFlow('${flowName}') => pop flow. There are still ${this.activeFlows[flowName].length} into stack`);
    }else{
      delete this.activeFlows[flowName];
       delete this.cache[flowName];
       this.log(`Flow > disableFlow('${flowName}') => delete flow`);
    }
    
  }

  /**
   * Told you if there is an active flow with flowName
   * @param flowName  identify the flow
   * @returns true if flow it's active
   */
  isFlowActive(flowName: string) {
    return !!this.activeFlows && this.activeFlows[flowName];
  }

  private log(...args) {
    if (this.isDebug) {
      console.log(...args);
    }
  }
}
