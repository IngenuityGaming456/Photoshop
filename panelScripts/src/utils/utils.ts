import * as fs from "fs";
import * as path from "path";
import * as layerClass from "../../lib/dom/layer";
import {photoshopConstants as pc} from "../constants";
import {JsonComponentsFactory} from "../modules/JsonComponentsFactory";

export class utlis {

    public static isKeyExists(searchArray, key) {
        return ~searchArray.indexOf(key);
    }

    public static isIDExistsRec(id, idArray) {
        const itemRef = idArray.find(item => {
            if(item.id === Number(id)) {
                return true;
            }
        });
        if(itemRef) {
            return itemRef;
        }
        for(let item of idArray) {
            if(item.layers) {
                const itemRefRec = utlis.isIDExistsRec(id, item.layers);
                    if(itemRefRec) {
                        return itemRefRec;
                    }
                }
            }
        return null;
    }

    public static isIDExists(id, idArray) {
        return idArray.find(item => {
            if (item.id === id) {
                return true;
            }
        });
    };

    public static isNameExists(name, keyArray) {
        return keyArray.find(item => {
            if (item.name === name) {
                return true;
            }
        });
    }

    public static getConsecutiveIndexes(itemArray, index) {
        const itemLength = itemArray.length;
        let nextIndex = index + 1;
        let nextToNextIndex = index + 2;
        if (nextIndex >= itemLength) {
            nextIndex = nextIndex - itemLength;
        }
        if (nextToNextIndex >= itemLength) {
            nextToNextIndex = nextToNextIndex - itemLength;
        }
        return {
            firstIndex: nextIndex,
            secondIndex: nextToNextIndex
        }
    }

    public static mapToObject(map) {
        if (!map) {
            return null;
        }
        let obj = {};
        map.forEach((value, key) => {
            if (value instanceof Map) {
                obj[key] = utlis.mapToObject(value);
            } else {
                obj[key] = value;
            }
        });
        return obj;
    }

    public static objectToMap(obj) {
        if (!obj) {
            return null;
        }
        let map = new Map();
        for (let key of Object.keys(obj)) {
            if (obj[key] instanceof Object) {
                map.set(key, utlis.objectToMap(obj[key]));
            } else {
                map.set(key, obj[key])
            }
        }
        return map;
    }

    public static traverseObject(arrayLayers, callback, callbackLayers?) {
        let noOfLayers = arrayLayers.length;
        for (let i = 0; i < noOfLayers; i++) {
            if (arrayLayers[i].type === "layer") {
                callback(arrayLayers[i]);
            }
            if (arrayLayers[i].type === "layerSection") {
                if (arrayLayers[i].layers) {
                    callbackLayers && callbackLayers(arrayLayers[i]);
                    utlis.traverseObject(arrayLayers[i].layers, callback, callbackLayers);
                }
            }
        }
    }

    public static traverseBaseFreeGame(arrayLayers, callback) {
        let noOfLayers = arrayLayers.length;
        for (let i = 0; i < noOfLayers; i++) {
            if (arrayLayers[i].name === pc.views.baseGame || arrayLayers[i].name === pc.views.freeGame) {
                callback(arrayLayers[i]);
            } else if (arrayLayers[i].layers) {
                utlis.traverseBaseFreeGame(arrayLayers[i].layers, callback);
            }
        }
    }

    public static removeFile(fileName) {
        const stats = fs.lstatSync(fileName);
        if (stats.isDirectory()) {
            fs.readdirSync(fileName).forEach(file => {
                utlis.removeFile(fileName + "/" + file);
            });
        } else {
            if (path.basename(fileName) === "Image.png") {
                fs.unlink(fileName, err => {
                    if (err) {
                        console.log("unable to remove file");
                    } else {
                        console.log("done");
                    }
                });
            }
        }
    }

    public static handleModelData(eventLayers, drawnQuestItems, viewElementalMap, sessionHandler) {
        for (let platform in viewElementalMap) {
            if (!viewElementalMap.hasOwnProperty(platform)) {
                continue;
            }
            const platformMap = viewElementalMap[platform];
            for (let view in platformMap) {
                if (!platformMap.hasOwnProperty(view)) {
                    continue;
                }
                const viewItems = platformMap[view];
                for (let itemV in viewItems) {
                    const deletionObj = {};
                    if (!viewItems.hasOwnProperty(itemV)) {
                        continue;
                    }
                    utlis.setDeletionObj(platform, view, deletionObj);
                    utlis.handleView(viewItems, itemV, eventLayers, drawnQuestItems, deletionObj, sessionHandler);
                }
            }
        }
    }

    private static setDeletionObj(platform, baseView, deletionObj) {
        deletionObj["platform"] = platform;
        deletionObj["view"] = baseView;
    }

