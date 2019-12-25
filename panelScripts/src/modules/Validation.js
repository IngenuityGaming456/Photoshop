"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils/utils");
var path = require("path");
var Validation = /** @class */ (function () {
    function Validation(modelFactory) {
        this.alreadyRenamed = [];
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
        this.generator.on("layersDeleted", function (eventLayers) { return _this.onLayersDeleted(eventLayers); });
    };
    Validation.prototype.isInHTML = function (key, id, questArray, drawnQuestItems) {
        if (~questArray.indexOf(key) && !utils_1.utlis.isIDExists(id, drawnQuestItems) && !~this.alreadyRenamed.indexOf(id)) {
            this.docEmitter.emit("logWarning", "Not allowed to create HTML Container, " + key + " with id = " + id);
            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), { id: id });
        }
    };
    Validation.prototype.onLayersRename = function (eventLayers) {
        var questArray = this.modelFactory.getPhotoshopModel().allQuestItems;
        var drawnQuestItems = this.modelFactory.getPhotoshopModel().allDrawnQuestItems;
        this.startValidationSequence(eventLayers, questArray, drawnQuestItems);
        this.isErrorFree(eventLayers, this.errorFreeFromRename.bind(this));
    };
    Validation.prototype.onLayersDeleted = function (eventLayers) {
        this.isErrorFree(eventLayers, this.errorFreeFromDeletion.bind(this));
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
        var layerId = this.modelFactory.getPhotoshopModel().allSelectedLayers[0];
        var layerRef = this.activeDocument.layers.findLayer(Number(layerId));
        var questItem = drawnQuestItems.find(function (item) {
            if (item.id === id && item.name !== name) {
                return true;
            }
        });
        if (questItem && questItem.name !== "generic") {
            this.docEmitter.emit("logWarning", "Not allowed to rename Quest Item, " + questItem.name + " with id = " + id);
            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/UndoRenamedLayer.jsx"), { id: questItem.id, name: questItem.name });
            throw new Error("Validation Stop");
        }
        if (utils_1.utlis.getElementName(layerRef, "languages") && !~this.alreadyRenamed.indexOf(id)) {
            if (this.modelFactory.getPhotoshopModel().isRenamedFromLayout) {
                this.modelFactory.getPhotoshopModel().isRenamedFromLayout = false;
                return this;
            }
            this.alreadyRenamed.push(id);
            this.docEmitter.emit("logWarning", "Can't rename an item inside languages");
            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/UndoRenamedLayer.jsx"), { id: layerRef.layer.id, name: layerRef.layer.name });
            throw new Error("Validation Stop");
        }
        return this;
    };
    Validation.prototype.isErrorFree = function (eventLayers, callback) {
        var errorData = callback(eventLayers);
        if (errorData) {
            utils_1.utlis.spliceFrom(errorData.id, this.layersErrorData);
            this.docEmitter.emit("removeError", eventLayers[0].id);
        }
    };
    Validation.prototype.errorFreeFromRename = function (eventLayers) {
        return this.layersErrorData.find(function (item) {
            if (item.id === eventLayers[0].id && !~eventLayers[0].name.search(/(Error)/)) {
                return true;
            }
        });
    };
    Validation.prototype.errorFreeFromDeletion = function (eventLayers) {
        return this.layersErrorData.find(function (item) {
            var isInDeletedLayers = utils_1.utlis.isIDExists(item.id, eventLayers);
            if (isInDeletedLayers) {
                return true;
            }
        });
    };
    return Validation;
}());
exports.Validation = Validation;
//# sourceMappingURL=Validation.js.map