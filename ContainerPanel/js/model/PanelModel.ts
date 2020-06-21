import * as fs from "fs";
import * as path from "path"
import * as EventEmitter from "events";
import {utils} from "../utils/utils";
import {StateContext} from "../states/context";

export class PanelModel {
    protected storage: Array<Object> = [];
    protected readonly eventsObj: EventEmitter;
    protected jsonMap = new Map();
    private checkedBoxes: string;
    protected checkBoxArray = [];
    protected stateContext: StateContext;
    private docId;

    public constructor(eventsObj: EventEmitter) {
        this.eventsObj = eventsObj;
        this.fillStorage();
        this.subscribeListeners();
    }

    protected fillStorage() {
        const folderPath = path.join(__dirname, "js/res");
        fs.readdirSync(folderPath).forEach(fileName => {
            const jsonObject = window.require(folderPath + "/" + fileName);
            this.storage.push(jsonObject);
            const keysArray = Object.keys(jsonObject);
            keysArray.forEach(key => {
                this.jsonMap.set(key, jsonObject[key]);
            });
        });
    }

    private subscribeListeners() {
       this.eventsObj.on("ControllerInitialized", this.storageReady.bind(this));
    }

    private storageReady(stateContext: StateContext) {
        this.stateContext = stateContext;
    }

    public processResponse(responseArray, checkedBoxes, mappingResponse) {
        const responseJsonMap = this.createResponseMap();
        this.makeResponse(responseJsonMap, responseArray, checkedBoxes);
        this.eventsObj.emit("jsonProcessed", responseJsonMap, checkedBoxes, "quest", mappingResponse);
    }

    protected makeResponse(responseJsonMap, responseArray, checkedBoxes) {
        this.writeSession(checkedBoxes);
        responseArray.forEach((hierarchyObj) => {
            const hierarchy = hierarchyObj.hierarchy;
            const platformMap = responseJsonMap.get(hierarchyObj.platform);
            if(!hierarchy) {
                platformMap.set("base", true);
            }
            else {
                const splicedString = utils.spliceLastTillLast(hierarchy, ",");
                const jsonObj = this.jsonMap.get(splicedString);
                const responseObj = platformMap.get(splicedString);
                this.fillResponseMap(jsonObj, responseObj[splicedString], utils.spliceLastFromFront(hierarchy, ","));
            }
        });
    }

    private writeSession(checkedBoxes) {
        fs.writeFile(window.require('os').homedir() + "/" + this.docId + "/" + "CachePanel.json", JSON.stringify({
                checkedBoxes: checkedBoxes,
            }), err => {
            if (err) {
                console.log(err);
            }
        });
    }

    protected createResponseMap() {
        const jsonMap = new Map();
        ["desktop", "portrait", "landscape"].forEach(platform => {
            const viewJsonMap = this.createViewJsonMap();
            jsonMap.set(platform, viewJsonMap);
        });
        return jsonMap;
    }

    private createViewJsonMap() {
        const responseJsonMap = new Map();
        this.storage.forEach(jsonObject => {
            const keysArray = Object.keys(jsonObject);
            keysArray.forEach(key => {
                responseJsonMap.set(key, {[key]: {}});
            });
        });
        return responseJsonMap;
    }

    private fillResponseMap(jsonObj, responseObj, hierarchy) {
        const hierarchyArray = hierarchy.split(",");
        hierarchyArray.forEach(item => {
            const insertionKey = this.getInsertionObj(item, jsonObj);
            if(!insertionKey) {
                responseObj["base"] = true;
            } else {
                responseObj[insertionKey] = jsonObj[insertionKey];
            }
        });
    }

    private getInsertionObj(item, jsonObj) {
        for(let key in jsonObj) {
            if(jsonObj[key].id === item) {
                return key;
            }
        }
    }

    public onDocOpen(directory, docId) {
        this.docId = docId;
        this.checkIfJsonStorageExists(directory, docId);
    }

    private checkIfJsonStorageExists(directory, docId) {
        let data;
        try {
                data = fs.readFileSync(window.require('os').homedir() + "/" + docId + "/" + "CachePanel.json", {encoding: "utf8"});
            } catch(err) {
            try {
                data = fs.readFileSync(directory + "\\" + docId + "/CheckedBoxes.json", {encoding: "utf8"});
            } catch (err) {
                console.log("HTML PAGE IS GETTING RENDERED FOR THE FIRST TIME");
                this.stateContext.setState(this.stateContext.firstRenderState());
            }
        }
        if(data) {
            this.checkBoxArray = JSON.parse(data).checkedBoxes;
            this.stateContext.setState(this.stateContext.otherRendersState());
            this.stateContext.fillStorage(JSON.parse(data));
        }
        this.eventsObj.emit("StorageFull", this.storage);
    }

}