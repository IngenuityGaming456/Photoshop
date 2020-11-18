import {PanelModel} from "./PanelModel";
import * as fs from "fs";
import * as path from "path"
import {EventEmitter} from "events";
import {utils} from "../utils/utils";
import {modelConst} from "../constants/constants";

export class SelfPanelModel extends PanelModel {

    private viewStorage = [];
    private jsonObject: Object = {};
    protected storage = [];
    private checkBoxData = {};
    private questItems;
    private mediator;

    public constructor(eventsObj: EventEmitter, mediator: EventEmitter) {
        super(eventsObj);
        this.mediator = mediator;
        this.subscribeMediatorListeners();
        this.makeViewStorage();
    }

    protected subscribeMediatorListeners() {
        this.mediator.on("Checked", (platform, view, key) => {
            key = ["desktop", "portrait", "landscape"].includes(key) ? null : key;
            this.checkBoxArray.push({
                platform,
                view,
                key
            })
        })
    }

    protected fillStorage() {
        //pass
    }

    public storeQuestItems(questItems) {
        this.questItems = questItems;
    }

    private makeViewStorage() {
        const folderPath = path.join(__dirname, "js/res");
        fs.readdirSync(folderPath).forEach(fileName => {
            const jsonObject = window.require(folderPath + "/" + fileName);
            this.viewStorage.push(jsonObject);
        })
    }

