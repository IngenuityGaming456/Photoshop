"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayerManager = void 0;
const path = require("path");
const constants_1 = require("../constants");
const utils_1 = require("../utils/utils");
let LayerClass = require("../../lib/dom/layer.js");
let packageJson = require("../../package.json");
class LayerManager {
    constructor(modelFactory) {
        this.selectedLayers = [];
        this.localisedLayers = [];
        this.isPasteEvent = false;
        this.queuedImageLayers = [];
        this.modelFactory = modelFactory;
    }
    execute(params) {
        this._generator = params.generator;
        this.docEmitter = params.docEmitter;
        this._activeDocument = params.activeDocument;
        this.pluginId = packageJson.name;
        this.subscribeListeners();
    }
    subscribeListeners() {
        this._generator.on(constants_1.photoshopConstants.generator.layersAdded, (eventLayers, isNewDocument) => {
            this.onLayersAdded(eventLayers, isNewDocument);
        });
        this._generator.on(constants_1.photoshopConstants.generator.select, () => this.onLayersSelected());
        this._generator.on(constants_1.photoshopConstants.generator.copy, () => {
            this.eventName = Events.COPY;
        });
        this._generator.on(constants_1.photoshopConstants.generator.paste, () => {
            if (this.eventName === Events.COPY) {
                this.eventName = Events.PASTE;
                this.isPasteEvent = true;
            }
            else {
                this.eventName = Events.OTHER;
            }
        });
        this._generator.on(constants_1.photoshopConstants.generator.copyToLayer, () => {
            this.eventName = Events.COPYTOLAYER;
        });
        this._generator.on(constants_1.photoshopConstants.generator.duplicate, () => {
            if (this.eventName !== Events.OTHER) {
                this.eventName = Events.DUPLICATE;
                console.log(this.eventName);
            }
        });
        this.docEmitter.on(constants_1.photoshopConstants.localisation, localisedLayers => {
            this.localisedLayers = localisedLayers;
        });
    }
    onLayersSelected() {
        return __awaiter(this, void 0, void 0, function* () {
            this.eventName = Events.SELECT;
            if (this.modelFactory.getPhotoshopModel().automationOn) {
                return;
            }
            let selectedLayersString = yield this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/SelectedLayersIds.jsx"));
            this.selectedLayers = selectedLayersString.toString().split(",");
        });
    }
    onLayersAdded(eventLayers, isNewDocument) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isNewDocument) {
                this.constructQueuedArray(eventLayers);
                this.docEmitter.once(constants_1.photoshopConstants.logger.currentDocument, () => __awaiter(this, void 0, void 0, function* () {
                    yield this.handleImportEvent(this.queuedImageLayers);
                    this.queuedImageLayers = [];
                }));
                return;
            }
            yield this.addBufferData(eventLayers);
        });
    }
    constructQueuedArray(eventLayers) {
        eventLayers.forEach(item => {
            this.queuedImageLayers.push(item);
        });
    }
    handleLayersAddition(eventLayers, questItems, deletedLayers) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let item of eventLayers) {
                if (item.added) {
                    const inQuest = questItems.some(key => {
                        if (key === item.name) {
                            return true;
                        }
                    });
                    if (inQuest) {
                        deletedLayers.push(item.id);
                        this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, `Not Allowed to duplicate a quest element, ${item.name} with id = ${item.id}`);
                        yield this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), { id: item.id });
                        return;
                    }
                }
                else if (item.layers) {
                    this.handleLayersAddition(item.layers, questItems, deletedLayers);
                }
            }
        });
    }
    addBufferData(changedLayers) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (this.eventName) {
                case Events.COPYTOLAYER:
                    yield this.handleDuplicate(changedLayers, this.selectedLayers, []);
                    break;
                case Events.DUPLICATE:
                    yield this.handleDuplicateEvent(changedLayers);
                    break;
                default:
                    const mappedIds = this.modelFactory.getPhotoshopModel().getMappedIds();
                    if (mappedIds.length) {
                        yield this.handleMappedDuplicate(changedLayers, mappedIds, []);
                    }
                    else {
                        yield this.handleImportEvent(changedLayers);
                    }
            }
        });
    }
    handleMappedDuplicate(changedLayers, parentLayers, deletedLayers) {
        return __awaiter(this, void 0, void 0, function* () {
            const referredIds = yield this.handleDuplicate(changedLayers, parentLayers, deletedLayers);
            utils_1.utlis.spliceFromIdArray(parentLayers, referredIds);
        });
    }
    handleDuplicateEvent(changedLayers) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPasteEvent) {
                const questItems = this.modelFactory.getPhotoshopModel().allQuestItems;
                const deletedLayers = [];
                yield this.handleLayersAddition(changedLayers, questItems, deletedLayers);
                yield this.handleDuplicate(changedLayers, this.selectedLayers, deletedLayers);
                this.isPasteEvent = false;
                return;
            }
            if (this.localisedLayers.length) {
                yield this.handleDuplicate(changedLayers, this.localisedLayers, []);
                this.localisedLayers.splice(0, 1);
                return;
            }
            yield this.handleDuplicate(changedLayers, this.selectedLayers, []);
        });
    }
    handleDuplicate(changedLayers, parentLayers, deletedLayers) {
        return __awaiter(this, void 0, void 0, function* () {
            const addedLayers = this.handleEvent(changedLayers, undefined);
            return yield this.getImageDataOfEvent(addedLayers, parentLayers, deletedLayers);
        });
    }
    handleEvent(changedLayers, addedLayers) {
        addedLayers = addedLayers || [];
        const layersCount = changedLayers.length;
        for (let i = 0; i < layersCount; i++) {
            const change = changedLayers[i];
            if (change.hasOwnProperty("added")) {
                addedLayers.push(change);
            }
            else {
                if (change.layers) {
                    addedLayers = this.handleEvent(change.layers, addedLayers);
                }
            }
        }
        return addedLayers;
    }
    handleImportEvent(changedLayers) {
        return __awaiter(this, void 0, void 0, function* () {
            const layersCount = changedLayers.length;
            for (let i = 0; i < layersCount; i++) {
                const change = changedLayers[i];
                if (change.hasOwnProperty("added") && change.type === "layer") {
                    try {
                        yield this.getImageData(change.id);
                        console.log("Pixels Added");
                    }
                    catch (err) {
                        console.log("error occured while pixel update");
                    }
                }
                if (change.hasOwnProperty("layers")) {
                    yield this.handleImportEvent(change.layers);
                }
            }
        });
    }
    getImageData(layerId) {
        return __awaiter(this, void 0, void 0, function* () {
            let pixmap = yield this._generator.getPixmap(this._activeDocument.id, layerId, { scaleX: 0.5, scaleY: 0.5 });
            let pixmapBuffer = Buffer.from(pixmap.pixels);
            let cBuffer = LayerManager.compressBuffer(pixmapBuffer, pixmap.channelCount);
            let base64Pixmap = cBuffer.toString('base64');
            const bufferPayload = {
                "pixels": base64Pixmap
            };
            console.log("Pixels started to add");
            return this.setLayerSettings(bufferPayload, layerId);
        });
    }
    getImageDataOfEvent(layersArray, parentLayers, deletedLayers) {
        return __awaiter(this, void 0, void 0, function* () {
            const referredIds = [];
            const layersCount = layersArray.length;
            for (let i = 0; i < layersCount; i++) {
                const refObject = this.getCorrectCopiedLayerRef(layersArray[i].name, parentLayers);
                const copiedLayerRef = refObject === null || refObject === void 0 ? void 0 : refObject.ref;
                refObject && referredIds.push(refObject.id);
                if (copiedLayerRef instanceof LayerClass.LayerGroup) {
                    yield this.setBufferOnEvent(this._activeDocument.id, copiedLayerRef.id, layersArray[i].id);
                    const pastedLayerRef = this.findLayerRef(this._activeDocument.layers.layers, layersArray[i].id);
                    if (~deletedLayers.indexOf(pastedLayerRef.id)) {
                        continue;
                    }
                    yield this.handleGroupEvent(copiedLayerRef, pastedLayerRef);
                }
                else {
                    copiedLayerRef && (yield this.setBufferOnEvent(this._activeDocument.id, copiedLayerRef.id, layersArray[i].id));
                }
            }
            return referredIds;
        });
    }
    getCorrectCopiedLayerRef(layerName, parentLayers) {
        for (let id of parentLayers) {
            const ref = this.findLayerRef(this._activeDocument.layers.layers, id);
            if (ref && ref.layer && ref.layer.name === layerName || ref && ref.name && ref.name === layerName) {
                return { ref, id };
            }
        }
        return null;
    }
    handleGroupEvent(copiedLayerGroup, pastedLayerGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            const copiedLayers = copiedLayerGroup.layers;
            const pastedLayers = pastedLayerGroup.layers;
            const layersCount = copiedLayers.length;
            for (let i = 0; i < layersCount; i++) {
                if (copiedLayers[i] instanceof LayerClass.LayerGroup) {
                    yield this.handleGroupEvent(copiedLayers[i], pastedLayers[i]);
                }
                else {
                    yield this.setBufferOnEvent(this._activeDocument.id, copiedLayers[i].id, pastedLayers[i].id);
                    console.log("Duplicate Image Pixel Data Added ", pastedLayers[i].id);
                }
            }
        });
    }
    setBufferOnEvent(documentId, copyId, pasteId) {
        return __awaiter(this, void 0, void 0, function* () {
            let bufferPayload = yield this._generator.getLayerSettingsForPlugin(documentId, copyId, this.pluginId);
            yield this.setLayerSettings(bufferPayload, pasteId);
        });
    }
    findLayerRef(documentLayers, layerId) {
        let layerRef;
        documentLayers.some(item => {
            if (item.id == layerId) {
                layerRef = item;
                return true;
            }
            if (item.layers) {
                layerRef = this.findLayerRef(item.layers, layerId);
                if (layerRef) {
                    return true;
                }
            }
        });
        if (layerRef) {
            return layerRef;
        }
    }
    static compressBuffer(buffer, channelCount) {
        const cBL = buffer.length / 2 + 1;
        let cBuffer = Buffer.alloc(cBL);
        for (let i = 0; i < buffer.length; i += channelCount) {
            cBuffer[i] = buffer[i];
            cBuffer[i + 1] = (buffer[i + 1] + buffer[i + 2] + buffer[i + 3]) / 3;
        }
        return cBuffer;
    }
    setLayerSettings(bufferPayload, layerId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Object.keys(bufferPayload).length) {
                try {
                    yield this._generator.setLayerSettingsForPlugin(bufferPayload, layerId, this.pluginId);
                    console.log(`pixels added for id ${layerId}`);
                }
                catch (err) {
                    console.log("error in pixel Mapping");
                }
            }
        });
    }
}
exports.LayerManager = LayerManager;
var Events;
(function (Events) {
    Events["DUPLICATE"] = "Dplc";
    Events["SELECT"] = "slct";
    Events["COPYTOLAYER"] = "CpTL";
    Events["COPY"] = "copy";
    Events["PASTE"] = "past";
    Events["OTHER"] = "other";
})(Events || (Events = {}));
//# sourceMappingURL=LayerManager.js.map