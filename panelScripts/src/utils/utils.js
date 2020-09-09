"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.utlis = void 0;
var fs = require("fs");
var path = require("path");
var constants_1 = require("../constants");
var JsonComponentsFactory_1 = require("../modules/JsonComponentsFactory");
var utlis = /** @class */ (function () {
    function utlis() {
    }
    utlis.isKeyExists = function (searchArray, key) {
        return ~searchArray.indexOf(key);
    };
    utlis.isIDExistsRec = function (id, idArray) {
        var e_1, _a;
        var itemRef = idArray.find(function (item) {
            if (item.id === Number(id)) {
                return true;
            }
        });
        if (itemRef) {
            return itemRef;
        }
        try {
            for (var idArray_1 = __values(idArray), idArray_1_1 = idArray_1.next(); !idArray_1_1.done; idArray_1_1 = idArray_1.next()) {
                var item = idArray_1_1.value;
                if (item.layers) {
                    var itemRefRec = utlis.isIDExistsRec(id, item.layers);
                    if (itemRefRec) {
                        return itemRefRec;
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (idArray_1_1 && !idArray_1_1.done && (_a = idArray_1.return)) _a.call(idArray_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    };
    utlis.isIDExists = function (id, idArray) {
        return idArray.find(function (item) {
            if (item.id === id) {
                return true;
            }
        });
    };
    ;
    utlis.isNameExists = function (name, keyArray) {
        return keyArray.find(function (item) {
            if (item.name === name) {
                return true;
            }
        });
    };
    utlis.getConsecutiveIndexes = function (itemArray, index) {
        var itemLength = itemArray.length;
        var nextIndex = index + 1;
        var nextToNextIndex = index + 2;
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
    };
    utlis.mapToObject = function (map) {
        if (!map) {
            return null;
        }
        var obj = {};
        map.forEach(function (value, key) {
            if (value instanceof Map) {
                obj[key] = utlis.mapToObject(value);
            }
            else {
                obj[key] = value;
            }
        });
        return obj;
    };
    utlis.objectToMap = function (obj) {
        var e_2, _a;
        if (!obj) {
            return null;
        }
        var map = new Map();
        try {
            for (var _b = __values(Object.keys(obj)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                if (obj[key] instanceof Object) {
                    map.set(key, utlis.objectToMap(obj[key]));
                }
                else {
                    map.set(key, obj[key]);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return map;
    };
    utlis.traverseObject = function (arrayLayers, callback, callbackLayers) {
        var noOfLayers = arrayLayers.length;
        for (var i = 0; i < noOfLayers; i++) {
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
    };
    utlis.traverseBaseFreeGame = function (arrayLayers, callback) {
        var noOfLayers = arrayLayers.length;
        for (var i = 0; i < noOfLayers; i++) {
            if (arrayLayers[i].name === constants_1.photoshopConstants.views.baseGame || arrayLayers[i].name === constants_1.photoshopConstants.views.freeGame) {
                callback(arrayLayers[i]);
            }
            else if (arrayLayers[i].layers) {
                utlis.traverseBaseFreeGame(arrayLayers[i].layers, callback);
            }
        }
    };
    utlis.removeFile = function (fileName) {
        var stats = fs.lstatSync(fileName);
        if (stats.isDirectory()) {
            fs.readdirSync(fileName).forEach(function (file) {
                utlis.removeFile(fileName + "/" + file);
            });
        }
        else {
            if (path.basename(fileName) === "Image.png") {
                fs.unlink(fileName, function (err) {
                    if (err) {
                        console.log("unable to remove file");
                    }
                    else {
                        console.log("done");
                    }
                });
            }
        }
    };
    utlis.handleModelData = function (eventLayers, drawnQuestItems, viewElementalMap, sessionHandler) {
        for (var platform in viewElementalMap) {
            if (!viewElementalMap.hasOwnProperty(platform)) {
                continue;
            }
            var platformMap = viewElementalMap[platform];
            for (var view in platformMap) {
                if (!platformMap.hasOwnProperty(view)) {
                    continue;
                }
                var viewItems = platformMap[view];
                for (var itemV in viewItems) {
                    var deletionObj = {};
                    if (!viewItems.hasOwnProperty(itemV)) {
                        continue;
                    }
                    utlis.setDeletionObj(platform, view, deletionObj);
                    utlis.handleView(viewItems, itemV, eventLayers, drawnQuestItems, deletionObj, sessionHandler);
                }
            }
        }
    };
    utlis.setDeletionObj = function (platform, baseView, deletionObj) {
        deletionObj["platform"] = platform;
        deletionObj["view"] = baseView;
    };
    utlis.setSubDeletionObj = function (id, name, type, deletionObj, sessionHandler) {
        deletionObj[name] = {};
        deletionObj[name]["name"] = name;
        deletionObj[name]["id"] = id;
        deletionObj[name]["type"] = type;
        sessionHandler.push(deletionObj);
    };
    utlis.handleView = function (viewItems, itemV, eventLayers, drawnQuestItems, deletionObj, sessionHandler) {
        var viewItem = viewItems[itemV];
        var indexes = [];
        if (viewItem instanceof Array) {
            viewItem.forEach(function (item, index) {
                var itemRef = utlis.isIDExists(item.id, eventLayers);
                if (itemRef) {
                    indexes.push(index);
                    utlis.spliceFrom(item.id, drawnQuestItems);
                    utlis.setSubDeletionObj(item.id, item.name, itemV, deletionObj, sessionHandler);
                }
            });
            utlis.spliceFromIndexes(viewItem, indexes);
        }
        else {
            var itemRef = utlis.isIDExists(viewItem.id, eventLayers);
            if (itemRef) {
                utlis.spliceFrom(viewItem.id, drawnQuestItems);
                utlis.setSubDeletionObj(viewItem.id, viewItem.name, itemV, deletionObj, sessionHandler);
                delete viewItems[itemV];
            }
        }
    };
    utlis.getElementPlatform = function (element, activeLayers) {
        var activeDocumentLayers = activeLayers;
        var insertionRef = activeDocumentLayers.findLayer(element.id);
        return utlis.getElementName(insertionRef, null);
    };
    utlis.spliceFrom = function (id, array) {
        var ref = utlis.isIDExists(id, array);
        if (ref) {
            var indexOf = array.indexOf(ref);
            if (indexOf > -1) {
                array.splice(indexOf, 1);
            }
        }
    };
    utlis.getCommonId = function (platformRef) {
        var e_3, _a;
        try {
            for (var _b = __values(platformRef.layers), _c = _b.next(); !_c.done; _c = _b.next()) {
                var layer = _c.value;
                if (layer.name === constants_1.photoshopConstants.common) {
                    return layer.id;
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    utlis.getElementView = function (element, activeDocumentLayers) {
        var layers = activeDocumentLayers;
        var elementRef = layers.findLayer(element.id);
        return utlis.getElementName(elementRef, "common");
    };
    utlis.getElementName = function (elementRef, keyName) {
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
    };
    utlis.spliceFromIndexes = function (arr, indexArr) {
        var indexLength = indexArr.length;
        for (var i = 0; i < indexLength; i++) {
            arr.splice(indexArr[i], 1);
            for (var j = i + 1; j < indexLength; j++) {
                indexArr[j]--;
            }
        }
    };
    utlis.makeDir = function (path) {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
    };
    utlis.traverseAddedLayers = function (addedLayers, callback) {
        addedLayers.forEach(function (item) {
            if (item.added) {
                callback(item);
            }
            if (item.layers) {
                utlis.traverseAddedLayers(item.layers, callback);
            }
        });
    };
    utlis.getFirstAddedItem = function (addedLayers, callback) {
        var e_4, _a;
        try {
            for (var addedLayers_1 = __values(addedLayers), addedLayers_1_1 = addedLayers_1.next(); !addedLayers_1_1.done; addedLayers_1_1 = addedLayers_1.next()) {
                var item = addedLayers_1_1.value;
                if (item.added) {
                    callback(item);
                    return;
                }
                else if (item.layers) {
                    utlis.getFirstAddedItem(item.layers, callback);
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (addedLayers_1_1 && !addedLayers_1_1.done && (_a = addedLayers_1.return)) _a.call(addedLayers_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    utlis.getAllLayersAtLevel = function (arrayLayers, level) {
        var levelArray = arrayLayers;
        var cumLevelArray = [];
        levelArray.forEach(function (item) {
            cumLevelArray.push([item]);
        });
        return utlis.getLayersAtLevel(cumLevelArray, level);
    };
    utlis.getLayersAtLevel = function (cumLevelArray, level) {
        if (level <= -1) {
            return cumLevelArray;
        }
        var allLayers = [];
        cumLevelArray.forEach(function (item) {
            var layerArray = [];
            item.forEach(function (itemSub) {
                itemSub.layers && itemSub.layers.forEach(function (layer) {
                    layerArray.push(layer);
                });
            });
            allLayers.push(layerArray);
        });
        return utlis.getLayersAtLevel(allLayers, --level);
    };
    utlis.getNextAvailableIndex = function (queryObject, index) {
        if (!queryObject.hasOwnProperty(index)) {
            return index;
        }
        return utlis.getNextAvailableIndex(queryObject, ++index);
    };
    utlis.addKeyToObject = function (queryObj, key) {
        if (!queryObj.hasOwnProperty(key)) {
            queryObj[key] = {};
        }
    };
    utlis.containAll = function (array1, array2) {
        var delocalisedLayers = [];
        var compareMap2 = new Map();
        var arrayLength2 = array2.length;
        for (var i = 0; i < arrayLength2; i++) {
            if (!compareMap2.get(array2[i])) {
                compareMap2.set(array2[i], 1);
            }
            else {
                var value = compareMap2.get(array2[i]);
                compareMap2.set(array2[i], ++value);
            }
        }
        var arrayLength1 = array1.length;
        for (var i = 0; i < arrayLength1; i++) {
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
    };
    utlis.isLayerExists = function (layerRef, idKey) {
        var e_5, _a;
        var layerRefLayers = layerRef.layer.layers;
        try {
            for (var layerRefLayers_1 = __values(layerRefLayers), layerRefLayers_1_1 = layerRefLayers_1.next(); !layerRefLayers_1_1.done; layerRefLayers_1_1 = layerRefLayers_1.next()) {
                var item = layerRefLayers_1_1.value;
                if (item.id !== idKey) {
                    return true;
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (layerRefLayers_1_1 && !layerRefLayers_1_1.done && (_a = layerRefLayers_1.return)) _a.call(layerRefLayers_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return false;
    };
    utlis.putComponentInGeneratorSettings = function (item, pluginId, component) {
        if (item.hasOwnProperty("generatorSettings") && item["generatorSettings"] === false) {
            item["generatorSettings"] = {};
        }
        utlis.addKeyToObject(item, "generatorSettings");
        utlis.addKeyToObject(item["generatorSettings"], pluginId);
        item["generatorSettings"][pluginId]["json"] = component;
    };
    utlis.getParsedEvent = function (pathArray, layers) {
        var eventLayers = [];
        pathArray.forEach(function (item, index) {
            if (index === 0) {
                eventLayers.push(layers[item[0]]);
            }
            else {
                var layerStructure = utlis.getLayersStructureAtLevel(index, 0, eventLayers);
                utlis.spliceAllButItem(layerStructure, item);
            }
        });
        return eventLayers;
    };
    utlis.getLayersStructureAtLevel = function (index, level, eventLayers) {
        if (index === level) {
            return eventLayers;
        }
        return utlis.getLayersStructureAtLevel(index, ++level, eventLayers[0].layers);
    };
    utlis.spliceAllButItem = function (spliceArray, itemArray) {
        for (var i = 0; i < spliceArray.length; i++) {
            if (!(~itemArray.indexOf(i))) {
                spliceArray.splice(i, 1);
                itemArray.forEach(function (item, index) {
                    if (item > 0) {
                        itemArray[index] = --item;
                    }
                });
                i--;
            }
        }
    };
    utlis.getView = function (commonRef, viewName) {
        var e_6, _a;
        var viewLayers = commonRef.layer.layers;
        try {
            for (var viewLayers_1 = __values(viewLayers), viewLayers_1_1 = viewLayers_1.next(); !viewLayers_1_1.done; viewLayers_1_1 = viewLayers_1.next()) {
                var item = viewLayers_1_1.value;
                if (item.name === viewName) {
                    return item.id;
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (viewLayers_1_1 && !viewLayers_1_1.done && (_a = viewLayers_1.return)) _a.call(viewLayers_1);
            }
            finally { if (e_6) throw e_6.error; }
        }
        return null;
    };
    utlis.getPlatformRef = function (platform, activeDocument) {
        var e_7, _a;
        var activeLayers = activeDocument.layers.layers;
        try {
            for (var activeLayers_1 = __values(activeLayers), activeLayers_1_1 = activeLayers_1.next(); !activeLayers_1_1.done; activeLayers_1_1 = activeLayers_1.next()) {
                var layer = activeLayers_1_1.value;
                if (layer.name === platform) {
                    return layer;
                }
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (activeLayers_1_1 && !activeLayers_1_1.done && (_a = activeLayers_1.return)) _a.call(activeLayers_1);
            }
            finally { if (e_7) throw e_7.error; }
        }
    };
    utlis.hasKey = function (keyArray, key) {
        var e_8, _a;
        try {
            for (var keyArray_1 = __values(keyArray), keyArray_1_1 = keyArray_1.next(); !keyArray_1_1.done; keyArray_1_1 = keyArray_1.next()) {
                var item = keyArray_1_1.value;
                if (item.hasOwnProperty(key)) {
                    return item;
                }
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (keyArray_1_1 && !keyArray_1_1.done && (_a = keyArray_1.return)) _a.call(keyArray_1);
            }
            finally { if (e_8) throw e_8.error; }
        }
        return null;
    };
    utlis.breakArrayOnTrue = function (breakArray) {
        var splitIndexes = [];
        for (var i = 0; i < breakArray.length; i++) {
            if (breakArray[i] === true && breakArray[i + 1] !== true && breakArray[i + 2] !== true) {
                splitIndexes.push(i);
            }
        }
        splitIndexes.unshift(0);
        var breakArrays = [];
        splitIndexes.forEach(function (splitIndex, index) {
            if (splitIndexes[index + 1]) {
                breakArrays.push(breakArray.slice(splitIndexes[index] + Math.ceil(index / 100000), splitIndexes[index + 1] + 1));
            }
        });
        return breakArrays;
    };
    utlis.isNotContainer = function (item, activeDocument, resultLayers, pluginId) {
        if (!item) {
            return true;
        }
        var itemRef = activeDocument.layers.findLayer(item.id);
        var itemRefResult = utlis.findLayerInResult(item.id, resultLayers);
        if (itemRefResult && itemRefResult.generatorSettings && itemRefResult.generatorSettings[pluginId]) {
            var genSettings_1 = itemRefResult.generatorSettings[pluginId].json;
            var jsonMap = JsonComponentsFactory_1.JsonComponentsFactory.makeJsonComponentsMap();
            var keysArray = __spread(jsonMap.keys(), ["payline", "winframe", "symbol"]);
            return keysArray.some(function (type) {
                return !!(~genSettings_1.search(type));
            });
        }
        return utlis.isNotContainer(itemRef.layer.group, activeDocument, resultLayers, pluginId);
    };
    utlis.findLayerInResult = function (id, resultLayers) {
        var e_9, _a;
        try {
            for (var resultLayers_1 = __values(resultLayers), resultLayers_1_1 = resultLayers_1.next(); !resultLayers_1_1.done; resultLayers_1_1 = resultLayers_1.next()) {
                var item = resultLayers_1_1.value;
                if (item.id === id) {
                    return item;
                }
                if (item.layers) {
                    var returnValue = utlis.findLayerInResult(id, item.layers);
                    if (returnValue) {
                        return returnValue;
                    }
                }
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (resultLayers_1_1 && !resultLayers_1_1.done && (_a = resultLayers_1.return)) _a.call(resultLayers_1);
            }
            finally { if (e_9) throw e_9.error; }
        }
        return null;
    };
    utlis.isButton = function (array1, array2) {
        if (array1.length !== array2.length) {
            return false;
        }
        var arrayLength = array1.length;
        for (var i = 0; i < arrayLength; i++) {
            if (i !== arrayLength - 1 && array1[i] !== array2[i]) {
                return false;
            }
        }
        return true;
    };
    utlis.makeResponse = function (responseArray) {
        var responseSubArray = [];
        responseArray.forEach(function (item) {
            var multiples = item.split(",");
            var multipleArray = [];
            multiples.forEach(function (subItem) {
                multipleArray.push(subItem);
            });
            responseSubArray.push(multipleArray);
        });
        return responseSubArray;
    };
    utlis.findParent = function (layer, activeDocument) {
        var layerRef = activeDocument.layers.findLayer(layer.id);
        if (layerRef.layer) {
            return layerRef.layer.group.name;
        }
    };
    utlis.findView = function (layer, activeDocument) {
        var layerRef = activeDocument.layers.findLayer(layer.id);
        return utlis.recurView(layerRef);
    };
    utlis.findPlatform = function (layer, activeDocument) {
        var layerRef = activeDocument.layers.findLayer(layer.id);
        return utlis.recurPlatform(layerRef);
    };
    utlis.recurView = function (layerRef) {
        if (layerRef.layer && layerRef.layer.group.name === "common") {
            return layerRef.layer.name;
        }
        else if (layerRef.group && layerRef.group.name === "common") {
            return layerRef.name;
        }
        else if (layerRef.layer) {
            return utlis.recurView(layerRef.layer.group);
        }
        else {
            return utlis.recurView(layerRef.group);
        }
    };
    utlis.recurPlatform = function (layerRef) {
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
    };
    utlis.renameElementalMap = function (elementalMap, name, id) {
        for (var platform in elementalMap) {
            if (!elementalMap.hasOwnProperty(platform)) {
                continue;
            }
            var viewObj = elementalMap[platform];
            for (var view in viewObj) {
                if (!viewObj.hasOwnProperty(view) || view === "base") {
                    continue;
                }
                var elementalObj = viewObj[view];
                utlis.renameElementalObj(elementalObj, name, id);
            }
        }
    };
    utlis.renameElementalObj = function (elementalObj, name, id) {
        for (var element in elementalObj) {
            if (!elementalObj.hasOwnProperty(element)) {
                continue;
            }
            var component = elementalObj[element];
            var item = utlis.isIDExists(id, component);
            if (item) {
                item.name = name;
            }
        }
    };
    // public static getAssetsAndJson(key, activeDocument) {
    //     const savedPath = activeDocument.directory;
    //     const extIndex = activeDocument.name.search(".psd");
    //     const fileName = activeDocument.name.slice(0, extIndex);
    //     const qAssetsPath = savedPath + `\\${fileName}\\` + `${key}\\${fileName}-assets`;
    //     const qJsonPath =savedPath + `\\${fileName}\\` + `${key}\\${fileName}.json`;
    //     const qObj = JSON.parse(fs.readFileSync(qJsonPath, 'utf8'));
    //     return {
    //         qAssetsPath,
    //         qObj
    //     }
    // }
    utlis.getAssetsAndJson = function (key, activeDocument) {
        var savedPath = activeDocument.directory;
        // const extIndex = activeDocument.name.indexOf(".");
        var extIndex = activeDocument.name.search(".psd");
        var fileName = activeDocument.name.slice(0, extIndex);
        var qAssetsPath = savedPath + ("\\" + fileName + "\\") + (key + "\\" + fileName + "-assets");
        var qJsonPath = savedPath + ("\\" + fileName + "\\") + (key + "\\" + fileName + ".json");
        var sObj = fs.readFileSync(qJsonPath, "utf-8");
        var qObj = JSON.parse(sObj);
        return {
            qAssetsPath: qAssetsPath,
            qObj: qObj
        };
    };
    utlis.recurFiles = function (fileName, folderPath) {
        var e_10, _a;
        var files = fs.readdirSync(folderPath);
        try {
            for (var files_1 = __values(files), files_1_1 = files_1.next(); !files_1_1.done; files_1_1 = files_1.next()) {
                var file = files_1_1.value;
                var filePath = path.join(folderPath, file);
                var stats = fs.statSync(filePath);
                if (stats.isDirectory()) {
                    return utlis.recurFiles(fileName, filePath);
                }
                var fileExtIndex = file.search(".png");
                var fileExt = void 0;
                if (fileExtIndex > -1) {
                    fileExt = file.slice(0, fileExtIndex);
                }
                if (fileExt === fileName) {
                    return filePath;
                }
            }
        }
        catch (e_10_1) { e_10 = { error: e_10_1 }; }
        finally {
            try {
                if (files_1_1 && !files_1_1.done && (_a = files_1.return)) _a.call(files_1);
            }
            finally { if (e_10) throw e_10.error; }
        }
    };
    return utlis;
}());
exports.utlis = utlis;
//# sourceMappingURL=utils.js.map