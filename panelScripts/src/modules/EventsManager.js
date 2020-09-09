"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsManager = void 0;
var constants_1 = require("../constants");
var utils_1 = require("../utils/utils");
var EventsManager = /** @class */ (function () {
    function EventsManager() {
        this.isNewDocument = false;
        this.activeDocId = null;
    }
    EventsManager.prototype.execute = function (params) {
        this.generator = params.generator;
        this.documentManager = params.storage.documentManager;
        this.subscribeListeners();
    };
    EventsManager.prototype.onImageChanged = function (event) {
        var eventCopy = __assign({}, event);
        this.isDocumentChange(eventCopy);
        if (this.activeDocId && this.activeDocId != eventCopy.id) {
            return;
        }
        this.removeUnwantedEvents(eventCopy);
        try {
            this.isAddedEvent(eventCopy)
                .isDeletionEvent(eventCopy)
                .isRenameEvent(eventCopy)
                .isMovedEvent(eventCopy);
        }
        catch (err) {
            console.log("Event Dispatched");
        }
    };
    EventsManager.prototype.subscribeListeners = function () {
        var _this = this;
        this.generator.on(constants_1.photoshopConstants.generator.activeDocumentId, function (activeDocId) { return _this.activeDocId = activeDocId; });
        this.generator.on(constants_1.photoshopConstants.logger.newDocument, function () { return _this.isNewDocument = true; });
        this.generator.on(constants_1.photoshopConstants.logger.currentDocument, function () { return _this.isNewDocument = false; });
        this.generator.on(constants_1.photoshopConstants.generator.eventProcessed, function (event) {
            if (!_this.isNewDocument)
                _this.onHandleEvents(event);
        });
        this.documentManager.on(constants_1.photoshopConstants.documentEvents.openDocumentsChanged, function (allOpenDocuments, nowOpenDocuments, nowClosedDocuments) {
            _this.handleDocumentOpenClose(nowOpenDocuments, nowClosedDocuments);
        });
        this.generator.on(constants_1.photoshopConstants.generator.activeDocumentClosed, function () { return _this.isNewDocument = false; });
    };
    EventsManager.prototype.handleDocumentOpenClose = function (nowOpenDocuments, nowClosedDocuments) {
        if (nowOpenDocuments.length) {
            this.handleOpenDocument(nowOpenDocuments);
        }
        if (nowClosedDocuments.length) {
            this.handleCloseDocument(nowClosedDocuments);
        }
    };
    EventsManager.prototype.onHandleEvents = function (event) {
        switch (event) {
            case Events.SELECT:
                this.generator.emit("select");
                break;
            case Events.COPY:
                this.generator.emit("copy");
                break;
            case Events.PASTE:
                this.generator.emit("paste");
                break;
            case Events.SAVE:
                this.generator.emit("save");
                break;
            case Events.COPYTOLAYER:
                this.generator.emit("copyToLayer");
                break;
            case Events.DUPLICATE:
                this.generator.emit("duplicate");
                break;
            case Events.UNDO:
                this.generator.emit("undo");
        }
    };
    EventsManager.prototype.handleOpenDocument = function (nowOpenDocuments) {
        this.generator.emit(constants_1.photoshopConstants.generator.openedDocument, nowOpenDocuments[0]);
    };
    EventsManager.prototype.handleCloseDocument = function (nowCloseDocuments) {
        this.generator.emit(constants_1.photoshopConstants.generator.closedDocument, nowCloseDocuments[0]);
    };
    EventsManager.prototype.isDocumentChange = function (event) {
        if (event.active) {
            this.generator.emit(constants_1.photoshopConstants.generator.activeDocumentChanged, event.id);
        }
    };
    EventsManager.prototype.removeUnwantedEvents = function (event) {
        if (event.layers) {
            this.removeUnwantedLayers(event.layers);
            this.removeUnwantedProperty(event.layers);
        }
    };
    EventsManager.prototype.removeUnwantedLayers = function (rawChange) {
        var unwantedLayers = [];
        rawChange.forEach(function (item, index) {
            if ((item.added && item.removed)) {
                unwantedLayers.push(index);
            }
        });
        this.sliceArray(rawChange, unwantedLayers);
    };
    EventsManager.prototype.removeUnwantedProperty = function (rawChange) {
        if (this.checkAddedItem(rawChange)) {
            this.removeProperty(rawChange);
        }
    };
    EventsManager.prototype.checkAddedItem = function (rawChange) {
        var _this = this;
        var addedTypeItem = rawChange.find(function (item) {
            if (item.added) {
                return true;
            }
            if (item.layers) {
                return _this.checkAddedItem(item.layers);
            }
            return false;
        });
        return !!addedTypeItem;
    };
    EventsManager.prototype.removeProperty = function (rawChange) {
        var _this = this;
        var unwantedLayers = [];
        rawChange.forEach(function (item, index) {
            if (item.removed) {
                if (!item.layers) {
                    unwantedLayers.push(index);
                }
                else {
                    delete item.removed;
                }
            }
            else if (item.layers) {
                _this.removeProperty(item.layers);
            }
        });
        this.sliceArray(rawChange, unwantedLayers);
    };
    EventsManager.prototype.isAddedEvent = function (event) {
        if (event.layers) {
            var addedPath = this.isAdded(event.layers, []);
            if (!addedPath) {
                return this;
            }
            if (!addedPath.length) {
                this.generator.emit(constants_1.photoshopConstants.generator.layersAdded, event.layers, this.isNewDocument);
            }
            else {
                var parsedEvent = utils_1.utlis.getParsedEvent(addedPath.reverse(), event.layers);
                this.generator.emit(constants_1.photoshopConstants.generator.layersAdded, parsedEvent, this.isNewDocument);
            }
            throw new Error("Added Event Dispatched");
        }
        return this;
    };
    EventsManager.prototype.isDeletionEvent = function (event) {
        if (event.layers && this.isDeletion(event.layers)) {
            this.generator.emit(constants_1.photoshopConstants.generator.layersDeleted, event.layers);
            throw new Error("Deletion Event Dispatched");
        }
        return this;
    };
    EventsManager.prototype.isRenameEvent = function (event) {
        if (event.layers && event.layers.length && !event.layers[0].added && event.layers[0].name) {
            this.generator.emit(constants_1.photoshopConstants.generator.layerRenamed, event.layers);
            throw new Error("Rename Event Dispatched");
        }
        return this;
    };
    EventsManager.prototype.isMovedEvent = function (event) {
        if (event.layers && this.isMoved(event.layers)) {
            this.generator.emit(constants_1.photoshopConstants.generator.layersMoved, event.layers);
        }
    };
    EventsManager.prototype.isAdded = function (layers, pathArray) {
        var subPathArray = [];
        var layersCount = layers.length;
        for (var i = 0; i < layersCount; i++) {
            var subLayer = layers[i];
            if (subLayer.hasOwnProperty("added")) {
                subPathArray.push(i);
                continue;
            }
            var addedResult = subLayer.layers && this.isAtLevel(subLayer.layers, "added");
            if (addedResult) {
                subPathArray.push(i);
                if (subLayer.layers) {
                    this.isAdded(subLayer.layers, pathArray);
                }
            }
        }
        if (!subPathArray.length) {
            return null;
        }
        pathArray.push(subPathArray);
        return pathArray;
    };
    EventsManager.prototype.isAtLevel = function (layers, key) {
        var layerLength = layers.length;
        for (var i = 0; i < layerLength; i++) {
            var subLayer = layers[i];
            if (subLayer.hasOwnProperty(key)) {
                return true;
            }
            if (subLayer.hasOwnProperty("layers")) {
                var levelValue = this.isAtLevel(subLayer.layers, key);
                if (levelValue) {
                    return true;
                }
            }
        }
        return false;
    };
    EventsManager.prototype.isMoved = function (layers) {
        var layersCount = layers.length;
        for (var i = 0; i < layersCount; i++) {
            var subLayer = layers[i];
            if (subLayer.hasOwnProperty("added") || subLayer.hasOwnProperty("removed")) {
                return false;
            }
            if (subLayer.hasOwnProperty("layers")) {
                return this.isMoved(subLayer.layers);
            }
        }
        return true;
    };
    EventsManager.prototype.isDeletion = function (layers) {
        var layersCount = layers.length;
        for (var i = 0; i < layersCount; i++) {
            var subLayer = layers[i];
            if (subLayer.hasOwnProperty("removed")) {
                return true;
            }
        }
        return false;
    };
    EventsManager.prototype.sliceArray = function (rawChange, unwantedLayers) {
        var unwantedCount = unwantedLayers.length;
        for (var i = 0; i < unwantedCount; i++) {
            rawChange.splice(unwantedLayers[i], 1);
            unwantedLayers[i + 1] -= (i + 1);
        }
    };
    return EventsManager;
}());
exports.EventsManager = EventsManager;
var Events;
(function (Events) {
    Events["DUPLICATE"] = "Dplc";
    Events["SELECT"] = "slct";
    Events["COPYTOLAYER"] = "CpTL";
    Events["COPY"] = "copy";
    Events["PASTE"] = "past";
    Events["SAVE"] = "save";
    Events["UNDO"] = "undo";
})(Events || (Events = {}));
//# sourceMappingURL=EventsManager.js.map