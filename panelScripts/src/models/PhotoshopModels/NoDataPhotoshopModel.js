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
var NoDataPhotoshopModel = /** @class */ (function () {
    function NoDataPhotoshopModel() {
        this.questComponents = ["button", "image", "label", "meter", "animation", "shape", "container", "slider"];
    }
    NoDataPhotoshopModel.prototype.createElementData = function () {
        this.makeElementalObject();
        return this.createElementalViewStructure();
    };
    NoDataPhotoshopModel.prototype.execute = function (params) {
        this.viewObjStorage = params.storage.viewObjStorage;
        this.questPlatforms = params.storage.questPlatforms;
    };
    NoDataPhotoshopModel.prototype.makeElementalObject = function () {
        var elementalObj = {};
        try {
            for (var _a = __values(this.questComponents), _b = _a.next(); !_b.done; _b = _a.next()) {
                var item = _b.value;
                elementalObj[item] = [];
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return elementalObj;
        var e_1, _c;
    };
    NoDataPhotoshopModel.prototype.createElementalViewStructure = function () {
        var _this = this;
        var elementalMap = new Map();
        var elementalViewMap = new Map();
        this.questPlatforms.forEach(function (item) {
            elementalMap.set(item, _this.createElementalView());
        });
        return elementalMap;
    };
    NoDataPhotoshopModel.prototype.createElementalView = function () {
        var _this = this;
        var elementalViewMap = new Map();
        this.viewObjStorage.forEach(function (viewObj) {
            for (var key in viewObj) {
                if (!viewObj.hasOwnProperty(key)) {
                    continue;
                }
                if (!viewObj[key].type) {
                    elementalViewMap.set(key, _this.makeElementalObject());
                }
            }
        });
        return elementalViewMap;
    };
    return NoDataPhotoshopModel;
}());
exports.NoDataPhotoshopModel = NoDataPhotoshopModel;
//# sourceMappingURL=NoDataPhotoshopModel.js.map