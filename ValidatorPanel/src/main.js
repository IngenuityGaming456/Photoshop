"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require("events");
const PanelView_1 = require("./modules/PanelView");
const PanelModel_1 = require("./modules/PanelModel");
const PanelController_1 = require("./modules/PanelController");
function main() {
    const eventsObj = new EventEmitter();
    const modelObj = new PanelModel_1.PanelModel(eventsObj);
    const viewObj = new PanelView_1.PanelView(eventsObj);
    new PanelController_1.PanelController(eventsObj, viewObj, modelObj);
}
main();
//# sourceMappingURL=main.js.map