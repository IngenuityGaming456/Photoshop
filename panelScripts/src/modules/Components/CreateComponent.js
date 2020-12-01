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
exports.CreateComponent = void 0;
const Restructure_1 = require("../Restructure");
const path = require("path");
const utils_1 = require("../../utils/utils");
const constants_1 = require("../../constants");
let packageJson = require("../../../package.json");
class CreateComponent {
    constructor(modelFactory) {
        this.isPaste = false;
        this.executeCalls = 1;
        this.modelFactory = modelFactory;
    }
    execute(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this._generator = params.generator;
            this._pluginId = packageJson.name;
            this.docEmitter = params.docEmitter;
            this.componentsMap = params.storage.factoryMap;
            this.activeDocument = params.activeDocument;
            yield this.validate(params);
        });
    }
    validate(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const isValid = yield this.isValid();
            if (!isValid) {
                this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, "A component should always be made inside a view");
                return Promise.resolve();
            }
            this.subscribeListeners(this.executeCalls++);
            yield this.searchDocument();
            this.elementValue = this.modelFactory.getMappingModel().getComponentsMap().get(params.menuName);
            let sequenceId = Restructure_1.Restructure.sequenceStructure(this.elementValue);
            let id = yield this.callComponentJsx(sequenceId, params.menuName);
            yield this.controlJSXReturn(id, this.elementValue);
            this.elementValue.elementArray.push({ id: id, sequence: sequenceId });
        });
    }
    isValid() {
        return __awaiter(this, void 0, void 0, function* () {
            let selectedLayersString = yield this._generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/SelectedLayersIds.jsx"));
            const selectedLayersIdArray = selectedLayersString.toString().split(",");
            const layers = this.activeDocument.layers;
            const selectedRef = layers.findLayer(Number(selectedLayersIdArray[0]));
            return this.isCorrectSelection(selectedRef);
        });
    }
    isCorrectSelection(selectedRef) {
        if (!selectedRef) {
            return false;
        }
        let layerRef;
        if (selectedRef.layer) {
            layerRef = selectedRef.layer;
        }
        if (selectedRef.name) {
            layerRef = selectedRef;
        }
        if (!layerRef) {
            return false;
        }
        if (layerRef.group && layerRef.group.name && ~layerRef.group.name.search((/common/))) {
            return true;
        }
        return this.isCorrectSelection(layerRef.group);
    }
    subscribeListeners(executeCalls) {
        if (executeCalls === 1) {
            this._generator.on(constants_1.photoshopConstants.generator.layersDeleted, (eventLayers) => this.handleChange(eventLayers));
            this._generator.on(constants_1.photoshopConstants.generator.layerRenamed, (eventLayers) => this.handleChange(eventLayers));
            this._generator.on(constants_1.photoshopConstants.generator.paste, () => this.onPaste());
            this._generator.on(constants_1.photoshopConstants.generator.layersAdded, eventLayers => this.onLayersAddition(eventLayers));
        }
    }
    controlJSXReturn(id, elementValue) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.isID(id, elementValue);
                (yield this.isBitmap(id, elementValue))
                    .isInvalidSpecialItem(id)
                    .isInvalidBitmap(id);
            }
            catch (err) {
                console.log("return controlled");
            }
        });
    }
    isID(id, elementValue) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Number(id)) {
                yield this.setGeneratorSettings(id, elementValue.label.toLowerCase(), this._pluginId);
                this.docEmitter.emit("componentAdded", elementValue.label.toLowerCase());
                throw new Error("Control Done");
            }
            const returnArray = id.split(",");
            if (returnArray[0] && returnArray[1] && ~returnArray[1].search(/(Paylines|Symbols|WinFrames)/)) {
                const returnCount = returnArray.length;
                for (let i = 2; i < returnCount; i++) {
                    yield this.setGeneratorSettings(Number(returnArray[i]), elementValue.label.toLowerCase(), this._pluginId);
                }
            }
        });
    }
    isBitmap(id, elementValue) {
        return __awaiter(this, void 0, void 0, function* () {
            const returnArray = id.split(",");
            if (Number(returnArray[0])) {
                yield this.setGeneratorSettings(returnArray[0], elementValue.label.toLowerCase(), this._pluginId);
                yield this.setGeneratorSettings(returnArray[0], returnArray[1], this._pluginId + "Bitmap");
                throw new Error("Control Done");
            }
            return this;
        });
    }
    isInvalidSpecialItem(id) {
        const returnArray = id.split(",");
        if (returnArray[0] === constants_1.photoshopConstants.jsxReturn.falseType) {
            this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, `Need to select ${returnArray[1]} from the document tree`);
            throw new Error("Control Done");
        }
        return this;
    }
    isInvalidBitmap(id) {
        const returnArray = id.split(",");
        if (returnArray[0] === constants_1.photoshopConstants.jsxReturn.bitmapType) {
            this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, `No bitmap font is found at "others/Bitmaps"`);
            throw new Error("Control Done");
        }
        if (returnArray[0] === constants_1.photoshopConstants.jsxReturn.bitmapTypeExtra) {
            this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, `png file corresponding to bitmap is not found`);
        }
    }
    handleChange(eventLayers) {
        if (this.isPaste) {
            this.isPaste = false;
            return;
        }
        const componentsMap = this.modelFactory.getMappingModel().getComponentsMap();
        componentsMap.forEach(item => {
            Restructure_1.Restructure.searchAndModifyControlledArray(eventLayers, item);
        });
    }
    callComponentJsx(sequenceId, jsxName) {
        return __awaiter(this, void 0, void 0, function* () {
            let jsxPath = path.join(__dirname, "../../../jsx/" + jsxName + ".jsx");
            yield this._generator.evaluateJSXString(`alert({jsxPath})`);
            return yield this._generator.evaluateJSXFile(jsxPath, { clicks: sequenceId });
        });
    }
    setGeneratorSettings(id, insertion, pluginId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._generator.setLayerSettingsForPlugin(insertion, id, pluginId);
        });
    }
    onPaste() {
        this.isPaste = true;
    }
    onLayersAddition(eventLayers) {
        if (this.isPaste) {
            utils_1.utlis.traverseAddedLayers(eventLayers, this.onAddition.bind(this));
        }
    }
    onAddition(addedLayer) {
        this._generator.once(constants_1.photoshopConstants.generator.documentResolved, () => {
            const component = this.isComponent(addedLayer.name);
            if (component) {
                if (this.isInLanguage(addedLayer)) {
                    return;
                }
                const sequenceId = Restructure_1.Restructure.sequenceStructure(this.elementValue);
                this._generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/RenameErrorLayer.jsx"), {
                    id: addedLayer.id,
                    level: 1,
                    index: component.index,
                    sequence: sequenceId
                });
                this.elementValue.elementArray.push({ id: addedLayer.id, sequence: sequenceId });
            }
        });
    }
    isInLanguage(addedLayer) {
        const addedLayerRef = this.activeDocument.layers.findLayer(addedLayer.id);
        return !!utils_1.utlis.getElementName(addedLayerRef, constants_1.photoshopConstants.languages);
    }
    isComponent(layerName) {
        const componentValues = this.componentsMap.values();
        for (let key of componentValues) {
            const labelName = key.label;
            const labelIndex = layerName.search(labelName);
            if (labelIndex === 0) {
                const sequence = layerName.substring(labelName.length);
                if (Number(sequence)) {
                    return {
                        sequence: Number(sequence),
                        index: labelName.length
                    };
                }
            }
        }
        return null;
    }
    searchDocument() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.executeCalls !== 2) {
                return;
            }
            const componentValues = this.componentsMap.values();
            for (let value of componentValues) {
                this.searchInDocument(value, this.activeDocument.layers.layers);
            }
        });
    }
    searchInDocument(value, activeLayers) {
        const layersCount = activeLayers.length;
        for (let i = 0; i < layersCount; i++) {
            const layerRef = activeLayers[i];
            const layerName = layerRef.name;
            const position = layerName.search(value.label);
            if (position === 0) {
                const sequenceId = layerName.slice(value.label.length);
                if (Number(sequenceId)) {
                    value.elementArray.push({
                        id: layerRef.id,
                        sequence: Number(sequenceId)
                    });
                }
            }
            if (layerRef.layers) {
                this.searchInDocument(value, layerRef.layers);
            }
        }
    }
}
exports.CreateComponent = CreateComponent;
//# sourceMappingURL=CreateComponent.js.map