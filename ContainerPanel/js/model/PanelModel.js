"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
class PanelModel {
    constructor(eventsObj) {
        this.storage = [];
        this.eventsObj = eventsObj;
        this.fillStorage();
        this.subscribeListeners();
    }
    fillStorage() {
        const folderPath = path.join(__dirname, "js/res");
        fs.readdirSync(folderPath).forEach(fileName => {
            this.storage.push(require(folderPath + "/" + fileName));
        });
    }
    subscribeListeners() {
        this.eventsObj.on("ControllerInitialized", this.storageReady);
    }
    storageReady() {
        this.eventsObj.emit("StorageFull", this.storage);
    }
}
exports.PanelModel = PanelModel;
//# sourceMappingURL=PanelModel.js.map