import * as fs from "fs";
import * as path from "path";
import * as layerClass from "../../lib/dom/layer";
import {photoshopConstants as pc} from "../constants";
import {JsonComponentsFactory} from "../modules/JsonComponentsFactory";
import * as fsx from "fs-extra";
import {verify} from "crypto";

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
            if(item === name) {
                return true;
            }
        });
    }

    public static pushUniqueToArray(arr, val) {
        if(!~arr.indexOf(val)) {
            arr.push(val);
        }
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

    public static handleModelData(eventLayers, drawnQuestItems, viewElementalMap, questViews, sessionHandler, generator) {
        for (let platform in viewElementalMap) {
            if (!viewElementalMap.hasOwnProperty(platform) || !(viewElementalMap[platform] instanceof Object)) {
                continue;
            }
            const platformMap = viewElementalMap[platform];
            for (let view in platformMap) {
                if (!platformMap.hasOwnProperty(view) || !(platformMap[view] instanceof Object)) {
                    continue;
                }
                if("base" in platformMap[view]) {
                    const itemRef = utlis.isIDExists(platformMap[view].base.id, eventLayers);
                    if(itemRef && !~questViews.indexOf(view)) {
                        utlis.deleteAllLinkedViews(pc.platformArray, view, viewElementalMap, generator);
                        continue;
                    }
                }
                const viewItems = platformMap[view];
                for (let itemV in viewItems) {
                    const deletionObj = {};
                    if (!viewItems.hasOwnProperty(itemV) || !(viewItems[itemV] instanceof Object)) {
                        continue;
                    }
                    utlis.setDeletionObj(platform, view, deletionObj);
                    utlis.handleView(viewItems, itemV, eventLayers, drawnQuestItems, deletionObj, sessionHandler);
                }
            }
        }
    }

    public static deleteAllLinkedViews(platformArray, viewKey, elementalMap, generator) {
        platformArray.forEach(plat => {
            //Not using await as all this is the backend data
            try {
                generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), {id: elementalMap[plat][viewKey]["base"]?.id});
            } catch(err) {
                console.log("No such layer found , ", err);
            }
            delete elementalMap[plat][viewKey];
        })
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

    public static getFirstAddedItem(addedLayers, callback) {
        for(let item of addedLayers) {
            if (item.added) {
                callback(item);
                return;
            } else if (item.layers) {
                utlis.getFirstAddedItem(item.layers, callback);
            }
        }
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

    public static getLastParentAndChildLayers(layers) {
        const resultObj = {"parent": undefined, child: []};
        utlis.getLastParentAndChildLayersObj(layers, resultObj);
        return resultObj;
    }

    private static getLastParentAndChildLayersObj(layers, resultObj) {
        for(const item of layers) {
            if(item.layers) {
                for(const subLayers of item.layers) {
                    if(!subLayers.layers) {
                        resultObj["parent"] = item;
                        resultObj["child"] = item.layers;
                        return;
                    }
                }
                return utlis.getLastParentAndChildLayersObj(item.layers, resultObj);
            }
        }
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

    public static addArrayKeyToObject(queryObj, key) {
        if(!queryObj.hasOwnProperty(key)) {
            queryObj[key] = [];
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

    public static getParsedEvent(pathArray, layers, indexObj, subLevel, eventLayers?) {
        eventLayers = eventLayers ?? [];
        if(indexObj.index >= pathArray.length) {
            return;
        }
        const subArr = pathArray[indexObj.index]
        const subArrLength = subArr.length;
        if((indexObj.index === 0 && !(~subArr.indexOf(-1)) || (subArrLength > 1 && subArr[1] !== -1))) {
            let j=0;
            for(let i=subArrLength-1;i>=0;i--) {
                eventLayers.push(layers[i]);
                indexObj.index += 1;
                utlis.getParsedEvent(pathArray, layers, indexObj,j, eventLayers);
                j++;
            }
        } else {
            if(subLevel === null) {
                return layers;
            }
            const layerStructure = utlis.getLayersStructureAtLevel(subLevel, eventLayers);
            utlis.spliceAllButItem(layerStructure, subArr);
            if(subArr.length === 1) {
                indexObj.index += 1;
                subLevel = subArr[0];
                utlis.getParsedEvent(pathArray, layers, indexObj, subLevel, layerStructure);
            }
        }
        return eventLayers;
    }

    public static getLayersStructureAtLevel(subLevel, eventLayers) {
        return eventLayers[subLevel].layers;
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

    public static isButton(array1, array2) {
        if (array1.length !== array2.length) {
            return false;
        }
        const arrayLength = array1.length;
        for(let i=0;i<arrayLength;i++) {
            if(i !== arrayLength-1 && array1[i] !== array2[i]) {
                return false;
            }
        }
        return true;
    }

    public static makeResponse(responseArray) {
        const responseSubArray = [];
        responseArray.forEach(item => {
            const multiples = item.split(",");
            const multipleArray = [];
            multiples.forEach(subItem => {
                multipleArray.push(subItem)
            });
            responseSubArray.push(multipleArray);
        });
        return responseSubArray;
    }

    public static findParent(layer, activeDocument) {
        const layerRef = activeDocument.layers.findLayer(layer.id);
        if(layerRef.layer) {
            return layerRef.layer.group.name;
        }
    }

    public static findView(layer, activeDocument, key) {
        const layerRef = activeDocument.layers.findLayer(layer.id);
        return utlis.recurView(layerRef, key);
    }

    public static findPlatform(layer, activeDocument) {
        const layerRef = activeDocument.layers.findLayer(layer.id);
        return utlis.recurPlatform(layerRef);
    }

    private static recurView(layerRef, key) {
        if(layerRef.layer && layerRef.layer.group.name === key) {
            return layerRef.layer.name;
        } else if(layerRef.group && layerRef.group.name === key) {
            return layerRef.name;
        } else if(layerRef.layer) {
            return utlis.recurView(layerRef.layer.group, key)
        } else {
            return utlis.recurView(layerRef.group, key);
        }
    }

    private static recurPlatform(layerRef) {
        if(layerRef.layer && layerRef.layer.group.name === "common") {
            return layerRef.layer.group.group.name;
        } else if(layerRef.group && layerRef.group.name === "common") {
            return layerRef.group.group.name;
        } else if(layerRef.layer) {
            return utlis.recurPlatform(layerRef.layer.group)
        } else {
            return utlis.recurPlatform(layerRef.group);
        }
    }

    public static renameElementalMap(elementalMap, name, id, generator) {
        for(let platform in elementalMap) {
            if(!elementalMap.hasOwnProperty(platform) || !(elementalMap[platform] instanceof Object)) {
                continue;
            }
            const viewObj = elementalMap[platform];
            for(let view in viewObj) {
                if(!viewObj.hasOwnProperty(view) || !(viewObj[view] instanceof Object)) {
                    continue;
                }
                if("base" in viewObj[view] && viewObj[view]["base"].id === id) {
                    utlis.renameAllLinkedViews(pc.platformArray, view, elementalMap, name, generator);
                    continue;
                }
                const elementalObj = viewObj[view];
                utlis.renameElementalObj(elementalObj, name, id);
            }
        }
    }

    private static renameElementalObj(elementalObj, name, id) {
        for(let element in elementalObj) {
            if(!elementalObj.hasOwnProperty(element) || !(elementalObj[element] instanceof Object)) {
                continue;
            }
            const component = elementalObj[element];
            const item = component instanceof Array && utlis.isIDExists(id, component);
            if(item) {
                item.name = name;
            }
        }
    }

    private static renameAllLinkedViews(platformArray, viewKey, elementalMap, name, generator) {
        platformArray.forEach(plat => {
            // Rename handler cycle.
            if(name in elementalMap[plat]) {
                return;
            }
            try {
                generator.evaluateJSXFile(path.join(__dirname, "../../jsx/UndoRenamedLayer.jsx"), {id: elementalMap[plat][viewKey]["base"]?.id, name});
            } catch(err){
                console.log("no such view to rename , ", err);
            }
            //renaming the view key
            Object.defineProperty(elementalMap[plat], name, Object.getOwnPropertyDescriptor(elementalMap[plat], viewKey));
            delete elementalMap[plat][viewKey];
        })
    }

    public static getAssetsAndJson(key, activeDocument) {
        const savedPath = activeDocument.directory;
        // const extIndex = activeDocument.name.indexOf(".");
        const extIndex = activeDocument.name.search(".psd");
        const fileName = activeDocument.name.slice(0, extIndex);
        const qAssetsPath = savedPath + `\\${fileName}\\` + `${key}\\${fileName}-assets`;
        const qJsonPath =savedPath + `\\${fileName}\\` + `${key}\\${fileName}.json`;
        let sObj = fs.readFileSync(qJsonPath, "utf-8");
        let qObj = JSON.parse(sObj);
        return {
            qAssetsPath,
            qObj
        }
    }

    public static recurFiles(fileName, folderPath) {
        const files = fs.readdirSync(folderPath);
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const stats = fs.statSync(filePath);
            if(stats.isDirectory()) {
                return utlis.recurFiles(fileName, filePath);
            }
            // if(file.split('.').slice(0, -1).join('.') === fileName)
            const fileExtIndex = file.search(".png");
            let fileExt;
            if(fileExtIndex > -1) {
                fileExt = file.slice(0, fileExtIndex);
            }
            if(fileExt === fileName) {
                return filePath;
            }
        }
    }

    public static async copyFolder(directory, source , destination){
        try {
            await fsx.copy(path.join(directory, source.toString()), path.join(directory, destination.toString()));
            console.log("copied completed");
        } catch {
            console.log("Error in file copy");
        }
    }

    public static sendResponseToPanel(elementView, elementPlatform, elementName, startEvent, stopEvent, socket) {
        return new Promise(resolve => {
            const eventNames = socket.eventNames();
            if(~eventNames.indexOf(stopEvent)) {
                socket.removeAllListeners(stopEvent);
            }
            socket.on(stopEvent, () => resolve("done"));
            socket.emit(startEvent, elementPlatform, elementView, elementName)
        });
    }

    public static spliceFromIdArray(arr, idArr) {
        for(let id of idArr) {
            const indexOf = arr.indexOf(id);
            if (indexOf > -1) {
                arr.splice(indexOf, 1);
            }
        }
    }

    public static getGenSettings(layer, pluginId) {
        const type =  layer.generatorSettings ? layer.generatorSettings[pluginId]?.json : undefined;
        return type?.substring(1, type.length - 1);
    }

    public static sendToSocket(socket, params, event) {
        socket.emit(event, ...params);
    }

    public static removeExtensionFromFileName(file){
        return file.split('.').slice(0, -1).join('.')
    }

}