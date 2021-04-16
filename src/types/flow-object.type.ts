import { FlowStatus } from "./flow-status.const";

export type FlowObject<OutputType>={
    output:OutputType;
    status: FlowStatus;
}