    private static setSubDeletionObj(id, name, type, deletionObj, sessionHandler) {
        deletionObj[name] = {};
        deletionObj[name]["name"] = name;
        deletionObj[name]["id"] = id;
        deletionObj[name]["type"] = type;
        sessionHandler.push(deletionObj);
    }

    private static handleView(viewItems, itemV, eventLayers, drawnQuestItems, deletionObj, sessionHandler) {
        const viewItem = viewItems[itemV];
        const indexes = [];
        if (viewItem instanceof Array) {
            viewItem.forEach((item, index) => {
                const itemRef = utlis.isIDExists(item.id, eventLayers);
                if (itemRef) {
                    indexes.push(index);
                    utlis.spliceFrom(item.id, drawnQuestItems);
                    utlis.setSubDeletionObj(item.id, item.name, itemV, deletionObj, sessionHandler);
                }
            });
            utlis.spliceFromIndexes(viewItem, indexes);
        } else {
            const itemRef = utlis.isIDExists(viewItem.id, eventLayers);
            if (itemRef) {
                utlis.spliceFrom(viewItem.id, drawnQuestItems);
                utlis.setSubDeletionObj(viewItem.id, viewItem.name, itemV, deletionObj, sessionHandler);
                delete viewItems[itemV];
            }
        }
    }

    public static getElementPlatform(element, activeLayers) {
        const activeDocumentLayers: layerClass.LayerGroup = activeLayers;
        const insertionRef = activeDocumentLayers.findLayer(element.id);
        return utlis.getElementName(insertionRef, null);
    }

    public static spliceFrom(id, array) {
        const ref = utlis.isIDExists(id, array);
        if (ref) {
            const indexOf = array.indexOf(ref);
            if (indexOf > -1) {
                array.splice(indexOf, 1);
            }
        }
    }

    public static getCommonId(platformRef: layerClass.LayerGroup) {
        for(let layer of platformRef.layers) {
            if(layer.name === pc.common) {
                return layer.id;
            }
        }
    }

    public static getElementView(element, activeDocumentLayers) {
        const layers: layerClass.LayerGroup = activeDocumentLayers;
        const elementRef = layers.findLayer(element.id);
        return utlis.getElementName(elementRef, "common");
    }

    public static getElementName(elementRef, keyName) {
        if ((elementRef.layer)) {
            if(elementRef.layer.group.name === keyName) return elementRef.layer.name;
            return utlis.getElementName(elementRef.layer.group, keyName);
        }
        if (elementRef.group && elementRef.group.name === keyName) {
            return elementRef.name;
        } else if (elementRef.group) {
            return utlis.getElementName(elementRef.group, keyName);
        } else {
            return null;
        }
    }

    public static spliceFromIndexes(arr, indexArr) {
        const indexLength = indexArr.length;
        for (let i = 0; i < indexLength; i++) {
            arr.splice(indexArr[i], 1);
            for (let j = i + 1; j < indexLength; j++) {
                indexArr[j]--;
            }
        }
    }

    public static makeDir(path) {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
    }

    public static traverseAddedLayers(addedLayers, callback) {
        addedLayers.forEach(item => {
            if(item.added) {
                callback(item);
            }
            if(item.layers) {
                utlis.traverseAddedLayers(item.layers, callback);
            }
        });
    }

    public static getAllLayersAtLevel(arrayLayers, level) {
        const levelArray = arrayLayers;
        const cumLevelArray = [];
        levelArray.forEach(item => {
            cumLevelArray.push([item]);
        });
        return utlis.getLayersAtLevel(cumLevelArray, level);
    }

    private static getLayersAtLevel(cumLevelArray, level) {
        if(level <= -1) {
            return cumLevelArray;
        }
        const allLayers = [];
        cumLevelArray.forEach(item => {
            const layerArray = [];
            item.forEach(itemSub => {
                itemSub.layers && itemSub.layers.forEach(layer => {
                    layerArray.push(layer);
                })
            });
            allLayers.push(layerArray);
        });
        return utlis.getLayersAtLevel(allLayers, --level);
    }

    public static getNextAvailableIndex(queryObject, index) {
        if(!queryObject.hasOwnProperty(index)) {
            return index;
        }
        return utlis.getNextAvailableIndex(queryObject, ++index);
    }

    public static addKeyToObject(queryObj, key) {
        if(!queryObj.hasOwnProperty(key)) {
            queryObj[key] = {};
        }
    }

