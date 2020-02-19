"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var constants_1 = require("../constants");
var utlis = /** @class */ (function () {
    function utlis() {
    }
    utlis.isKeyExists = function (searchArray, key) {
        return ~searchArray.indexOf(key);
    };
    utlis.isIDExistsRec = function (id, idArray) {
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
        var e_1, _a;
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
        if (!obj) {
            return null;
        }
        var map = new Map();
        try {
            for (var _a = __values(Object.keys(obj)), _b = _a.next(); !_b.done; _b = _a.next()) {
                var key = _b.value;
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
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return map;
        var e_2, _c;
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
        try {
            for (var _a = __values(platformRef.layers), _b = _a.next(); !_b.done; _b = _a.next()) {
                var layer = _b.value;
                if (layer.name === constants_1.photoshopConstants.common) {
                    return layer.id;
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_3) throw e_3.error; }
        }
        var e_3, _c;
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
        var layerRefLayers = layerRef.layer.layers;
        try {
            for (var layerRefLayers_1 = __values(layerRefLayers), layerRefLayers_1_1 = layerRefLayers_1.next(); !layerRefLayers_1_1.done; layerRefLayers_1_1 = layerRefLayers_1.next()) {
                var item = layerRefLayers_1_1.value;
                if (item.id !== idKey) {
                    return true;
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (layerRefLayers_1_1 && !layerRefLayers_1_1.done && (_a = layerRefLayers_1.return)) _a.call(layerRefLayers_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return false;
        var e_4, _a;
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
        var viewLayers = commonRef.layer.layers;
        try {
            for (var viewLayers_1 = __values(viewLayers), viewLayers_1_1 = viewLayers_1.next(); !viewLayers_1_1.done; viewLayers_1_1 = viewLayers_1.next()) {
                var item = viewLayers_1_1.value;
                if (item.name === viewName) {
                    return item.id;
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (viewLayers_1_1 && !viewLayers_1_1.done && (_a = viewLayers_1.return)) _a.call(viewLayers_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return null;
        var e_5, _a;
    };
    utlis.getPlatformRef = function (platform, activeDocument) {
        var activeLayers = activeDocument.layers.layers;
        try {
            for (var activeLayers_1 = __values(activeLayers), activeLayers_1_1 = activeLayers_1.next(); !activeLayers_1_1.done; activeLayers_1_1 = activeLayers_1.next()) {
                var layer = activeLayers_1_1.value;
                if (layer.name === platform) {
                    return layer;
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (activeLayers_1_1 && !activeLayers_1_1.done && (_a = activeLayers_1.return)) _a.call(activeLayers_1);
            }
            finally { if (e_6) throw e_6.error; }
        }
        var e_6, _a;
    };
    utlis.hasKey = function (keyArray, key) {
        try {
            for (var keyArray_1 = __values(keyArray), keyArray_1_1 = keyArray_1.next(); !keyArray_1_1.done; keyArray_1_1 = keyArray_1.next()) {
                var item = keyArray_1_1.value;
                if (item.hasOwnProperty(key)) {
                    return item;
                }
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (keyArray_1_1 && !keyArray_1_1.done && (_a = keyArray_1.return)) _a.call(keyArray_1);
            }
            finally { if (e_7) throw e_7.error; }
        }
        return null;
        var e_7, _a;
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
    return utlis;
}());
exports.utlis = utlis;
//# sourceMappingURL=utils.js.map