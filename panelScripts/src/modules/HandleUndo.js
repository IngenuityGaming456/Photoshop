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
var HandleUndo = /** @class */ (function () {
    function HandleUndo(modelFactory) {
        this.sessionHandler = [];
        this.modelFactory = modelFactory;
    }
    HandleUndo.prototype.execute = function (params) {
        this.generator = params.generator;
        this.sessionHandler = this.modelFactory.getPhotoshopModel().allSessionHandler;
        this.elementalMap = this.modelFactory.getPhotoshopModel().viewElementalMap;
        this.subscribeListeners();
    };
    HandleUndo.prototype.subscribeListeners = function () {
        var _this = this;
        this.generator.on("layersAdded", function (eventLayers) { return _this.onLayersModified(eventLayers); });
        this.generator.on("layersDeleted", function (eventLayers) { return _this.onLayersModified(eventLayers); });
    };
    HandleUndo.prototype.onLayersModified = function (eventLayers) {
        try {
            for (var eventLayers_1 = __values(eventLayers), eventLayers_1_1 = eventLayers_1.next(); !eventLayers_1_1.done; eventLayers_1_1 = eventLayers_1.next()) {
                var item = eventLayers_1_1.value;
                var itemRef = this.isInModelData(item.id);
                if (itemRef) {
                    this.handleModelData(itemRef);
                }
                if (item.layers) {
                    this.onLayersModified(item.layers);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (eventLayers_1_1 && !eventLayers_1_1.done && (_a = eventLayers_1.return)) _a.call(eventLayers_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var e_1, _a;
    };
    HandleUndo.prototype.isInModelData = function (itemId) {
        var itemRef = null;
        this.sessionHandler.find(function (item) {
            for (var key in item) {
                if (!item.hasOwnProperty(key)) {
                    continue;
                }
                if (item[key].id && item[key].id === itemId) {
                    itemRef = Object.assign({}, item[key]);
                    itemRef["platform"] = item.platform;
                    itemRef["view"] = item.view;
                    return true;
                }
            }
        });
        return itemRef;
    };
    HandleUndo.prototype.handleModelData = function (itemRef) {
        this.elementalMap[itemRef.platform][itemRef.view][itemRef.type].push({
            id: itemRef.id,
            name: itemRef.name
        });
        this.modelFactory.getPhotoshopModel().setDrawnQuestItems(itemRef.id, itemRef.name);
    };
    return HandleUndo;
}());
exports.HandleUndo = HandleUndo;
//# sourceMappingURL=HandleUndo.js.map