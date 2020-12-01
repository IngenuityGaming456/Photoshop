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
exports.CreateLocalisationStructure = void 0;
const layerClass = require("../../lib/dom/layer.js");
const path = require("path");
const utils_1 = require("../utils/utils");
const constants_1 = require("../constants");
let packageJson = require("../../package.json");
let languagesStruct = require("../res/languages");
class CreateLocalisationStructure {
    constructor(modelFactory) {
        this.recordedResponse = [];
        this.modelFactory = modelFactory;
    }
    execute(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this._generator = params.generator;
            this._activeDocument = params.activeDocument;
            this.documentManager = params.storage.documentManager;
            this.docEmitter = params.docEmitter;
            yield this.updateActiveDocument();
            this.recordedResponse = this.modelFactory.getPhotoshopModel().allRecordedResponse;
            const idsArray = yield this.modifySelectedResponse(yield this.findSelectedLayers());
            this.getParents(idsArray);
        });
    }
    updateActiveDocument() {
        return __awaiter(this, void 0, void 0, function* () {
            this._activeDocument = yield this.documentManager.getDocument(this._activeDocument.id);
        });
    }
    findSelectedLayers() {
        return __awaiter(this, void 0, void 0, function* () {
            let selectedLayersString = yield this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/SelectedLayersIds.jsx"));
            return selectedLayersString.toString().split(",");
        });
    }
    modifySelectedResponse(idsArray) {
        return __awaiter(this, void 0, void 0, function* () {
            const toSpliceIndexes = [];
            for (let item of idsArray) {
                const genSettings = yield this._generator.getLayerSettingsForPlugin(this._activeDocument.id, Number(item), packageJson.name);
                if (genSettings === "button") {
                    toSpliceIndexes.push(idsArray.indexOf(item));
                    const button = this._activeDocument.layers.findLayer(Number(item));
                    this.modifyIdsArray(button.layer, idsArray);
                    utils_1.utlis.spliceFromIndexes(idsArray, toSpliceIndexes);
                }
            }
            return idsArray;
        });
    }
    modifyIdsArray(button, idsArray) {
        button.layers.forEach(item => {
            if (item.layers) {
                item.layers.forEach(itemL => {
                    if (idsArray.indexOf(itemL.id.toString()) === -1) {
                        idsArray.push(itemL.id.toString());
                    }
                });
            }
        });
    }
    getParents(idsArray) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!idsArray.length) {
                this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, "Can't Localise an empty Button");
                return;
            }
            const idsMap = new Map();
            for (let item of idsArray) {
                let parents = [];
                this.getParentStack(null, this._activeDocument.layers.layers, Number(item), parents);
                idsMap.set(Number(item), parents);
            }
            yield this.drawLayers(idsMap);
        });
    }
    getParentStack(parent, layers, id, parentStack) {
        parentStack = parentStack || [];
        const isExist = layers.some(item => {
            if (item instanceof layerClass.LayerGroup) {
                return this.getParentStack(item, item.layers, id, parentStack);
            }
            if (item.id === id) {
                return true;
            }
        });
        if (isExist && parent) {
            parentStack.push({ name: parent.name, id: parent.id });
            return true;
        }
        return false;
    }
    drawLayers(idsMap) {
        return __awaiter(this, void 0, void 0, function* () {
            const idsMapKeys = [...idsMap.keys()];
            const idsMapValues = [...idsMap.values()];
            const langId = this.findLanguageId(idsMapValues);
            if (!langId) {
                return;
            }
            this.filterMapValues(idsMapValues);
            const localisationStructure = this.modelFactory.getPhotoshopModel().docLocalisationStruct;
            const alreadyLocalised = [];
            this.getAlreadyLocalisedArray(idsMapKeys, localisationStructure, alreadyLocalised, null);
            const params = {
                languages: languagesStruct.languages,
                ids: idsMapKeys,
                values: idsMapValues,
                langId: langId,
                recordedResponse: this.recordedResponse,
                alreadyLocalised: alreadyLocalised
            };
            this.docEmitter.emit(constants_1.photoshopConstants.localisation, idsMapKeys);
            const response = yield this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/ShowPanel.jsx"), params);
            yield this.handleResponse(response);
            response.length && this.createLocalisationStruct(idsMapKeys, idsMapValues, langId, response);
        });
    }
    getAlreadyLocalisedArray(idsMapKeys, localisationLayers, alreadyLocalised, langName) {
        if (!localisationLayers) {
            return;
        }
        for (let item in localisationLayers) {
            if (!localisationLayers.hasOwnProperty(item)) {
                continue;
            }
            if (~languagesStruct["languages"].indexOf(item)) {
                langName = item;
            }
            if (localisationLayers[item].localise) {
                if (~idsMapKeys.indexOf(localisationLayers[item].localise)) {
                    const idKeyObj = utils_1.utlis.hasKey(alreadyLocalised, localisationLayers[item].localise);
                    if (!idKeyObj) {
                        alreadyLocalised.push({
                            [localisationLayers[item].localise]: [langName]
                        });
                    }
                    else {
                        idKeyObj[localisationLayers[item].localise].push(langName);
                    }
                }
                return;
            }
            this.getAlreadyLocalisedArray(idsMapKeys, localisationLayers[item], alreadyLocalised, langName);
        }
    }
    createLocalisationStruct(mapKeys, mapValues, langId, response) {
        const localiseStruct = this.modelFactory.getPhotoshopModel().docLocalisationStruct || {};
        utils_1.utlis.addKeyToObject(localiseStruct, langId);
        const responseArray = response.split(":");
        responseArray.forEach(response => {
            utils_1.utlis.addKeyToObject(localiseStruct[langId], response.split(",")[0]);
            const responseId = localiseStruct[langId][response.split(",")[0]];
            if (response.split(",")[1] === "null") {
                return;
            }
            mapKeys.forEach((mapItem, index) => {
                const nextAvailableIndex = utils_1.utlis.getNextAvailableIndex(responseId, index);
                responseId[nextAvailableIndex] = {};
                responseId[nextAvailableIndex]["localise"] = mapItem;
                responseId[nextAvailableIndex]["struct"] = mapValues[index];
            });
        });
        this.modelFactory.getPhotoshopModel().docLocalisationStruct = localiseStruct;
    }
    handleResponse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const responseArray = response.split(":");
            for (let item of responseArray) {
                const responseSubArray = utils_1.utlis.makeResponse(item.split("-1"));
                this.recordedResponse.push(responseSubArray[0][0]);
                yield this._generator.setLayerSettingsForPlugin(constants_1.photoshopConstants.generatorIds.lang, Number(responseSubArray[0][1]), packageJson.name);
                responseSubArray[0].splice(0, 2);
                yield this.handleSubResponses(responseSubArray);
            }
        });
    }
    handleSubResponses(responseSubArray) {
        return __awaiter(this, void 0, void 0, function* () {
            const viewIds = [];
            const buttonIds = [];
            const responseLength = responseSubArray.length;
            for (let i = 0; i < responseLength; i++) {
                const subArray = responseSubArray[i];
                if (!~viewIds.indexOf(Number[subArray[0]])) {
                    yield this._generator.setLayerSettingsForPlugin(constants_1.photoshopConstants.generatorIds.view, Number(subArray[0]), packageJson.name);
                }
                if ((i + 1) < responseLength && utils_1.utlis.isButton(subArray[i], subArray[i + 1])
                    && !~buttonIds.indexOf(Number[subArray[subArray.length - 2]])) {
                    yield this._generator.setLayerSettingsForPlugin(constants_1.photoshopConstants.generatorIds.button, Number(subArray[subArray.length - 2]), packageJson.name);
                }
            }
        });
    }
    findLanguageId(idsMapValues) {
        const docLayers = this._activeDocument.layers;
        const parent = idsMapValues[0].find(item => {
            if (item.name.search(/(desktop|portrait|landscape)/) !== -1) {
                return true;
            }
        });
        if (!this.safeToLocalise(parent, idsMapValues)) {
            return null;
        }
        const parentRef = docLayers.findLayer(parent.id);
        const languagesRef = parentRef.layer.layers.find(item => {
            if (item.name === constants_1.photoshopConstants.languages) {
                return true;
            }
        });
        return languagesRef.id;
    }
    safeToLocalise(parent, idsMapValues) {
        if (!parent) {
            this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, "Can't Localise a container");
            return false;
        }
        const langItem = idsMapValues[0].find(item => {
            if (item.name.search(/(languages)/) !== -1) {
                return true;
            }
        });
        if (langItem) {
            this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, "Can't Localise an already localised layer");
            return false;
        }
        return true;
    }
    filterMapValues(filterArray) {
        filterArray.forEach(item => {
            let keyIndex;
            item.forEach((key, index) => {
                if (key.name === constants_1.photoshopConstants.common) {
                    keyIndex = index;
                }
            });
            if (keyIndex) {
                item.splice(keyIndex);
                item.reverse();
            }
        });
    }
}
exports.CreateLocalisationStructure = CreateLocalisationStructure;
//# sourceMappingURL=CreateLocalisationStructure.js.map