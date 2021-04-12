import { Flows } from "../"
import { FlowStatus } from "../types/flow-status.const";

beforeEach(() => {
    Flows.reset();
});
describe("Enable flow", () => {
    test("flow not enable is undefined", () => {
        Flows.enableFlow("first-flow");
        expect(Flows.getFlowObject("first-flow")).toEqual(undefined);
    });
    test("enable flow without parameter", () => {
        Flows.enableFlow("first-flow");
        expect(Flows['activeFlows']['first-flow']).toEqual("http://www.avol.io/");
        expect(Flows.getFlowObject("first-flow")).toEqual({ "output": undefined, "status": FlowStatus.PROGRESS });
    });
    test("enable flow with url parameter", () => {
        Flows.enableFlow("first-flow", 'http://github.com');
        expect(Flows['activeFlows']['first-flow']).toEqual("http://github.com");
        expect(Flows.getFlowObject("first-flow")).toEqual({ "output": undefined, "status": FlowStatus.PROGRESS });
    });
    test("enable flow with callback parameter", () => {
        const callBack = (call) => {

        };
        Flows.enableFlow("first-flow", callBack);
        expect(Flows['activeFlows']['first-flow']).toEqual(callBack);
        expect(Flows.getFlowObject("first-flow")).toEqual({ "output": undefined, "status": FlowStatus.PROGRESS });
    });
})


describe("Managing data of flow", () => {
    test("add data to flow", () => {
        Flows.enableFlow("first-flow");
        Flows.addExtraDataToFlow("first-flow", "property", 1);
        expect(Flows.getFlowObject("first-flow")).toEqual({ output: undefined, property: 1, "status": FlowStatus.PROGRESS });
    });

    test("manage add data to not existent flow", () => {
        console.warn = (...args) => { };
        const consoleSpy = jest.spyOn(console, 'warn');

        // console.warn("Flow >> Not exist a flow with name: no-flow");
        Flows.addExtraDataToFlow("no-flow", "property", 1);
        expect(consoleSpy).toHaveBeenCalledWith("Flow >> Not exist a flow with name: no-flow");
    });

    test("override data into flow", () => {
        Flows.enableFlow("first-flow");
        Flows.addExtraDataToFlow("first-flow", "property", 1);
        Flows.addExtraDataToFlow("first-flow", "property", 2);
        expect(Flows.getFlowObject("first-flow")).toEqual({ output: undefined, property: 2, "status": FlowStatus.PROGRESS });
    });
});

describe("Goback", () => {

    test("url", () => {
        Flows.enableFlow("first-flow", "http://www.avol.io/#backpath");
        Flows.goBack("first-flow", { "name": "ale" });
        expect(window.location.href).toEqual("http://www.avol.io/#backpath");
    });
    test("callback", () => {
        const callback = (data) => {
            expect(data).toBe({ output: { "name": "ale" }, "status": FlowStatus.DONE });
        }
        Flows.enableFlow("first-flow", callback);
        Flows.goBack("first-flow", { "name": "ale" });

    });


    test("get output object flow", () => {
        Flows.enableFlow("first-flow", "http://www.avol.io/#backpath");
        Flows.goBack("first-flow", { "name": "ale" });
        expect(Flows.getFlowObject("first-flow")).toEqual({ output: { "name": "ale" }, "status": FlowStatus.DONE });
    });


    test("get output object flow and disable param work", () => {
        Flows.enableFlow("first-flow", "http://www.avol.io/#backpath");
        Flows.goBack("first-flow", { "name": "ale" });
        expect(Flows.getFlowObject("first-flow", true)).toEqual({ output: { "name": "ale" }, "status": FlowStatus.DONE });
        expect(Flows.getFlowObject("first-flow")).toEqual(undefined);
    });

});


test("enable stack flow", () => {

});

test("pop stack", () => {

});

test("isEnable single", () => {

});

test("multi-input isEnable", () => {

});







