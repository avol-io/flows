
import {FlowObject} from "./flow-object.type"
import {FlowCallBackFunction} from "./flow-callback-function.type"


export  type FlowInstance ={

     callBackFn?:FlowCallBackFunction;
     callBackUrl?:string;
     cache: FlowObject<any>;
}