import { FlowStatus } from "./flow-status.const";

export default interface FlowObject<OutputType>{
    output:OutputType;
    status: FlowStatus;
}
