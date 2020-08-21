import {PanelModel} from "./PanelModel";
import * as fs from "fs";
import * as path from "path"
import {EventEmitter} from "events";

export class SelfPanelModel extends PanelModel {

    private viewStorage = [];
    private jsonObject: Object = {};
    protected storage = [];
    private checkBoxData = {};

    public constructor(eventsObj: EventEmitter) {
        super(eventsObj);
        this.makeViewStorage();
    }

    protected fillStorage() {
        //pass
    }

    private makeViewStorage() {
        const folderPath = path.join(__dirname, "js/res");
        fs.readdirSync(folderPath).forEach(fileName => {
            const jsonObject = window.require(folderPath + "/" + fileName);
            this.viewStorage.push(jsonObject);
        })
    }

    public selfFillStorage(activeDocument) {
        this.reset();
        const layers = activeDocument.layers;
        layers.forEach(item => {
            if(~item.name.search(/(desktop|portrait|landscape)/)) {
                this.insertIntoCheckBox(item.name, null, null);
                const r1 = item.layers[0].name.search("common");
                if(r1 > -1) {
                    this.parseCommonLayers(item.layers[0], item.name);
                } else {
                    this.parseCommonLayers(item.layers[1], item.name);
                }
            }
        });
        this.modifyFreegame();
        this.createModelStorage();
    }

    private parseCommonLayers(commonLayer, itemName) {
        const viewLayers = commonLayer.layers;
        viewLayers && viewLayers.forEach(view => {
            this.insertIntoCheckBox(itemName, view.name, view.name);
            view.layers && view.layers.forEach(container => {
                if(this.isQuestValidContainer(container.name, view.name)) {
                    this.parseQuestContainer(container, null, view.name, itemName);
                }
                else if(this.isValidContainer(container.name, view.name)) {
                    this.parseContainer(container, null, view.name, itemName);
                }
            })
        })
    }

    private parseQuestContainer(container, parentName, viewName, itemName) {
        this.insertContainerInJson(container, parentName, viewName, itemName);
        container.layers && container.layers.forEach(subContainer => {
            if((subContainer.type === "layerSection" && !subContainer["generatorSettings"])) {
                if (this.isQuestValidContainer(subContainer.name, viewName)) {
                    this.parseQuestContainer(subContainer, container.name, viewName, itemName);
                } else if (this.isValidContainer(subContainer.name, viewName)) {
                    this.parseContainer(subContainer, container.name, viewName, itemName);
                }
            }
        })
    }

    private parseContainer(container, parentName, viewName, itemName) {
        this.insertContainerInJson(container, parentName, viewName, itemName);
        let isNoContainer = true, isNoElement = true;
        container.layers && container.layers.forEach(item => {
            const type = this.getItemType(item);
            (type !== "image" && type !== "label") && this.insert(item.name, type, container.name, viewName, itemName);
            if(type === "container") {
                isNoContainer = false;
                this.parseContainer(item, container.name, viewName, itemName);
            } else {
                isNoElement = false;
            }
        })
        if(isNoContainer) {
            this.jsonObject[viewName][container.name]["noContainer"] = true;
        }
        if(isNoElement) {
            this.jsonObject[viewName][container.name]["noElement"] = true;
        }

    }

    private getItemType(item) {
        let type = item["generatorSettings"] && item["generatorSettings"]["PanelScripts"].json;
        type = type && type.substring(1, type.length - 1);
        if(item.type === "layer") {
            type = "image";
        }
        if(item.type === "textLayer") {
            type = "label";
        }
        if(item.type === "layerSection") {
            type = "container";
        }
        return type;
    }

    private insertContainerInJson(container, parentName, viewName, itemName) {
        if(!(viewName in this.jsonObject)) {
            this.jsonObject[viewName] = {};
        }
        this.insert(container.name, "container", parentName, viewName, itemName);
        if(!container.layers || !this.notAll(container)) {
            this.jsonObject[viewName][container.name]["leaf"] = true;
        }
    }

