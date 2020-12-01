"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.utlis = void 0;
const fs = require("fs");
const path = require("path");
const constants_1 = require("../constants");
const JsonComponentsFactory_1 = require("../modules/JsonComponentsFactory");
const fsx = require("fs-extra");
class utlis {
    static isKeyExists(searchArray, key) {
        return ~searchArray.indexOf(key);
    }
    static isIDExistsRec(id, idArray) {
        const itemRef = idArray.find(item => {
            if (item.id === Number(id)) {
                return true;
            }
        });
        if (itemRef) {
            return itemRef;
        }
        for (let item of idArray) {
            if (item.layers) {
                const itemRefRec = utlis.isIDExistsRec(id, item.layers);
                if (itemRefRec) {
                    return itemRefRec;
                }
            }
        }
        return null;
    }
    static isIDExists(id, idArray) {
        return idArray.find(item => {
            if (item.id === id) {
                return true;
            }
        });
    }
    ;
    static isNameExists(name, keyArray) {
        return keyArray.find(item => {
            if (item.name === name) {
                return true;
            }
            if (item === name) {
                return true;
            }
        });
    }
    static pushUniqueToArray(arr, val) {
        if (!~arr.indexOf(val)) {
            arr.push(val);
        }
    }
    static getConsecutiveIndexes(itemArray, index) {
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
        };
    }
    static mapToObject(map) {
        if (!map) {
            return null;
        }
        let obj = {};
        map.forEach((value, key) => {
            if (value instanceof Map) {
                obj[key] = utlis.mapToObject(value);
            }
            else {
                obj[key] = value;
            }
        });
        return obj;
    }
    static objectToMap(obj) {
        if (!obj) {
            return null;
        }
        let map = new Map();
        for (let key of Object.keys(obj)) {
            if (obj[key] instanceof Object) {
                map.set(key, utlis.objectToMap(obj[key]));
            }
            else {
                map.set(key, obj[key]);
            }
        }
        return map;
    }
    static traverseObject(arrayLayers, callback, callbackLayers) {
        let noOfLayers = arrayLayers.length;
        for (let i = 0; i < noOfLayers; i++) {
            if (arrayLayers[i].type === "layer") {
                callback && callback(arrayLayers[i]);
            }
            if (arrayLayers[i].type === "layerSection") {
                callbackLayers && callbackLayers(arrayLayers[i]);
                if (arrayLayers[i].layers) {
                    utlis.traverseObject(arrayLayers[i].layers, callback, callbackLayers);
                }
            }
        }
    }
    static traverseBaseFreeGame(arrayLayers, callback) {
        let noOfLayers = arrayLayers.length;
        for (let i = 0; i < noOfLayers; i++) {
            if (arrayLayers[i].name === constants_1.photoshopConstants.views.baseGame || arrayLayers[i].name === constants_1.photoshopConstants.views.freeGame) {
                callback(arrayLayers[i]);
            }
            else if (arrayLayers[i].layers) {
                utlis.traverseBaseFreeGame(arrayLayers[i].layers, callback);
            }
        }
    }
    static removeFile(fileName) {
        const stats = fs.lstatSync(fileName);
        if (stats.isDirectory()) {
            fs.readdirSync(fileName).forEach(file => {
                utlis.removeFile(fileName + "/" + file);
            });
        }
        else {
            if (path.basename(fileName) === "Image.png") {
                fs.unlink(fileName, err => {
                    if (err) {
                        console.log("unable to remove file");
                    }
                    else {
                        console.log("done");
                    }
                });
            }
        }
    }
    static handleModelData(eventLayers, drawnQuestItems, viewElementalMap, questViews, sessionHandler, generator) {
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
                    if ("base" in viewItems[itemV]) {
                        const itemRef = utlis.isIDExists(viewItems[itemV].base.id, eventLayers);
                        if (itemRef && !questViews.indexOf(itemV)) {
                            utlis.deleteAllLinkedViews(constants_1.photoshopConstants.platformArray, itemV, viewElementalMap, generator);
                            continue;
                        }
                    }
                    utlis.setDeletionObj(platform, view, deletionObj);
                    utlis.handleView(viewItems, itemV, eventLayers, drawnQuestItems, deletionObj, sessionHandler);
                }
            }
        }
    }
    static deleteAllLinkedViews(platformArray, viewKey, elementalMap, generator) {
        platformArray.forEach(plat => {
            //Not using await as all this is the backend data
            try {
                generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), { id: elementalMap[viewKey]["base"].id });
            }
            catch (err) {
                console.log("No such layer found , ", err);
            }
            delete elementalMap[plat][viewKey];
        });
    }
    static setDeletionObj(platform, baseView, deletionObj) {
        deletionObj["platform"] = platform;
        deletionObj["view"] = baseView;
    }
    static setSubDeletionObj(id, name, type, deletionObj, sessionHandler) {
        deletionObj[name] = {};
        deletionObj[name]["name"] = name;
        deletionObj[name]["id"] = id;
        deletionObj[name]["type"] = type;
        sessionHandler.push(deletionObj);
    }
    static handleView(viewItems, itemV, eventLayers, drawnQuestItems, deletionObj, sessionHandler) {
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
        }
        else {
            const itemRef = utlis.isIDExists(viewItem.id, eventLayers);
            if (itemRef) {
                utlis.spliceFrom(viewItem.id, drawnQuestItems);
                utlis.setSubDeletionObj(viewItem.id, viewItem.name, itemV, deletionObj, sessionHandler);
                delete viewItems[itemV];
            }
        }
    }
    static getElementPlatform(element, activeLayers) {
        const activeDocumentLayers = activeLayers;
        const insertionRef = activeDocumentLayers.findLayer(element.id);
        return utlis.getElementName(insertionRef, null);
    }
    static spliceFrom(id, array) {
        const ref = utlis.isIDExists(id, array);
        if (ref) {
            const indexOf = array.indexOf(ref);
            if (indexOf > -1) {
                array.splice(indexOf, 1);
            }
        }
    }
    static getCommonId(platformRef) {
        for (let layer of platformRef.layers) {
            if (layer.name === constants_1.photoshopConstants.common) {
                return layer.id;
            }
        }
    }
    static getElementView(element, activeDocumentLayers) {
        const layers = activeDocumentLayers;
        const elementRef = layers.findLayer(element.id);
        return utlis.getElementName(elementRef, "common");
    }
    static getElementName(elementRef, keyName) {
        if ((elementRef.layer)) {
            if (elementRef.layer.group.name === keyName)
                return elementRef.layer.name;
            return utlis.getElementName(elementRef.layer.group, keyName);
        }
        if (elementRef.group && elementRef.group.name === keyName) {
            return elementRef.name;
        }
        else if (elementRef.group) {
            return utlis.getElementName(elementRef.group, keyName);
        }
        else {
            return null;
        }
    }
    static spliceFromIndexes(arr, indexArr) {
        const indexLength = indexArr.length;
        for (let i = 0; i < indexLength; i++) {
            arr.splice(indexArr[i], 1);
            for (let j = i + 1; j < indexLength; j++) {
                indexArr[j]--;
            }
        }
    }
    static makeDir(path) {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
    }
    static traverseAddedLayers(addedLayers, callback) {
        addedLayers.forEach(item => {
            if (item.added) {
                callback(item);
            }
            if (item.layers) {
                utlis.traverseAddedLayers(item.layers, callback);
            }
        });
    }
    static getFirstAddedItem(addedLayers, callback) {
        for (let item of addedLayers) {
            if (item.added) {
                callback(item);
                return;
            }
            else if (item.layers) {
                utlis.getFirstAddedItem(item.layers, callback);
            }
        }
    }
    static getAllLayersAtLevel(arrayLayers, level) {
        const levelArray = arrayLayers;
        const cumLevelArray = [];
        levelArray.forEach(item => {
            cumLevelArray.push([item]);
        });
        return utlis.getLayersAtLevel(cumLevelArray, level);
    }
    static getLayersAtLevel(cumLevelArray, level) {
        if (level <= -1) {
            return cumLevelArray;
        }
        const allLayers = [];
        cumLevelArray.forEach(item => {
            const layerArray = [];
            item.forEach(itemSub => {
                itemSub.layers && itemSub.layers.forEach(layer => {
                    layerArray.push(layer);
                });
            });
            allLayers.push(layerArray);
        });
        return utlis.getLayersAtLevel(allLayers, --level);
    }
    static getLastParentAndChildLayers(layers) {
        const resultObj = { "parent": undefined, child: [] };
        utlis.getLastParentAndChildLayersObj(layers, resultObj);
        return resultObj;
    }
    static getLastParentAndChildLayersObj(layers, resultObj) {
        for (const item of layers) {
            if (item.layers) {
                for (const subLayers of item.layers) {
                    if (!subLayers.layers) {
                        resultObj["parent"] = item;
                        resultObj["child"] = item.layers;
                        return;
                    }
                }
                return utlis.getLastParentAndChildLayersObj(item.layers, resultObj);
            }
        }
    }
    static getNextAvailableIndex(queryObject, index) {
        if (!queryObject.hasOwnProperty(index)) {
            return index;
        }
        return utlis.getNextAvailableIndex(queryObject, ++index);
    }
    static addKeyToObject(queryObj, key) {
        if (!queryObj.hasOwnProperty(key)) {
            queryObj[key] = {};
        }
    }
    static addArrayKeyToObject(queryObj, key) {
        if (!queryObj.hasOwnProperty(key)) {
            queryObj[key] = [];
        }
    }
    static containAll(array1, array2) {
        const delocalisedLayers = [];
        const compareMap2 = new Map();
        const arrayLength2 = array2.length;
        for (let i = 0; i < arrayLength2; i++) {
            if (!compareMap2.get(array2[i])) {
                compareMap2.set(array2[i], 1);
            }
            else {
                let value = compareMap2.get(array2[i]);
                compareMap2.set(array2[i], ++value);
            }
        }
        const arrayLength1 = array1.length;
        for (let i = 0; i < arrayLength1; i++) {
            if (!compareMap2.get(array1[i])) {
                delocalisedLayers.push(array1[i]);
            }
        }
        if (delocalisedLayers.length) {
            return {
                isTrue: false,
                delocalisedLayers: delocalisedLayers
            };
        }
        return {
            isTrue: true
        };
    }
    static isLayerExists(layerRef, idKey) {
        const layerRefLayers = layerRef.layer.layers;
        for (let item of layerRefLayers) {
            if (item.id !== idKey) {
                return true;
            }
        }
        return false;
    }
    static putComponentInGeneratorSettings(item, pluginId, component) {
        if (item.hasOwnProperty("generatorSettings") && item["generatorSettings"] === false) {
            item["generatorSettings"] = {};
        }
        utlis.addKeyToObject(item, "generatorSettings");
        utlis.addKeyToObject(item["generatorSettings"], pluginId);
        item["generatorSettings"][pluginId]["json"] = component;
    }
    static getParsedEvent(pathArray, layers, indexObj, subLevel, eventLayers) {
        eventLayers = eventLayers !== null && eventLayers !== void 0 ? eventLayers : [];
        if (indexObj.index >= pathArray.length) {
            return;
        }
        const subArr = pathArray[indexObj.index];
        const subArrLength = subArr.length;
        if ((indexObj.index === 0 && !(~subArr.indexOf(-1)) || (subArrLength > 1 && subArr[1] !== -1))) {
            let j = 0;
            for (let i = subArrLength - 1; i >= 0; i--) {
                eventLayers.push(layers[i]);
                indexObj.index += 1;
                utlis.getParsedEvent(pathArray, layers, indexObj, j, eventLayers);
                j++;
            }
        }
        else {
            if (subLevel === null) {
                return layers;
            }
            const layerStructure = utlis.getLayersStructureAtLevel(subLevel, eventLayers);
            utlis.spliceAllButItem(layerStructure, subArr);
            if (subArr.length === 1) {
                indexObj.index += 1;
                subLevel = subArr[0];
                utlis.getParsedEvent(pathArray, layers, indexObj, subLevel, layerStructure);
            }
        }
        return eventLayers;
    }
    static getLayersStructureAtLevel(subLevel, eventLayers) {
        return eventLayers[subLevel].layers;
    }
    static spliceAllButItem(spliceArray, itemArray) {
        for (let i = 0; i < spliceArray.length; i++) {
            if (!(~itemArray.indexOf(i))) {
                spliceArray.splice(i, 1);
                itemArray.forEach((item, index) => {
                    if (item > 0) {
                        itemArray[index] = --item;
                    }
                });
                i--;
            }
        }
    }
    static getView(commonRef, viewName) {
        const viewLayers = commonRef.layer.layers;
        for (let item of viewLayers) {
            if (item.name === viewName) {
                return item.id;
            }
        }
        return null;
    }
    static getPlatformRef(platform, activeDocument) {
        const activeLayers = activeDocument.layers.layers;
        for (let layer of activeLayers) {
            if (layer.name === platform) {
                return layer;
            }
        }
    }
    static hasKey(keyArray, key) {
        for (let item of keyArray) {
            if (item.hasOwnProperty(key)) {
                return item;
            }
        }
        return null;
    }
    static breakArrayOnTrue(breakArray) {
        const splitIndexes = [];
        for (let i = 0; i < breakArray.length; i++) {
            if (breakArray[i] === true && breakArray[i + 1] !== true && breakArray[i + 2] !== true) {
                splitIndexes.push(i);
            }
        }
        splitIndexes.unshift(0);
        const breakArrays = [];
        splitIndexes.forEach((splitIndex, index) => {
            if (splitIndexes[index + 1]) {
                breakArrays.push(breakArray.slice(splitIndexes[index] + Math.ceil(index / 100000), splitIndexes[index + 1] + 1));
            }
        });
        return breakArrays;
    }
    static isNotContainer(item, activeDocument, resultLayers, pluginId) {
        if (!item) {
            return true;
        }
        const itemRef = activeDocument.layers.findLayer(item.id);
        const itemRefResult = utlis.findLayerInResult(item.id, resultLayers);
        if (itemRefResult && itemRefResult.generatorSettings && itemRefResult.generatorSettings[pluginId]) {
            const genSettings = itemRefResult.generatorSettings[pluginId].json;
            const jsonMap = JsonComponentsFactory_1.JsonComponentsFactory.makeJsonComponentsMap();
            const keysArray = [...jsonMap.keys(), ...["payline", "winframe", "symbol"]];
            return keysArray.some(type => {
                return !!(~genSettings.search(type));
            });
        }
        return utlis.isNotContainer(itemRef.layer.group, activeDocument, resultLayers, pluginId);
    }
    static findLayerInResult(id, resultLayers) {
        for (let item of resultLayers) {
            if (item.id === id) {
                return item;
            }
            if (item.layers) {
                const returnValue = utlis.findLayerInResult(id, item.layers);
                if (returnValue) {
                    return returnValue;
                }
            }
        }
        return null;
    }
    static isButton(array1, array2) {
        if (array1.length !== array2.length) {
            return false;
        }
        const arrayLength = array1.length;
        for (let i = 0; i < arrayLength; i++) {
            if (i !== arrayLength - 1 && array1[i] !== array2[i]) {
                return false;
            }
        }
        return true;
    }
    static makeResponse(responseArray) {
        const responseSubArray = [];
        responseArray.forEach(item => {
            const multiples = item.split(",");
            const multipleArray = [];
            multiples.forEach(subItem => {
                multipleArray.push(subItem);
            });
            responseSubArray.push(multipleArray);
        });
        return responseSubArray;
    }
    static findParent(layer, activeDocument) {
        const layerRef = activeDocument.layers.findLayer(layer.id);
        if (layerRef.layer) {
            return layerRef.layer.group.name;
        }
    }
    static findView(layer, activeDocument, key) {
        const layerRef = activeDocument.layers.findLayer(layer.id);
        return utlis.recurView(layerRef, key);
    }
    static findPlatform(layer, activeDocument) {
        const layerRef = activeDocument.layers.findLayer(layer.id);
        return utlis.recurPlatform(layerRef);
    }
    static recurView(layerRef, key) {
        if (layerRef.layer && layerRef.layer.group.name === key) {
            return layerRef.layer.name;
        }
        else if (layerRef.group && layerRef.group.name === key) {
            return layerRef.name;
        }
        else if (layerRef.layer) {
            return utlis.recurView(layerRef.layer.group, key);
        }
        else {
            return utlis.recurView(layerRef.group, key);
        }
    }
    static recurPlatform(layerRef) {
        if (layerRef.layer && layerRef.layer.group.name === "common") {
            return layerRef.layer.group.group.name;
        }
        else if (layerRef.group && layerRef.group.name === "common") {
            return layerRef.group.group.name;
        }
        else if (layerRef.layer) {
            return utlis.recurPlatform(layerRef.layer.group);
        }
        else {
            return utlis.recurPlatform(layerRef.group);
        }
    }
    static renameElementalMap(elementalMap, name, id, generator) {
        for (let platform in elementalMap) {
            if (!elementalMap.hasOwnProperty(platform)) {
                continue;
            }
            const viewObj = elementalMap[platform];
            for (let view in viewObj) {
                if (!viewObj.hasOwnProperty(view) || view === "base") {
                    continue;
                }
                if ("base" in viewObj[view] && viewObj[view]["base"].id === id) {
                    utlis.renameAllLinkedViews(constants_1.photoshopConstants.platformArray, view, elementalMap, name, generator);
                    continue;
                }
                const elementalObj = viewObj[view];
                utlis.renameElementalObj(elementalObj, name, id);
            }
        }
    }
    static renameElementalObj(elementalObj, name, id) {
        for (let element in elementalObj) {
            if (!elementalObj.hasOwnProperty(element) || element === "base") {
                continue;
            }
            const component = elementalObj[element];
            const item = utlis.isIDExists(id, component);
            if (item) {
                item.name = name;
            }
        }
    }
    static renameAllLinkedViews(platformArray, viewKey, elementalMap, name, generator) {
        platformArray.forEach(plat => {
            generator.evaluateJSXFile(path.join(__dirname, "../../jsx/UndoRenamedLayer.jsx"), { id: elementalMap[plat][viewKey]["base"].id, name });
        });
    }
    static getAssetsAndJson(key, activeDocument) {
        const savedPath = activeDocument.directory;
        // const extIndex = activeDocument.name.indexOf(".");
        const extIndex = activeDocument.name.search(".psd");
        const fileName = activeDocument.name.slice(0, extIndex);
        const qAssetsPath = savedPath + `\\${fileName}\\` + `${key}\\${fileName}-assets`;
        const qJsonPath = savedPath + `\\${fileName}\\` + `${key}\\${fileName}.json`;
        let sObj = fs.readFileSync(qJsonPath, "utf-8");
        let qObj = JSON.parse(sObj);
        return {
            qAssetsPath,
            qObj
        };
    }
    static recurFiles(fileName, folderPath) {
        const files = fs.readdirSync(folderPath);
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                return utlis.recurFiles(fileName, filePath);
            }
            // if(file.split('.').slice(0, -1).join('.') === fileName)
            const fileExtIndex = file.search(".png");
            let fileExt;
            if (fileExtIndex > -1) {
                fileExt = file.slice(0, fileExtIndex);
            }
            if (fileExt === fileName) {
                return filePath;
            }
        }
    }
    static copyFolder(directory, source, destination) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fsx.copy(path.join(directory, source.toString()), path.join(directory, destination.toString()));
                console.log("copied completed");
            }
            catch (_a) {
                console.log("Error in file copy");
            }
        });
    }
    static sendResponseToPanel(elementView, elementPlatform, elementName, startEvent, stopEvent, socket) {
        return new Promise(resolve => {
            const eventNames = socket.eventNames();
            if (~eventNames.indexOf(stopEvent)) {
                socket.removeAllListeners(stopEvent);
            }
            socket.on(stopEvent, () => resolve("done"));
            socket.emit(startEvent, elementPlatform, elementView, elementName);
        });
    }
    static spliceFromIdArray(arr, idArr) {
        for (let id of idArr) {
            const indexOf = arr.indexOf(id);
            if (indexOf > -1) {
                arr.splice(indexOf, 1);
            }
        }
    }
    static getGenSettings(layer, pluginId) {
        var _a;
        const type = layer.generatorSettings ? (_a = layer.generatorSettings[pluginId]) === null || _a === void 0 ? void 0 : _a.json : undefined;
        return type === null || type === void 0 ? void 0 : type.substring(1, type.length - 1);
    }
    static sendToSocket(socket, params, event) {
        socket.emit(event, ...params);
    }
    static removeExtensionFromFileName(file) {
        return file.split('.').slice(0, -1).join('.');
    }
}
exports.utlis = utlis;
//# sourceMappingURL=utils.js.map