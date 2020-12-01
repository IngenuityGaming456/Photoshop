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
exports.CreateLayoutStructure = void 0;
const fs = require("fs");
const path = require("path");
const utils_1 = require("../../utils/utils");
const constants_1 = require("../../constants");
let packageJson = require("../../../package.json");
class CreateLayoutStructure {
    //just for test
    constructor(modelFactory) {
        //dirty hack for test
        this.modifiedIds = [];
        this.modelFactory = modelFactory;
        this.modifiedIds = this.modelFactory.getPhotoshopModel().allModifiedIds || [];
        this.modifiedIds.length = 0;
    }
    execute(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this._generator = params.generator;
            this._pluginId = packageJson.name;
            this._activeDocument = params.activeDocument;
            this.layerMap = params.storage.layerMap;
            this.bufferMap = params.storage.bufferMap;
            this.assetsPath = params.storage.assetsPath;
            this.docEmitter = params.docEmitter;
            this.emitStartStatus();
            yield this.upperLevelUnwantedLayers();
            yield this.restructureTempLayers();
            yield this.modifyPathNames();
            const result = yield this.requestDocument();
            this.result = result;
            utils_1.utlis.traverseObject(result.layers, this.filterResult.bind(this));
            this.modifyJSON(result.layers);
            this.modifyBottomBar(result.layers);
            yield this.removeUnwantedLayers();
            this.removeDuplicates(result.layers);
            this.writeJSON(result);
            this.emitStopStatus();
        });
    }
    emitStartStatus() {
        this.docEmitter.emit(constants_1.photoshopConstants.logger.logStatus, "Started generating layout");
    }
    restructureTempLayers() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.restructure(constants_1.photoshopConstants.generatorButtons.symbols);
            yield this.restructure(constants_1.photoshopConstants.generatorButtons.winFrames);
            yield this.restructure(constants_1.photoshopConstants.generatorButtons.paylines);
        });
    }
    restructure(layerName) {
        return __awaiter(this, void 0, void 0, function* () {
            const drawnQuestItems = this.modelFactory.getPhotoshopModel().allDrawnQuestItems;
            const items = drawnQuestItems.filter(item => {
                if (item.name === layerName) {
                    return true;
                }
            });
            for (let item of items) {
                const structRef = this._activeDocument.layers.findLayer(item.id);
                if (structRef.layer.layers) {
                    const structRefNestedLayers = structRef.layer.layers.length;
                    for (let i = 0; i < structRefNestedLayers; i++) {
                        yield this._generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/addSpecialPath.jsx"), { id: structRef.layer.layers[i].layers[0].id, parentName: layerName,
                            subLayerName: structRef.layer.layers[i].name });
                    }
                }
            }
        });
    }
    requestDocument() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._generator.getDocumentInfo(undefined);
        });
    }
    filterResult(artLayerRef) {
        artLayerRef.name = this.applySplitter(artLayerRef.name);
        delete artLayerRef["generatorSettings"][this._pluginId];
    }
    applySplitter(artLayerName) {
        if (~artLayerName.search(/\.(png|jpg)/)) {
            const extensionIndex = artLayerName.indexOf(".");
            const slashIndex = artLayerName.lastIndexOf("/");
            if (slashIndex > -1) {
                return artLayerName.substring(slashIndex + 1, extensionIndex);
            }
            else {
                return artLayerName.substring(0, extensionIndex);
            }
        }
        return artLayerName;
    }
    writeJSON(result) {
        return __awaiter(this, void 0, void 0, function* () {
            fs.writeFile(this.assetsPath + ".json", JSON.stringify(result, null, "  "), (err) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("File successfully written");
                }
            });
        });
    }
    modifyPathNames() {
        return __awaiter(this, void 0, void 0, function* () {
            const bufferKeys = [...this.layerMap.keys()];
            this.modelFactory.getPhotoshopModel().isRenamedFromLayout = true;
            const bufferKeysCount = bufferKeys.length;
            let lastUniqueId;
            for (let i = 0; i < bufferKeysCount; i++) {
                const layerValue = this.layerMap.get(bufferKeys[i]);
                if (layerValue.frequency === 1) {
                    lastUniqueId = bufferKeys[i];
                }
            }
            this.modelFactory.getPhotoshopModel().lastRename = lastUniqueId;
            for (let i = 0; i < bufferKeysCount; i++) {
                const layerValue = this.layerMap.get(bufferKeys[i]);
                yield this.handleBufferValue(layerValue, bufferKeys[i]);
            }
        });
    }
    handleBufferValue(layerValue, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const layerRef = this._activeDocument.layers.findLayer(key);
            if (layerValue.frequency === 1 || (layerRef && utils_1.utlis.getElementName(layerRef, constants_1.photoshopConstants.languages))) {
                !~this.modifiedIds.indexOf(key) && this.modifiedIds.push(key);
                yield this._generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/addPath.jsx"), { id: key });
            }
            yield this.setDuplicateMetaData(this.applySplitter(this.bufferMap.get(layerValue.buffer).parentName), key);
        });
    }
    setDuplicateMetaData(parentName, key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._generator.setLayerSettingsForPlugin({
                image: parentName
            }, key, this._pluginId + "Image");
        });
    }
    removeUnwantedLayers() {
        return __awaiter(this, void 0, void 0, function* () {
            const targetPath = this.assetsPath + "-assets";
            if (fs.existsSync(targetPath)) {
                fs.readdirSync(targetPath).forEach(fileName => {
                    this.removeFiles(targetPath + "/" + fileName);
                });
            }
        });
    }
    upperLevelUnwantedLayers() {
        return __awaiter(this, void 0, void 0, function* () {
            this.modelFactory.getPhotoshopModel().isDeletedFromLayout = true;
            const str = `var upperLevelLayers = app.activeDocument.layers; 
                     var layersCount = upperLevelLayers.length;
                     for(var i=0;i<layersCount;i++) {
                          if(!~upperLevelLayers[i].name.search(/(desktop|landscape|portrait)/)) {
                               upperLevelLayers[i].remove();
                          }         
                     }`;
            yield this._generator.evaluateJSXString(str);
        });
    }
    removeFiles(targetPath) {
        const path = targetPath + "/" + constants_1.photoshopConstants.common;
        if (!fs.existsSync(path)) {
            return;
        }
        fs.readdirSync(path).forEach(fileName => {
            if (~fileName.search(/(Animation)/)) {
                utils_1.utlis.removeFile(path + "/" + fileName);
            }
        });
    }
    modifyJSON(resultLayers) {
        resultLayers.forEach(item => {
            if (!item.layers) {
                return;
            }
            if (item.name === constants_1.photoshopConstants.views.freeGame) {
                const freeGameLayers = item.layers;
                const symbolRef = freeGameLayers.find(itemFG => {
                    if (itemFG.name === constants_1.photoshopConstants.generatorButtons.symbols) {
                        return true;
                    }
                });
                if (symbolRef) {
                    symbolRef.name += constants_1.photoshopConstants.fg;
                }
            }
            else if (item.layers) {
                this.modifyJSON(item.layers);
            }
        });
    }
    modifyBottomBar(resultLayers) {
        resultLayers.forEach(item => {
            if (item.name === constants_1.photoshopConstants.views.baseGame) {
                const freeGameLayers = item.layers;
                const symbolRef = freeGameLayers.find(itemFG => {
                    if (itemFG.name === constants_1.photoshopConstants.buttonsContainerBg) {
                        return true;
                    }
                });
                if (symbolRef) {
                    symbolRef.name = constants_1.photoshopConstants.buttonsContainer;
                }
            }
            else if (item.layers) {
                this.modifyBottomBar(item.layers);
            }
        });
    }
    removeDuplicates(layers) {
        for (let item of layers) {
            if (item.name === constants_1.photoshopConstants.common) {
                this.handleCommonLayers(item);
                break;
            }
            if (item.layers) {
                this.removeDuplicates(item.layers);
            }
        }
    }
    handleCommonLayers(item) {
        const commonLayers = item.layers;
        commonLayers && commonLayers.forEach(view => {
            view.layers && this.handleViewDuplicates(view.layers, null);
        });
    }
    handleViewDuplicates(viewLayers, uiMap) {
        uiMap = uiMap || [];
        viewLayers.forEach(item => {
            if (item.type === "layerSection" && !(item.generatorSettings && item.generatorSettings[this._pluginId])
                && utils_1.utlis.isNotContainer(item, this._activeDocument, this.result.layers, this._pluginId)) {
                return;
            }
            if (~uiMap.indexOf(item.name)) {
                const sequence = this.getCorrectSequence(uiMap, item.name, 1);
                uiMap.push(item.name + sequence);
                item.name = item.name + sequence;
            }
            else {
                uiMap.push(item.name);
            }
            // //Mocking a text layer as it does not have generator setting by default.
            // if(item.type === "textLayer") {
            //     utlis.putComponentInGeneratorSettings(item, this._pluginId, "label");
            //
            // }
            // if(item.type === "layerSection") {
            //     utlis.putComponentInGeneratorSettings(item, this._pluginId, "container");
            // }
            // if(item.type === "layer") {
            //     utlis.putComponentInGeneratorSettings(item, this._pluginId, "image");
            // }
            // if(item.generatorSettings && item.generatorSettings[this._pluginId]) {
            //     const genSettings = item.generatorSettings[this._pluginId].json;
            //     if(!uiMap.hasOwnProperty(genSettings)) {
            //         uiMap[genSettings] = [];
            //         uiMap[genSettings].push(item.name);
            //     } else {
            //         if(~uiMap[genSettings].indexOf(item.name)) {
            //
            //         } else {
            //             uiMap[genSettings].push(item.name);
            //         }
            //     }
            // }
            if (item.layers) {
                this.handleViewDuplicates(item.layers, uiMap);
            }
        });
    }
    getCorrectSequence(uiArray, name, count) {
        if (~uiArray.indexOf(name + count)) {
            return this.getCorrectSequence(uiArray, name, ++count);
        }
        else {
            return count;
        }
    }
    emitStopStatus() {
        this.docEmitter.emit(constants_1.photoshopConstants.logger.logStatus, "Layout Generation done");
    }
}
exports.CreateLayoutStructure = CreateLayoutStructure;
//# sourceMappingURL=CreateLayoutStructure.js.map