    private isQuestValidContainer(containerName, viewName) {
        const jsonObj = this.getJsonObject(viewName);
        for(let key in jsonObj) {
            if(containerName === key) {
                return true;
            }
        }
        return false;
    }

    private isValidContainer(containerName, viewName) {
        const jsonObj = this.getJsonObject(viewName);
        for(let key in jsonObj) {
            if(containerName === key) {
                return false;
            }
        }
        return true;
    }

    private getJsonObject(viewName): Object {
        for(let json of this.viewStorage) {
            for(let key in json) {
                if(!json.hasOwnProperty(key)) {
                    continue;
                }
                if(key === viewName) {
                    return json[key];
                }
            }
        }
        return null;
    }

    private insert(insertName, insertType, parentName, viewName, platformName) {
        const name = this.jsonObject[viewName][insertName] = {};
        name["id"] = insertName;
        name["type"] = insertType;
        if (parentName) {
            name["parent"] = parentName;
        }
        const key = this.getKeyOnType(insertName, insertType);
        this.insertIntoCheckBox(platformName, viewName, key);
    }

    private getKeyOnType(name, type) {
        return name + "[" + type + "]";
    }

    private modifyFreegame() {
        if (!("BaseGame" in this.jsonObject)) {
            return;
        }
        const baseGameObj: Object = this.jsonObject["BaseGame"];
        // @ts-ignore
        if (!(this.jsonObject.hasOwnProperty("FreeGame"))) {
            // @ts-ignore
            this.jsonObject["FreeGame"] = {};
        }
        const freeGameObj: Object = this.jsonObject["FreeGame"]
        for(let key in baseGameObj) {
            if (baseGameObj.hasOwnProperty(key)) {
                if (key === "buttonsContainerBG") {
                    freeGameObj["buttonsContainer"] = Object.assign({}, baseGameObj[key]);
                    freeGameObj["buttonsContainer"].id = "buttonsContainer";
                } else {
                    freeGameObj[key] = Object.assign({}, baseGameObj[key]);
                }
                if (baseGameObj[key].parent === "buttonsContainerBG") {
                    freeGameObj[key].parent = "buttonsContainer";
                }
            }
        }
    }

    private createModelStorage() {
        for(let key in this.jsonObject) {
            if(!this.jsonObject.hasOwnProperty(key)) {
                continue;
            }
            const tempObj = {};
            tempObj[key] = this.jsonObject[key];
            this.storage.push(tempObj);
        }
        this.makeJsonMap();
        this.sendDataToController();
    }

    private insertIntoCheckBox(platformName, viewName, keyName) {
        this.checkBoxArray.push({
            platform: platformName,
            view: viewName,
            key: keyName
        })
    }

    private makeJsonMap() {
        this.storage.forEach(jsonObject => {
            const keysArray = Object.keys(jsonObject)
            keysArray.forEach(key => {
                this.jsonMap.set(key, jsonObject[key]);
            });
        })
    }

    private sendDataToController() {
        this.checkBoxData["checkedBoxes"] = this.checkBoxArray;
        this.stateContext.setState(this.stateContext.otherRendersState());
        this.stateContext.fillStorage(this.checkBoxData);
        this.eventsObj.emit("StorageFull", this.storage);
    }

    private reset() {
        this.jsonObject = {};
        this.storage.length = 0;
    }

    public processRefreshResponse(responseArray) {
        const responseJsonMap = this.createResponseMap();
        this.makeResponse(responseJsonMap, responseArray, {});
        this.eventsObj.emit("refreshResponse", responseJsonMap);
    }

    public processResponse(responseArray, checkedBoxes, mappingResponse) {
        const responseJsonMap = this.createResponseMap();
        this.makeResponse(responseJsonMap, responseArray, checkedBoxes);
        this.eventsObj.emit("jsonProcessed", responseJsonMap, checkedBoxes, "self", mappingResponse);
    }

    private notAll(container) {
        return container.layers.some(layer => {
            return layer.type !== "layer" && layer.type !== "textLayer";
        });
    }
}