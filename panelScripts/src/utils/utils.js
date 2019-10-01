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
Object.defineProperty(exports, "__esModule", { value: true });
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
        try {
            for (var map_1 = __values(map), map_1_1 = map_1.next(); !map_1_1.done; map_1_1 = map_1.next()) {
                var _a = __read(map_1_1.value, 2), key = _a[0], value = _a[1];
                if (value instanceof Map) {
                    obj[key] = utlis.mapToObject(value);
                }
                else {
                    obj[key] = value;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (map_1_1 && !map_1_1.done && (_b = map_1.return)) _b.call(map_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return obj;
        var e_1, _b;
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
    return utlis;
}());
exports.utlis = utlis;
//# sourceMappingURL=utils.js.map