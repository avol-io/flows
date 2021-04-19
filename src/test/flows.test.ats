import { Flows } from ".."
import { FlowCallBackFunction } from "../types/flow-callback-function.type";
import { FlowObject } from "../types/flow-object.type";
import { FlowStatus } from "../types/flow-status.const";

beforeEach(() => {
    Flows.reset();
});
describe("Enable flow", () => {
    test("flow not enable is undefined", () => {
        const consoleSpy = jest.spyOn(console, 'error');
        expect(Flows.getFlowObject("first-flow")).toEqual(undefined);
        expect(consoleSpy).toHaveBeenCalledWith("Flow >> Not exist a flow with name: first-flow");
    });
    test("enable flow without parameter", () => {
        Flows.enableFlow("first-flow");
        expect(Flows['activeFlows']['first-flow'][0]['callBackUrl']).toEqual("http://www.avol.io/");
        expect(Flows.getFlowObject("first-flow")).toEqual({ "output": undefined, "status": FlowStatus.PROGRESS });
    });
    test("enable flow with url parameter", () => {
        Flows.enableFlow("first-flow", 'http://github.com');
        expect(Flows['activeFlows']['first-flow'][0]['callBackUrl']).toEqual("http://github.com");
        expect(Flows.getFlowObject("first-flow")).toEqual({ "output": undefined, "status": FlowStatus.PROGRESS });
    });
    test("enable flow with callback parameter", () => {
        const callBack: FlowCallBackFunction = (cache: FlowObject<any>) => {

        };
        Flows.enableFlow("first-flow", callBack);
        expect(Flows['activeFlows']['first-flow'][0].callBackFn).toEqual(callBack);
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
        const consoleSpy = jest.spyOn(console, 'error');

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
        const callback: FlowCallBackFunction = (data) => {
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
        expect(Flows.getFlowObject("first-flow")).toEqual({ output: { "name": "ale" }, "status": FlowStatus.DONE });
        expect(Flows.getFlowObject("first-flow", true)).toEqual({ output: { "name": "ale" }, "status": FlowStatus.DONE });
        expect(Flows.getFlowObject("first-flow")).toEqual(undefined);
    });

});
describe("Stack", () => {

    test("enable stack flow", () => {
        Flows.enableFlow("a-flow", "http://www.avol.io/#first");
        Flows.addExtraDataToFlow("a-flow", "property", 1);
        Flows.enableFlow("a-flow", "http://www.avol.io/#second");
        Flows.addExtraDataToFlow("a-flow", "property", 2);
        expect(Flows.getFlowObject("a-flow")).toEqual({ output: undefined, "property": 2, "status": FlowStatus.PROGRESS });


    });

    test("pop stack", () => {
        Flows.enableFlow("a-flow", "http://www.avol.io/#first");
        Flows.addExtraDataToFlow("a-flow", "property", 1);
        Flows.enableFlow("a-flow", "http://www.avol.io/#second");
        Flows.addExtraDataToFlow("a-flow", "property", 2);
        expect(Flows.getFlowObject("a-flow")).toEqual({ output: undefined, "property": 2, "status": FlowStatus.PROGRESS });
        Flows.goBack("a-flow", { "second": true });
        expect(Flows.getFlowObject("a-flow", true)).toEqual({ output: { "second": true }, "property": 2, "status": FlowStatus.DONE });
        expect(window.location.href).toEqual("http://www.avol.io/#second");
        expect(Flows.getFlowObject("a-flow")).toEqual({ output: undefined, "property": 1, "status": FlowStatus.PROGRESS });
        Flows.goBack("a-flow", { "second": false });
        expect(Flows.getFlowObject("a-flow", true)).toEqual({ output: { "second": false }, "property": 1, "status": FlowStatus.DONE });
        expect(window.location.href).toEqual("http://www.avol.io/#first");
        expect(Flows.getFlowObject("a-flow")).toEqual(undefined);
    });
});

describe("isFlowActive", () => {

    test("isFlowActive single", () => {
        Flows.enableFlow("a-flow");
        expect(Flows.isFlowActive("a-flow")).toEqual(true);
        expect(Flows.isFlowActive("no-flow")).toEqual(false);
    });

    test("multi-input isFlowActive", () => {
        Flows.enableFlow("a-flow");
        Flows.enableFlow("b-flow");
        expect(Flows.isFlowActive("a-flow", "b-flow")).toEqual("b-flow");
        expect(Flows.isFlowActive("no-flow")).toEqual(false);
    });
    test("multi-input isFlowActive with stack", () => {
        Flows.enableFlow("a-flow");
        Flows.enableFlow("b-flow");
        Flows.enableFlow("b-flow");
        expect(Flows.isFlowActive("a-flow", "b-flow")).toEqual("b-flow");
        Flows.getFlowObject("b-flow", true);
        expect(Flows.isFlowActive("a-flow", "b-flow")).toEqual("b-flow");
        Flows.getFlowObject("b-flow", true);
        expect(Flows.isFlowActive("a-flow", "b-flow")).toEqual("a-flow");

    });
});


describe("test interceptor", () => {
    test("single", () => {

    });
    test("multi", () => {

    });
    test("route", () => {

    });
});






