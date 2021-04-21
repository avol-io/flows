import { Flows } from ".."
import FlowCommunicator from "../flow.communicator";
import { FlowCallBackFunction } from "../types/flow-callback-function.type";
import { FlowInterceptor } from "../types/flow-interceptor.type";
import { FlowObject } from "../types/flow-object.type";
import { FlowStatus } from "../types/flow-status.const";

beforeEach(() => {
    console.log= (...args)=>{};
    console.error= (...args)=>{};
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
    test("enable flow with extra data",()=>{
        Flows.enableFlow("first-flow", 'http://github.com',{duck:true});
        expect(Flows['activeFlows']['first-flow'][0]['callBackUrl']).toEqual("http://github.com");
        expect(Flows.getFlowObject("first-flow")).toEqual({ "output": undefined, "status": FlowStatus.PROGRESS, "duck":true });
    })
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

            expect(data).toEqual({ output: { "name": "ale" }, "status": FlowStatus.DONE });
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
        const consoleSpy = jest.spyOn(console, 'error');
        expect(Flows.getFlowObject("first-flow")).toEqual(undefined);
        expect(consoleSpy).toHaveBeenCalledWith("Flow >> Not exist a flow with name: first-flow");
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
        const consoleSpy = jest.spyOn(console, 'error');
        expect(Flows.getFlowObject("a-flow")).toEqual(undefined);
        expect(consoleSpy).toHaveBeenCalledWith("Flow >> Not exist a flow with name: a-flow");
        
    });
});

describe("isFlowActive", () => {

    test("isFlowActive single", () => {
        Flows.enableFlow("a-flow");
        expect(Flows.isFlowActive("a-flow")).toEqual(true);
        
        expect(Flows.isFlowActive("no-flow")).toEqual(false);
        expect(Flows.isFlowActive("no-flow","no-flow2")).toEqual(false);
        
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
        let interceptor:FlowInterceptor=(name,instance,event):boolean=>{
            switch(event){
            case "ENABLE":
                console.log("enable "+ name);
            break;
            case "DISABLE":
                console.log("disable "+ name);
            break;
            case "BACK":
                console.log("back " + name);
            break;
        }
            return false;
        };
        const consoleSpy = jest.spyOn(console, 'log');
        Flows.addInterceptor(interceptor);
        Flows.enableFlow("first-flow");
        expect(consoleSpy).toHaveBeenLastCalledWith("enable first-flow");
        Flows.goBack("first-flow",{});
        expect(consoleSpy).toHaveBeenLastCalledWith("back first-flow");
        Flows.getFlowObject("first-flow",true);
        expect(consoleSpy).toHaveBeenLastCalledWith("disable first-flow");


    }
    );
    test("multi", () => {
        let interceptor1:FlowInterceptor=(name,instance,event):boolean=>{
            switch(event){
            case "ENABLE":
                console.log("enable "+ name);
            break;
            case "DISABLE":
                console.log("disable "+ name);
            break;
            case "BACK":
                console.log("back " + name);
            break;
        }
            return false;
        };
        let interceptor2:FlowInterceptor=(name,instance,event):boolean=>{
            switch(event){
            case "ENABLE":
                console.log("enable2 "+ name);
            break;
            case "DISABLE":
                console.log("disable2 "+ name);
            break;
            case "BACK":
                console.log("back2 " + name);
            break;
        }
            return false;
        };
        const consoleSpy = jest.spyOn(console, 'log');
        Flows.addInterceptor(interceptor1);
        Flows.addInterceptor(interceptor2);
        Flows.enableFlow("first-flow");
        expect(consoleSpy).toHaveBeenNthCalledWith(1,"enable first-flow");
        expect(consoleSpy).toHaveBeenNthCalledWith(2,"enable2 first-flow");
        Flows.goBack("first-flow",{});
        expect(consoleSpy).toHaveBeenNthCalledWith(3,"back first-flow");
        expect(consoleSpy).toHaveBeenNthCalledWith(4,"back2 first-flow");
        Flows.getFlowObject("first-flow",true);
        expect(consoleSpy).toHaveBeenNthCalledWith(5,"disable first-flow");
        expect(consoleSpy).toHaveBeenNthCalledWith(6,"disable2 first-flow");
    });
    test("multi with skip", () => {
        let interceptor1:FlowInterceptor=(name,instance,event):boolean=>{
            switch(event){
            case "ENABLE":
                console.log("enable "+ name);
                //NOT DO IT AT HOME
                Flows['activeFlows'][name].push(instance);
                Flows['lastActiveFlowName'].push(name);
            break;
            case "DISABLE":
                console.log("disable "+ name);
            break;
            case "BACK":
                console.log("back " + name);
            break;
        }
            return true;
        };
        let interceptor2:FlowInterceptor=(name,instance,event):boolean=>{
            switch(event){
            case "ENABLE":
                console.log("enable2 "+ name);
            break;
            case "DISABLE":
                console.log("disable2 "+ name);
            break;
            case "BACK":
                console.log("back2 " + name);
            break;
        }
            return false;
        };
        const consoleSpy = jest.spyOn(console, 'log');
        Flows.addInterceptor(interceptor1);
        Flows.addInterceptor(interceptor2);
        Flows.enableFlow("first-flow");
        expect(consoleSpy).toHaveBeenNthCalledWith(1,"enable first-flow");
        Flows.goBack("first-flow",{});
        expect(consoleSpy).toHaveBeenNthCalledWith(2,"back first-flow");
        Flows.getFlowObject("first-flow",true);
        expect(consoleSpy).toHaveBeenNthCalledWith(3,"disable first-flow");
    });
    test("route", () => {
        let interceptor1:FlowInterceptor=(name,instance,event):boolean=>{
            switch(event){
            case "BACK":
                window.location.href="http://www.avol.io/#moon"
                return true;
            break;
        }
           
        };
        Flows.addInterceptor(interceptor1);
        Flows.enableFlow("first-flow","http://www.avol.io/#earth");
        Flows.goBack("first-flow",{});
        expect(window.location.href).toEqual("http://www.avol.io/#moon");
    });
    test("remove interceptor", () => {
        let interceptor1:FlowInterceptor=(name,instance,event):boolean=>{
            switch(event){
            case "BACK":
                window.location.href="http://www.avol.io/#moon"
                return true;
            break;
        }
           
        };
        Flows.addInterceptor(interceptor1);
        Flows.removeInterceptor(interceptor1);
        expect(Flows['interceptors'].length).toEqual(0);
        
    });
});


describe("etc", () => {
    test("debug", () => {
        Flows.debug(true);
        Flows.enableFlow("test-debug")
    });
    test("error not back by brute force", () => { 
        Flows.enableFlow("test-debug");
        Flows['activeFlows']['test-debug'][0]['callBackUrl']=undefined;
        const consoleSpy = jest.spyOn(console, 'error');
        Flows.goBack('test-debug',{});
        

          expect(consoleSpy).toBeCalledTimes(1);
    });
});


