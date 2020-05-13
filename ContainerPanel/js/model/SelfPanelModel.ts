import {PanelModel} from "./PanelModel";
import * as fs from "fs";
import * as path from "path"
import {EventEmitter} from "events";

export class SelfPanelModel extends PanelModel {

    private viewStorage = [];
    private jsonObject = {};
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
            for(let key in jsonObject) {
                if(!jsonObject.hasOwnProperty(key)) {
                    continue;
                }
                this.jsonObject[key] = {};
            }
            this.viewStorage.push(jsonObject);
        })
    }

    public selfFillStorage(activeDocument) {
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
        this.createModelStorage();
    }

    private parseCommonLayers(commonLayer, itemName) {
        const viewLayers = commonLayer.layers;
        viewLayers.forEach(view => {
            view.layers && view.layers.forEach(container => {
                if(this.isQuestValidContainer(container.name, view.name)) {
                    this.parseQuestContainer(container, view.name, itemName);
                }
                if(this.isValidContainer(container.name, view.name)) {
                    this.parseContainer(container, view.name, itemName);
                }
            })
        })
    }

    private parseQuestContainer(container, viewName, itemName) {
        container.layers.forEach(subContainer => {
            if(this.isValidContainer(subContainer.name, viewName)) {
                this.parseContainer(subContainer, viewName, itemName);
            }
        })
    }

    private parseContainer(container, viewName, itemName) {
        this.insertContainerInJson(container, viewName, itemName);
        container.layers && container.layers.forEach(item => {
            const type = this.getItemType(item);
            this.insert(item.name, type, container.name, viewName, itemName);
            if(type === "container") {
                this.parseContainer(item, viewName, itemName);
            }
        })
    }

    private getItemType(item) {
        return item["generatorSettings"]["panelJson"];
    }

    private insertContainerInJson(container, viewName, itemName) {
        this.insert(container.name, "container", null, viewName, itemName);
    }

    private isQuestValidContainer(containerName, viewName) {
        const jsonObj = this.getJsonObject(viewName);
        for(let key in jsonObj) {
            if(containerName === key && !("leaf" in jsonObj[key])) {
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

    private createModelStorage() {
        for(let key in this.jsonObject) {
            if(!this.jsonObject.hasOwnProperty(key)) {
                continue;
            }
            const tempObj = {};
            tempObj[key] = this.jsonObject[key];
            this.storage.push(tempObj);
        }
        this.sendDataToController();
    }

    private insertIntoCheckBox(platformName, viewName, keyName) {
        this.checkBoxArray.push({
            platform: platformName,
            view: viewName,
            key: keyName
        })
    }

    private sendDataToController() {
        this.checkBoxData["checkedBoxes"] = this.checkBoxArray;
        this.stateContext.setState(this.stateContext.otherRendersState());
        this.stateContext.fillStorage(this.checkBoxData);
        this.eventsObj.emit("StorageFull", this.storage);
    }

}