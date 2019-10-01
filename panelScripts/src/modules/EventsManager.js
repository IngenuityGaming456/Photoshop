"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventsManager = /** @class */ (function () {
    function EventsManager() {
    }
    EventsManager.prototype.execute = function (params) {
        this.generator = params.generator;
        this.documentManager = params.storage.documentManager;
        this.subscribeListeners();
    };
    EventsManager.prototype.onImageChanged = function (event) {
        this.removeUnwantedEvents(event);
        this.isAddedEvent(event);
        this.isDeletionEvent(event);
        this.isRenameEvent(event);
    };
    EventsManager.prototype.subscribeListeners = function () {
        var _this = this;
        this.generator.on("eventProcessed", function (event) {
            _this.onHandleEvents(event);
        });
        this.documentManager.on("openDocumentsChanged", function (allOpenDocuments, nowOpenDocuments, nowClosedDocuments) {
            _this.handleDocumentOpenClose(nowOpenDocuments, nowClosedDocuments);
        });
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
        if (event === "save") {
            this.generator.emit("save");
        }
    };
    EventsManager.prototype.handleOpenDocument = function (nowOpenDocuments) {
        this.generator.emit("openedDocument", nowOpenDocuments[0]);
    };
    EventsManager.prototype.handleCloseDocument = function (nowCloseDocuments) {
        this.generator.emit("closedDocument", nowCloseDocuments[0]);
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
            if (item.added && item.removed) {
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
        if (event.layers && this.isAdded(event.layers)) {
            this.generator.emit("layersAdded", event.layers);
        }
    };
    EventsManager.prototype.isDeletionEvent = function (event) {
        if (event.layers && this.isDeletion(event.layers)) {
            this.generator.emit("layersDeleted", event.layers);
        }
    };
    EventsManager.prototype.isRenameEvent = function (event) {
        if (event.layers && !event.layers[0].added && event.layers[0].name) {
            this.generator.emit("layerRenamed", event.layers);
        }
    };
    EventsManager.prototype.isAdded = function (layers) {
        var layersCount = layers.length;
        for (var i = 0; i < layersCount; i++) {
            var subLayer = layers[i];
            if (subLayer.hasOwnProperty("added")) {
                return true;
            }
            if (subLayer.hasOwnProperty("layers")) {
                return this.isAdded(subLayer.layers);
            }
        }
        return false;
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
// if(!event.layers[0].added && (event.layers[0].removed || event.layers[0].name)) {
//     componentsMap.forEach(item => {
//         Restructure.searchAndModifyControlledArray(event.layers, item);
//     });
// }
// _layerManager.addBufferData(event.layers);
//# sourceMappingURL=EventsManager.js.map