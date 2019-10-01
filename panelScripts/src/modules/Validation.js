"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils/utils");
var path = require("path");
var Validation = /** @class */ (function () {
    function Validation(modelFactory) {
        this.modelFactory = modelFactory;
        this.layersErrorData = this.modelFactory.getPhotoshopModel().allLayersErrorData;
    }
    ;
    Validation.prototype.execute = function (params) {
        this.generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.subscribeListeners();
    };
    Validation.prototype.subscribeListeners = function () {
        var _this = this;
        this.generator.on("layersAdded", function (eventLayers) { return _this.onLayersAddition(eventLayers); });
        this.generator.on("layerRenamed", function (eventLayers) { return _this.onLayersRename(eventLayers); });
    };
    Validation.prototype.isInHTML = function (key, id, questArray) {
        if (~questArray.indexOf(key)) {
            this.layersErrorData.push({
                id: id,
                name: key
            });
            this.generator.emit("logWarning", key, id, "HTMLContainerWarning");
            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), { id: id });
        }
    };
    Validation.prototype.isAChangeToHTMLContainer = function (eventLayers, concatId) {
        var id;
        eventLayers.forEach(function (item) {
            id = utils_1.utlis.isIDExists(item.id, concatId);
            if (id) {
                return;
            }
        });
        this.validationID(id);
    };
    Validation.prototype.onLayersAddition = function (eventLayers) {
        // const elementalMap = this.modelFactory.getPhotoshopModel().viewElementalMap;
        // const allPresentItems = this.modelFactory.getPhotoshopModel().presentIds;
        // this.isAlreadyAdded(eventLayers, elementalMap, allPresentItems, undefined);
    };
    Validation.prototype.isAlreadyAdded = function (eventLayers, elementalMap, allPresentItems, baseParent) {
        var _this = this;
        eventLayers.forEach(function (item) {
            if (!baseParent) {
                baseParent = utils_1.utlis.isIDExists(item.id, allPresentItems);
            }
            else {
                if (item.added) {
                    _this.validateIfAlreadyPresent(baseParent.name, item.name, elementalMap);
                }
            }
            if (item.layers) {
                _this.isAlreadyAdded(item.layers, elementalMap, allPresentItems, baseParent);
            }
        });
    };
    Validation.prototype.validateIfAlreadyPresent = function (parentName, itemName, elementalMap) {
        var element = elementalMap.get(parentName);
    };
    Validation.prototype.onLayersRename = function (eventLayers) {
        var questArray = this.modelFactory.getPhotoshopModel().allQuestItems;
        var drawnQuestItems = this.modelFactory.getPhotoshopModel().allDrawnQuestItems;
        this.startValidationSequence(eventLayers, questArray, drawnQuestItems);
        //this.isAChangeToHTMLContainer(eventLayers, drawnQuestItems);
    };
    Validation.prototype.startValidationSequence = function (eventLayers, questArray, drawnQuestItems) {
        try {
            this.drawnQuestItemsRenamed(eventLayers[0].name, eventLayers[0].id, drawnQuestItems)
                .isInHTML(eventLayers[0].name, eventLayers[0].id, questArray);
        }
        catch (err) {
            console.log("Validation Stopped");
        }
    };
    Validation.prototype.drawnQuestItemsRenamed = function (name, id, drawnQuestItems) {
        var questItem = drawnQuestItems.find(function (item) {
            if (item.id === id && item.name !== name) {
                return true;
            }
        });
        if (questItem) {
            this.generator.emit("logWarning", questItem.name, id, "QuestElementRenamed");
            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/UndoRenamedLayer.jsx"), { id: questItem.id, name: questItem.name });
            throw new Error("Validation Stop");
        }
        return this;
    };
    Validation.prototype.validationID = function (id) {
        //Call photoshop to change the layer name;
    };
    return Validation;
}());
exports.Validation = Validation;
//# sourceMappingURL=Validation.js.map