"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PanelController {
    constructor(eventsObj, viewObj, modelObj) {
        this.eventsObj = eventsObj;
        this.ready();
        this.subscribeListeners();
    }
    ready() {
        this.eventsObj.emit("ControllerInitialized");
    }
    subscribeListeners() {
        this.eventsObj.on("StorageFull", this.sendStorage);
    }
    sendStorage(storage) {
        this.eventsObj.emit("StorageFull", storage);
    }
}
exports.PanelController = PanelController;
//# sourceMappingURL=PanelController.js.map