    public static containAll(array1, array2) {
        const delocalisedLayers = [];
        const compareMap2 = new Map();
        const arrayLength2 = array2.length;
        for(let i=0;i<arrayLength2;i++) {
            if(!compareMap2.get(array2[i])) {
                compareMap2.set(array2[i], 1);
            } else {
                let value = compareMap2.get(array2[i]);
                compareMap2.set(array2[i], ++value);
            }
        }
        const arrayLength1 = array1.length;
        for(let i=0;i<arrayLength1;i++) {
            if(!compareMap2.get(array1[i])) {
                delocalisedLayers.push(array1[i]);
            }
        }
        if(delocalisedLayers.length) {
            return {
                isTrue: false,
                delocalisedLayers: delocalisedLayers
            }
        }
        return {
            isTrue: true
        }
    }

    public static isLayerExists(layerRef, idKey) {
        const layerRefLayers = layerRef.layer.layers;
        for(let item of layerRefLayers) {
            if(item.id !== idKey) {
                return true;
            }
        }
        return false;
    }

    public static putComponentInGeneratorSettings(item, pluginId, component) {
        if(item.hasOwnProperty("generatorSettings") && item["generatorSettings"] === false) {
            item["generatorSettings"] = {};
        }
        utlis.addKeyToObject(item, "generatorSettings");
        utlis.addKeyToObject(item["generatorSettings"], pluginId);
        item["generatorSettings"][pluginId]["json"] = component;
    }

    public static getParsedEvent(pathArray, layers) {
        let eventLayers = [];
        pathArray.forEach((item, index) => {
            if(index === 0) {
                eventLayers.push(layers[item[0]]);
            } else {
                const layerStructure = utlis.getLayersStructureAtLevel(index, 0, eventLayers);
                utlis.spliceAllButItem(layerStructure, item);
            }
        });
        return eventLayers;
    }

    public static getLayersStructureAtLevel(index, level, eventLayers) {
        if(index === level) {
            return eventLayers;
        }
        return utlis.getLayersStructureAtLevel(index, ++level, eventLayers[0].layers);
    }

    public static spliceAllButItem(spliceArray, itemArray) {
        for(let i=0;i<spliceArray.length;i++) {
            if(!(~itemArray.indexOf(i))) {
                spliceArray.splice(i, 1);
                itemArray.forEach((item,index) => {
                    if(item > 0) {
                        itemArray[index] = --item;
                    }
                });
                i--;
            }
        }
    }

    public static getView(commonRef, viewName) {
        const viewLayers = commonRef.layer.layers;
        for(let item of viewLayers) {
            if(item.name === viewName) {
                return item.id;
            }
        }
        return null;
    }

    public static getPlatformRef(platform, activeDocument) {
        const activeLayers: layerClass.LayerGroup = activeDocument.layers.layers;
        for(let layer of activeLayers) {
            if(layer.name === platform) {
                return layer;
            }
        }
    }

    public static hasKey(keyArray, key) {
        for(let item of keyArray) {
            if(item.hasOwnProperty(key)) {
                return item;
            }
        }
        return null;
    }

    public static breakArrayOnTrue(breakArray) {
        const splitIndexes = [];
        for(let i=0;i<breakArray.length;i++) {
            if(breakArray[i] === true && breakArray[i+1] !== true && breakArray[i+2] !== true) {
                splitIndexes.push(i);
            }
        }
        splitIndexes.unshift(0);
        const breakArrays = [];
        splitIndexes.forEach((splitIndex, index) => {
            if(splitIndexes[index + 1]) {
                breakArrays.push(breakArray.slice(splitIndexes[index] + Math.ceil(index/100000), splitIndexes[index + 1] + 1));
            }
        });
        return breakArrays;
    }

    public static isNotContainer(item, activeDocument, resultLayers, pluginId) {
        if(!item) {
            return true
        }
        const itemRef = activeDocument.layers.findLayer(item.id);
        const itemRefResult = utlis.findLayerInResult(item.id, resultLayers);
        if(itemRefResult && itemRefResult.generatorSettings && itemRefResult.generatorSettings[pluginId]) {
            const genSettings = itemRefResult.generatorSettings[pluginId].json;
            const jsonMap = JsonComponentsFactory.makeJsonComponentsMap();
            const keysArray = [...jsonMap.keys(), ...["payline", "winframe", "symbol"]];
            return keysArray.some(type => {
                return !!(~genSettings.search(type));
            });
        }
        return utlis.isNotContainer(itemRef.layer.group, activeDocument, resultLayers, pluginId);
    }

    public static findLayerInResult(id, resultLayers) {
        for(let item of resultLayers) {
            if(item.id === id) {
                return item;
            }
            if(item.layers) {
                const returnValue = utlis.findLayerInResult(id, item.layers);
                if(returnValue) {
                    return returnValue;
                }
            }
        }
        return null;
    }

}