    public selfFillStorage(activeDocument) {
        console.log(modelConst.platformArr);
        this.reset();
        const layers = activeDocument.layers;
        layers.forEach(item => {
            if (~item.name.search(/(desktop|portrait|landscape)/)) {
                const r1 = item.layers[0].name.search("common");
                if (r1 > -1) {
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
            let isNoContainer = true, isNoElement = true;
            view.layers && view.layers.forEach(component => {
                if (this.parseComponent(component, null, view.name, itemName)) {
                    if (this.getItemType(component) === "container") {
                        isNoContainer = false;
                    } else {
                        isNoElement = false;
                    }
                }
            })
            if (this.jsonObject[view.name]) {
                this.jsonObject[view.name]["noContainer"] = isNoContainer;
                this.jsonObject[view.name]["noElement"] = isNoElement;
            }
        })
    }

    private parseComponent(component, parentName, viewName, itemName) {
        if (component.type === "layerSection" && this.getItemType(component) === "container") {
            {
                if (!this.insertContainerInJson(component, parentName, viewName, itemName)) {
                    return false;
                }
                let isNoContainer = true, isNoElement = true;
                component.layers && component.layers.forEach(item => {
                    const type = this.getItemType(item);
                    if (type === "container") {
                        if (this.parseComponent(item, component.name, viewName, itemName)) {
                            isNoContainer = false;
                        }
                    } else {
                        if (this.insertElementInJson(item, type, component.name, viewName, itemName)) {
                            isNoElement = false;
                        }
                    }
                })
                this.jsonObject[viewName][component.name]["noContainer"] = isNoContainer;
                this.jsonObject[viewName][component.name]["noElement"] = isNoElement;
            }
        } else {
            const type = this.getItemType(component);
            if (!this.insertElementInJson(component, type, parentName, viewName, itemName)) {
                return false;
            }
        }
        return true;
    }

    private isNotAQuestComponent(component) {
        return !~this.questItems.indexOf(component.name);
    }

    private getItemType(item) {
        let type = item["generatorSettings"] && item["generatorSettings"]["PanelScripts"].json;
        type = type && type.substring(1, type.length - 1);
        if (item.type === "layer") {
            type = "image";
        }
        if (item.type === "textLayer") {
            type = "label";
        }
        if (!type && item.type === "layerSection" && !this.isASpecialContainer(item)) {
            type = "container";
        }
        return type;
    }

    private isASpecialContainer(item) {
        return item.name === "Symbols" || item.name === "Paylines" || item.name === "WinFrames";
    }

    private insertContainerInJson(container, parentName, viewName, itemName) {
        if (!this.isNotAQuestComponent(container) && this.isAllQuest(container)) {
            return false;
        }
        this.insert(container.name, "container", parentName, viewName, itemName);
        if (!container.layers || !this.notAll(container)) {
            this.jsonObject[viewName][container.name]["leaf"] = true;
        }
        return true;
    }

    private isAllQuest(container) {
        if (!container.layers) {
            return true;
        }
        for (let layer of container.layers) {
            const type = this.getItemType(layer);
            if (type === "image" || type === "label") {
                continue;
            }
            if (this.isNotAQuestComponent(layer)) {
                return false;
            }
            if (layer.layers && !this.isNestedStruct(type)) {
                if (!this.isAllQuest(layer)) {
                    return false;
                }
            }
        }
        return true;
    }

    private isNestedStruct(type) {
        return type === "button" || type === "animation" || type === "bitmap" || type === "meter";
    }

    private insertElementInJson(component, type, parentName, viewName, itemName) {
        if (type === "image" || type === "label") {
            return false;
        }
        if (!this.isNotAQuestComponent(component)) {
            return false;
        }
        this.insert(component.name, type, parentName, viewName, itemName);
        return true;
    }

    private insert(insertName, insertType, parentName, viewName, platformName) {
        if (!(viewName in this.jsonObject)) {
            this.jsonObject[viewName] = {};
        }
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
        return name + " [" + type + "]";
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
        for (let key in baseGameObj) {
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
        if (!this.jsonObject["BaseGame"]["noElement"]) {
            delete this.jsonObject["FreeGame"]["noElement"];
        }
        if (!this.jsonObject["BaseGame"]["noContainer"]) {
            delete this.jsonObject["FreeGame"]["noContainer"];
        }
    }

    private createModelStorage() {
        for (let key in this.jsonObject) {
            if (!this.jsonObject.hasOwnProperty(key)) {
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
        if (!this.isPlatformPresent(platformName)) {
            this.checkBoxArray.push({
                platform: platformName,
                view: null,
                key: null
            })
            this.stabaliseCheck(platformName, null, null);
        }
        if (!this.isViewPresent(platformName, viewName)) {
            this.checkBoxArray.push({
                platform: platformName,
                view: viewName,
                key: viewName
            })
            this.stabaliseCheck(platformName, viewName, viewName);
        }
        if (!this.isContainerPresent(platformName, viewName, keyName)) {
            this.checkBoxArray.push({
                platform: platformName,
                view: viewName,
                key: keyName
            })
        }
        this.stabaliseCheck(platformName, viewName, keyName);
    }

    private isPlatformPresent(platformName) {
        return this.checkBoxArray.find(item => utils.findInCheckBox(item, platformName, null, null));
    }

    private isViewPresent(platformName, viewName) {
        return this.checkBoxArray.find(item => utils.findInCheckBox(item, platformName, viewName, viewName));
    }

    private isContainerPresent(platformName, viewName, keyName) {
        return this.checkBoxArray.find(item => utils.findInCheckBox(item, platformName, viewName, keyName));
    }

    private stabaliseCheck(platformName, viewName, keyName) {
        const uncheckedPlatforms = this.getUncheckedPlatforms(platformName, viewName, keyName);
        for (let plat of uncheckedPlatforms) {
            keyName ??= plat;
            this.mediator.emit("checkChecked", plat, viewName, utils.spliceKeyType(keyName));
        }
        if (viewName === "BaseGame") {
            keyName = keyName === "BaseGame" ? "FreeGame" : keyName;
            if (keyName.includes("buttonsContainer")) {
                keyName = "buttonsContainer";
            }
            this.mediator.emit("checkChecked", platformName, "FreeGame", utils.spliceKeyType(keyName));
        }
    }

    private getUncheckedPlatforms(platformName, viewName, keyName) {
        const remainingPlatforms = ["desktop", "portrait", "landscape"].filter(item => item !== platformName);
        const remLength = remainingPlatforms.length;
        for (let i = remLength - 1; i > 0; i--) {
            const plat = this.checkBoxArray.find(item => utils.findInCheckBox(item, remainingPlatforms[i], viewName, keyName));
            if (plat) {
                remainingPlatforms.splice(i, 1);
            }
        }
        return remainingPlatforms;
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
        this.checkBoxArray.length = 0;
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