"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsManager = void 0;
const constants_1 = require("../constants");
const utils_1 = require("../utils/utils");
class EventsManager {
    constructor() {
        this.isNewDocument = false;
        this.activeDocId = null;
    }
    execute(params) {
        this.generator = params.generator;
        this.documentManager = params.storage.documentManager;
        this.subscribeListeners();
    }
    onImageChanged(event) {
        const eventCopy = Object.assign({}, event);
        this.isDocumentChange(eventCopy);
        if (this.activeDocId && this.activeDocId != eventCopy.id) {
            return;
        }
        this.isSelected(eventCopy);
        this.removeUnwantedEvents(eventCopy);
        try {
            this.isAddedEvent(eventCopy)
                .isDeletionEvent(eventCopy)
                .isRenameEvent(eventCopy)
                .isMovedEvent(eventCopy);
        }
        catch (err) {
            console.log(err);
        }
    }
    isSelected(event) {
        if ("selection" in event) {
            this.generator.emit("select");
        }
    }
    subscribeListeners() {
        this.generator.on(constants_1.photoshopConstants.generator.activeDocumentId, activeDocId => this.activeDocId = activeDocId);
        this.generator.on(constants_1.photoshopConstants.logger.newDocument, () => {
            this.isNewDocument = true;
        });
        this.generator.on(constants_1.photoshopConstants.logger.currentDocument, () => {
            this.isNewDocument = false;
        });
        this.generator.on(constants_1.photoshopConstants.generator.eventProcessed, (event) => {
            if (!this.isNewDocument)
                this.onHandleEvents(event);
        });
        this.documentManager.on(constants_1.photoshopConstants.documentEvents.openDocumentsChanged, (allOpenDocuments, nowOpenDocuments, nowClosedDocuments) => {
            this.handleDocumentOpenClose(nowOpenDocuments, nowClosedDocuments);
        });
        this.generator.on(constants_1.photoshopConstants.generator.activeDocumentClosed, () => this.isNewDocument = false);
    }
    handleDocumentOpenClose(nowOpenDocuments, nowClosedDocuments) {
        if (nowOpenDocuments.length) {
            this.handleOpenDocument(nowOpenDocuments);
        }
        if (nowClosedDocuments.length) {
            this.handleCloseDocument(nowClosedDocuments);
        }
    }
    onHandleEvents(event) {
        switch (event) {
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
    }
    handleOpenDocument(nowOpenDocuments) {
        this.generator.emit(constants_1.photoshopConstants.generator.openedDocument, nowOpenDocuments[0]);
    }
    handleCloseDocument(nowCloseDocuments) {
        this.generator.emit(constants_1.photoshopConstants.generator.closedDocument, nowCloseDocuments[0]);
    }
    isDocumentChange(event) {
        if (event.active) {
            this.generator.emit(constants_1.photoshopConstants.generator.activeDocumentChanged, event.id);
        }
    }
    removeUnwantedEvents(event) {
        if (event.layers) {
            this.removeUnwantedLayers(event.layers);
            this.removeUnwantedProperty(event.layers);
        }
    }
    removeUnwantedLayers(rawChange) {
        var unwantedLayers = [];
        rawChange.forEach((item, index) => {
            if ((item.added && item.removed)) {
                unwantedLayers.push(index);
            }
        });
        this.sliceArray(rawChange, unwantedLayers);
    }
    removeUnwantedProperty(rawChange) {
        if (this.checkAddedItem(rawChange)) {
            this.removeProperty(rawChange);
        }
    }
    checkAddedItem(rawChange) {
        var addedTypeItem = rawChange.find(item => {
            if (item.added) {
                return true;
            }
            if (item.layers) {
                return this.checkAddedItem(item.layers);
            }
            return false;
        });
        return !!addedTypeItem;
    }
    removeProperty(rawChange) {
        let unwantedLayers = [];
        rawChange.forEach((item, index) => {
            if (item.removed) {
                if (!item.layers) {
                    unwantedLayers.push(index);
                }
                else {
                    delete item.removed;
                }
            }
            else if (item.layers) {
                this.removeProperty(item.layers);
            }
        });
        this.sliceArray(rawChange, unwantedLayers);
    }
    isAddedEvent(event) {
        if (event.layers) {
            const addedPath = this.isAdded(event.layers, []);
            if (!addedPath) {
                return this;
            }
            if (!addedPath.length) {
                this.generator.emit(constants_1.photoshopConstants.generator.layersAdded, event.layers, this.isNewDocument);
            }
            else {
                const parsedEvent = utils_1.utlis.getParsedEvent(addedPath.reverse(), event.layers, { index: 0 }, null);
                this.generator.emit(constants_1.photoshopConstants.generator.layersAdded, parsedEvent, this.isNewDocument);
            }
            throw new Error("Added Event Dispatched");
        }
        return this;
    }
    isDeletionEvent(event) {
        if (event.layers && this.isDeletion(event.layers)) {
            this.generator.emit(constants_1.photoshopConstants.generator.layersDeleted, event.layers);
            throw new Error("Deletion Event Dispatched");
        }
        return this;
    }
    isRenameEvent(event) {
        if (event.layers && event.layers.length && !event.layers[0].added && event.layers[0].name) {
            this.generator.emit(constants_1.photoshopConstants.generator.layerRenamed, event.layers);
            throw new Error("Rename Event Dispatched");
        }
        return this;
    }
    isMovedEvent(event) {
        if (event.layers && this.isMoved(event.layers)) {
            this.generator.emit(constants_1.photoshopConstants.generator.layersMoved, event.layers);
        }
    }
    isAdded(layers, pathArray) {
        const subPathArray = [];
        const layersCount = layers.length;
        for (let i = 0; i < layersCount; i++) {
            const subLayer = layers[i];
            if (subLayer.hasOwnProperty("added")) {
                subPathArray.push(i);
                if (layersCount === 1) {
                    subPathArray.push(-1);
                }
                continue;
            }
            const addedResult = subLayer.layers && this.isAtLevel(subLayer.layers, "added");
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
    }
    isAtLevel(layers, key) {
        const layerLength = layers.length;
        for (let i = 0; i < layerLength; i++) {
            const subLayer = layers[i];
            if (subLayer.hasOwnProperty(key)) {
                return true;
            }
            if (subLayer.hasOwnProperty("layers")) {
                const levelValue = this.isAtLevel(subLayer.layers, key);
                if (levelValue) {
                    return true;
                }
            }
        }
        return false;
    }
    isMoved(layers) {
        const layersCount = layers.length;
        for (let i = 0; i < layersCount; i++) {
            const subLayer = layers[i];
            if (subLayer.hasOwnProperty("added") || subLayer.hasOwnProperty("removed")) {
                return false;
            }
            if (subLayer.hasOwnProperty("layers")) {
                return this.isMoved(subLayer.layers);
            }
        }
        return true;
    }
    isDeletion(layers) {
        const layersCount = layers.length;
        for (let i = 0; i < layersCount; i++) {
            const subLayer = layers[i];
            if (subLayer.hasOwnProperty("removed")) {
                return true;
            }
        }
        return false;
    }
    sliceArray(rawChange, unwantedLayers) {
        const unwantedCount = unwantedLayers.length;
        for (let i = 0; i < unwantedCount; i++) {
            rawChange.splice(unwantedLayers[i], 1);
            unwantedLayers[i + 1] -= (i + 1);
        }
    }
}
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