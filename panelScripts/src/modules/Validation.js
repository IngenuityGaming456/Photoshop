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
        this.docEmitter = params.docEmitter;
        this.activeDocument = params.activeDocument;
        this.subscribeListeners();
    };
    Validation.prototype.subscribeListeners = function () {
        var _this = this;
        this.generator.on("layerRenamed", function (eventLayers) { return _this.onLayersRename(eventLayers); });
    };
    Validation.prototype.isInHTML = function (key, id, questArray, drawnQuestItems) {
        if (~questArray.indexOf(key) && !utils_1.utlis.isIDExists(id, drawnQuestItems)) {
            this.docEmitter.emit("logWarning", key, id, "HTMLContainerWarning");
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
    Validation.prototype.onLayersRename = function (eventLayers) {
        var questArray = this.modelFactory.getPhotoshopModel().allQuestItems;
        var drawnQuestItems = this.modelFactory.getPhotoshopModel().allDrawnQuestItems;
        this.startValidationSequence(eventLayers, questArray, drawnQuestItems);
        this.isErrorFree(eventLayers);
    };
    Validation.prototype.startValidationSequence = function (eventLayers, questArray, drawnQuestItems) {
        try {
            this.drawnQuestItemsRenamed(eventLayers[0].name, eventLayers[0].id, drawnQuestItems)
                .isInHTML(eventLayers[0].name, eventLayers[0].id, questArray, drawnQuestItems);
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
            this.docEmitter.emit("logWarning", questItem.name, id, "QuestElementRenamed");
            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/UndoRenamedLayer.jsx"), { id: questItem.id, name: questItem.name });
            throw new Error("Validation Stop");
        }
        return this;
    };
    Validation.prototype.isErrorFree = function (eventLayers) {
        var isInErrorData = this.layersErrorData.some(function (item) {
            if (item.id === eventLayers[0].id && !~eventLayers[0].name.search(/(Error)/)) {
                return true;
            }
        });
        if (isInErrorData) {
            this.removeFromErrorData(eventLayers[0].id);
            this.docEmitter.emit("removeError", eventLayers[0].id);
        }
    };
    Validation.prototype.removeFromErrorData = function (id) {
        var key;
        for (var index in this.layersErrorData) {
            if (this.layersErrorData[index].id === id) {
                key = index;
                break;
            }
        }
        this.layersErrorData.splice(key, 1);
    };
    Validation.prototype.validationID = function (id) {
        //Call photoshop to change the layer name;
    };
    return Validation;
}());
exports.Validation = Validation;
//# sourceMappingURL=Validation.js.map