import FlowCommunicator from "./flow.communicator"



export const Flows:FlowCommunicator = window['Flow']?window['Flow']:window['Flow']=new FlowCommunicator();

export  * from "./types/flow-object.type";




