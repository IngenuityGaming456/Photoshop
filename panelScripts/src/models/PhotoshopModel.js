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
var path = require("path");
var fs = require("fs");
var PhotoshopModel = /** @class */ (function () {
    function PhotoshopModel() {
        this.baseMenuIds = [];
        this.elementalMap = new Map();
        this.questComponents = ["button", "image", "label", "meter", "animation", "shape", "container", "slider"];
    }
    PhotoshopModel.prototype.handleSocketStorage = function (socketStorage) {
        ///Thinking what to do.
    };
    PhotoshopModel.prototype.createStorage = function () {
        var _this = this;
        var folderPath = path.join(__dirname, "viewRes");
        fs.readdirSync(folderPath).forEach(function (fileName) {
            var jsonObject = require(folderPath + "/" + fileName);
            _this.viewObjStorage.push(jsonObject);
        });
    };
    PhotoshopModel.prototype.createElementalViewStructure = function () {
        var _this = this;
        this.viewObjStorage.forEach(function (item) {
            _this.createElementalView(item, null);
        });
    };
    PhotoshopModel.prototype.createElementalView = function (viewObj, parent) {
        for (var key in viewObj) {
            if (viewObj.hasOwnProperty(key)) {
                if (!viewObj[key].type) {
                    this.elementalMap.set(key, this.elementObj);
                    this.createElementalView(viewObj[key], key);
                }
                else {
                    this.elementalMap.get(parent)[viewObj[key].type].push(key);
                }
            }
        }
    };
    PhotoshopModel.prototype.makeElementalObject = function () {
        try {
            for (var _a = __values(this.questComponents), _b = _a.next(); !_b.done; _b = _a.next()) {
                var item = _b.value;
                this.elementalObj[item] = [];
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var e_1, _c;
    };
    Object.defineProperty(PhotoshopModel.prototype, "elementObj", {
        get: function () {
            return Object.assign({}, this.elementalObj);
        },
        enumerable: true,
        configurable: true
    });
    PhotoshopModel.prototype.getBaseMenuIds = function (id, key) {
        this.baseMenuIds.push({
            id: id,
            name: key
        });
    };
    Object.defineProperty(PhotoshopModel.prototype, "menuIds", {
        get: function () {
            return this.baseMenuIds;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoshopModel.prototype, "viewStorage", {
        get: function () {
            return this.viewObjStorage;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoshopModel.prototype, "viewElementalMap", {
        get: function () {
            return this.elementalMap;
        },
        enumerable: true,
        configurable: true
    });
    PhotoshopModel.prototype.setViewElementalMap = function (parent, key, type) {
        this.elementalMap.get(parent)[type].push(key);
    };
    PhotoshopModel.prototype.execute = function (params) {
        this.createStorage();
        this.makeElementalObject();
        this.createElementalViewStructure();
    };
    return PhotoshopModel;
}());
exports.PhotoshopModel = PhotoshopModel;
//# sourceMappingURL=PhotoshopModel.js.map