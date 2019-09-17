"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Validation = /** @class */ (function () {
    function Validation(modelFactory) {
        this.modelFactory = modelFactory;
    }
    ;
    Validation.prototype.execute = function (params) {
        this.generator = params.generator;
        this.subscribeListeners();
    };
    Validation.prototype.subscribeListeners = function () {
        var _this = this;
        this.generator.on("layersAdded", function (eventLayers) { return _this.onLayersAddition(eventLayers); });
        this.generator.on("layerRenamed", function (eventLayers) { return _this.onLayersRename(eventLayers); });
    };
    Validation.prototype.isInHTML = function (key, questArray) {
        if (~questArray.indexOf(key)) {
            throw new Error("Draw " + key + " from the HTML panel");
        }
    };
    Validation.prototype.onLayersAddition = function (eventLayers) {
        var _this = this;
        var baseIds = this.modelFactory.getPhotoshopModel().menuIds;
        var baseParent;
        eventLayers.forEach(function (item) {
            if (!baseParent) {
                baseParent = baseIds.find(function (itemB) {
                    if (itemB.id === item.id) {
                        return true;
                    }
                });
            }
            else {
                if (item.added) {
                    _this.validateIfAlreadyPresent(baseParent.name, item.name);
                }
            }
        });
    };
    Validation.prototype.validateIfAlreadyPresent = function (parent, key) {
    };
    Validation.prototype.onLayersRename = function (eventLayers) {
        var baseId = this.modelFactory.getPhotoshopModel().menuIds;
        var childId = this.modelFactory.getPhotoshopModel().childIds;
        var id;
        eventLayers.forEach(function (item) {
            id = baseId.find(function (itemB) {
                if (itemB.id === item.id) {
                    return true;
                }
            });
            if (!id) {
                id = childId.find(function (itemC) {
                    if (itemC.id === item.id) {
                        return true;
                    }
                });
            }
        });
        this.validationID(id);
    };
    Validation.prototype.validationID = function (id) {
        //Call photoshop to change the layer name;
    };
    return Validation;
}());
exports.Validation = Validation;
//# sourceMappingURL=Validation.js.map