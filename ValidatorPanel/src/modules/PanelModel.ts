import * as EventEmitter from "events";
import * as fs from "fs";

export class PanelModel {
    private eventsObj: EventEmitter;
    private filteredPath;
    private writeQueue = [];
    private docId;
    private writeObj;

    public constructor(eventsObj: EventEmitter) {
        this.eventsObj = eventsObj;
    }

    public onActiveDoc(docId) {
        this.docId = docId;
        const filteredPath = window.require('os').homedir();
        this.filteredPath = filteredPath + "/" + docId;
        if (!fs.existsSync(this.filteredPath)) {
            fs.mkdirSync(this.filteredPath);
        }
    }

    public onWriteData(data) {
        if(this.writeObj) {
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

    public getStorage(docId) {
        if (docId) {
            this.docId = docId;
            try {
                const writeData = fs.readFileSync(window.require('os').homedir() + "/" + docId + "/" + "Cache.json", {encoding: "utf8"});
                this.eventsObj.emit("parsedData", JSON.parse(writeData));
                this.writeObj = JSON.parse(writeData);
            } catch (err) {
                console.log(err);
            }
        }
    }
}