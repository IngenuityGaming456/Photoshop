"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
class PanelModel {
    constructor(eventsObj) {
        this.writeQueue = [];
        this.eventsObj = eventsObj;
    }
    onActiveDoc(docId) {
        this.docId = docId;
        const filteredPath = window.require('os').homedir();
        this.filteredPath = filteredPath + "/" + docId;
        if (!fs.existsSync(this.filteredPath)) {
            fs.mkdirSync(this.filteredPath);
        }
    }
    onWriteData(data) {
        if (this.writeObj) {
            this.writeQueue = this.writeObj.writeData;
        }
        this.writeQueue.push(data);
        fs.writeFile(window.require('os').homedir() + "/" + this.docId + "/" + "Cache.json", JSON.stringify({
            "writeData": this.writeQueue
        }), err => {
            if (err) {
                console.log(err);
            }
        });
    }
    getStorage(docId) {
        if (docId) {
            this.docId = docId;
            try {
                const writeData = fs.readFileSync(window.require('os').homedir() + "/" + docId + "/" + "Cache.json", { encoding: "utf8" });
                this.eventsObj.emit("parsedData", JSON.parse(writeData));
                this.writeObj = JSON.parse(writeData);
            }
            catch (err) {
                console.log(err);
            }
        }
    }
}
exports.PanelModel = PanelModel;
//# sourceMappingURL=PanelModel.js.map