"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
exports.__esModule = true;
var flow_communicator_1 = require("./flow.communicator");
exports.Flows = window['Flow'] ? window['Flow'] : window['Flow'] = new flow_communicator_1["default"]();
__export(require("./types/flow-status.const"));
