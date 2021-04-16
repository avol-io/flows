import FlowCommunicator from "./flow.communicator"



export const Flows:FlowCommunicator = window['Flow']?window['Flow']:window['Flow']=new FlowCommunicator();

export  * from "./types/flow-object.type";
export  * from "./types/flow-interceptor.type";
export  * from "./types/flow-status.const";
export  * from "./types/flow-instance.type";




