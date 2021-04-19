import {FlowInstance} from "./flow-instance.type";

/**
 * It's a function that receives flowName, flowInstance and the king of event. Do something and return true if it break the chain and next operation
 */
export type FlowInterceptor = (flowName: string, flowInstance: FlowInstance, event: "ENABLE"|"DISABLE"|"BACK") => boolean;