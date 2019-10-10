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
var utlis = /** @class */ (function () {
    function utlis() {
    }
    utlis.isKeyExists = function (searchArray, key) {
        return ~searchArray.indexOf(key);
    };
    utlis.isIDExists = function (id, idArray) {
        return idArray.find(function (item) {
            if (item.id === id) {
                return true;
            }
        });
    };
    ;
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
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return map;
        var e_1, _c;
    };
    utlis.traverseObject = function (arrayLayers, callback) {
        var noOfLayers = arrayLayers.length;
        for (var i = 0; i < noOfLayers; i++) {
            if (arrayLayers[i].type === "layer") {
                callback(arrayLayers[i]);
            }
            if (arrayLayers[i].type === "layerSection") {
                if (arrayLayers[i].layers) {
                    utlis.traverseObject(arrayLayers[i].layers, callback);
                }
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
    utlis.handleModelData = function (eventLayers, drawnQuestItems, viewElementalMap) {
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
                    if (!viewItems.hasOwnProperty(itemV)) {
                        continue;
                    }
                    utlis.handleView(viewItems, itemV, eventLayers, drawnQuestItems);
                }
            }
        }
    };
    utlis.handleView = function (viewItems, itemV, eventLayers, drawnQuestItems) {
        var viewItem = viewItems[itemV];
        if (viewItem instanceof Array) {
            viewItem.forEach(function (item, index) {
                var itemRef = utlis.isIDExists(item.id, eventLayers);
                if (itemRef) {
                    viewItem.splice(index, 1);
                    utlis.spliceFrom(item.id, drawnQuestItems);
                }
            });
        }
        else {
            var itemRef = utlis.isIDExists(viewItem.id, eventLayers);
            if (itemRef) {
                delete viewItems[itemV];
                utlis.spliceFrom(itemV.id, drawnQuestItems);
            }
        }
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
    utlis.getElementView = function (element, activeDocumentLayers) {
        var layers = activeDocumentLayers;
        var elementRef = layers.findLayer(element.id);
        return utlis.getView(elementRef);
    };
    utlis.getView = function (elementRef) {
        if ((elementRef.layer)) {
            return utlis.getView(elementRef.layer.group);
        }
        if (elementRef.group.name === "common") {
            return elementRef.name;
        }
        else if (elementRef.group) {
            return utlis.getView(elementRef.group);
        }
    };
    return utlis;
}());
exports.utlis = utlis;
//# sourceMappingURL=utils.js.map