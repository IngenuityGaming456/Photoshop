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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoDataPhotoshopModel = void 0;
var menuLabels = require("../../res/menuLables");
var constants_1 = require("../../constants");
var NoDataPhotoshopModel = /** @class */ (function () {
    function NoDataPhotoshopModel() {
        this.questComponents = ["button", "image", "label", "meter", "animation", "shape", "container", "slider"];
        this.viewDeletion = {};
    }
    NoDataPhotoshopModel.prototype.execute = function (params) {
        this.viewObjStorage = params.storage.viewObjStorage;
        this.questPlatforms = params.storage.questPlatforms;
    };
    NoDataPhotoshopModel.prototype.createElementData = function () {
        this.makeElementalObject();
        return this.createElementalViewStructure();
    };
    NoDataPhotoshopModel.prototype.createPlatformDeletion = function () {
        return { desktop: false, portrait: false, landscape: false };
    };
    NoDataPhotoshopModel.prototype.createViewDeletionObj = function () {
        var _this = this;
        this.questPlatforms.forEach(function (platformKey) {
            _this.viewDeletion[platformKey] = {};
            for (var menu in menuLabels) {
                if (!menuLabels.hasOwnProperty(menu)) {
                    continue;
                }
                if (menuLabels[menu].menuGroup === constants_1.photoshopConstants.menu.menuView) {
                    _this.viewDeletion[platformKey][menuLabels[menu].label] = null;
                }
            }
        });
        return this.viewDeletion;
    };
    NoDataPhotoshopModel.prototype.accessMenuState = function () {
        return [];
    };
    NoDataPhotoshopModel.prototype.accessCurrentState = function () {
        return null;
    };
    NoDataPhotoshopModel.prototype.accessContainerResponse = function () {
        return null;
    };
    NoDataPhotoshopModel.prototype.accessDrawnQuestItems = function () {
        return [];
    };
    NoDataPhotoshopModel.prototype.accessDocLocalisationStruct = function () {
        return null;
    };
    NoDataPhotoshopModel.prototype.makeElementalObject = function () {
        var e_1, _a;
        var elementalObj = {};
        try {
            for (var _b = __values(this.questComponents), _c = _b.next(); !_c.done; _c = _b.next()) {
                var item = _c.value;
                elementalObj[item] = [];
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return elementalObj;
    };
    NoDataPhotoshopModel.prototype.createElementalViewStructure = function () {
        var _this = this;
        var elementalMap = {};
        this.questPlatforms.forEach(function (item) {
            elementalMap[item] = _this.createElementalView();
        });
        return elementalMap;
    };
    NoDataPhotoshopModel.prototype.createElementalView = function () {
        var _this = this;
        var elementalViewMap = {};
        this.viewObjStorage.forEach(function (viewObj) {
            for (var key in viewObj) {
                if (!viewObj.hasOwnProperty(key)) {
                    continue;
                }
                if (!viewObj[key].type) {
                    elementalViewMap[key] = _this.makeElementalObject();
                }
            }
        });
        return elementalViewMap;
    };
    return NoDataPhotoshopModel;
}());
exports.NoDataPhotoshopModel = NoDataPhotoshopModel;
//# sourceMappingURL=NoDataPhotoshopModel.js.map