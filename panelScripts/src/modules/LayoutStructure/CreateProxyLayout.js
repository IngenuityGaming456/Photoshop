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
exports.CreateProxyLayout = void 0;
const utils_1 = require("../../utils/utils");
const path = require("path");
const ModelFactory_1 = require("../../models/ModelFactory");
const FactoryClass_1 = require("../FactoryClass");
const CreateLayoutStructure_1 = require("./CreateLayoutStructure");
const constants_1 = require("../../constants");
let packageJson = require("../../../package.json");
class CreateProxyLayout {
    constructor(modelFactory) {
        this.artLayers = [];
        this.nameCache = [];
        this.errorData = [];
        this.bufferMap = new Map();
        this.modelFactory = modelFactory;
        this.errorData = this.modelFactory.getPhotoshopModel().allLayersErrorData;
    }
    execute(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.generator = params.generator;
            this.docEmitter = params.docEmitter;
            this.activeDocument = params.activeDocument;
            this.documentManager = params.storage.documentManager;
            this.imageState = params.storage.menuState;
            this.document = yield this.generator.getDocumentInfo(undefined);
            yield this.updateActiveDocument();
            yield this.modifyParentNames();
            this.checkLayers();
            this.checkImageFolder();
            yield this.checkLocalisationStruct();
            this.checkIsLayoutSuccessful();
        });
    }
    updateActiveDocument() {
        return __awaiter(this, void 0, void 0, function* () {
            this.activeDocument = yield this.documentManager.getDocument(this.activeDocument.id);
        });
    }
    modifyParentNames() {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.utlis.traverseObject(this.document.layers, this.getAllArtLayers.bind(this));
            this.artLayers.reverse();
            yield this.modifyPaths();
        });
    }
    modifyPaths() {
        return __awaiter(this, void 0, void 0, function* () {
            const noOfArtLayers = this.artLayers.length;
            const layerMap = new Map();
            let keyPixmap, generatorJson;
            for (let i = 0; i < noOfArtLayers; i++) {
                generatorJson = this.artLayers[i].generatorSettings[packageJson.name];
                if (!generatorJson) {
                    this.logError(this.artLayers[i].id, this.artLayers[i].name, `${this.artLayers[i].name} has no Generator Settings. Delete and ReTry`);
                    continue;
                }
                keyPixmap = JSON.parse(generatorJson.json);
                const layerObj = {
                    buffer: keyPixmap.pixels,
                    frequency: 1,
                    name: this.artLayers[i].name,
                    parentName: ""
                };
                layerMap.set(this.artLayers[i].id, layerObj);
                this.bufferMap.set(layerObj.buffer, {
                    freq: 0,
                    parentName: "",
                });
            }
            yield this.getBufferFrequency(layerMap);
        });
    }
    getBufferFrequency(layerMap) {
        return __awaiter(this, void 0, void 0, function* () {
            this.layerMap = layerMap;
            const layerMapKeys = layerMap.keys();
            for (let key of layerMapKeys) {
                const value = layerMap.get(key);
                let bufferObj = this.bufferMap.get(value.buffer);
                bufferObj.freq++;
                value.frequency = bufferObj.freq;
                yield this.modifyPathNames(value, key, bufferObj);
            }
        });
    }
    getAllArtLayers(artLayerRef) {
        this.artLayers.push(artLayerRef);
    }
    modifyPathNames(value, key, bufferObj) {
        return __awaiter(this, void 0, void 0, function* () {
            if (value.frequency === 1) {
                bufferObj.parentName = value.name;
                yield this.setToNameCache(value.name, key);
            }
        });
    }
    setToNameCache(layerName, key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!~this.nameCache.indexOf(layerName)) {
                this.nameCache.push(layerName);
            }
            else {
                const layerRef = this.activeDocument.layers.findLayer(key);
                if (utils_1.utlis.getElementName(layerRef, constants_1.photoshopConstants.languages)) {
                    return;
                }
                this.logError(key, layerName, `Error in name of ${layerName} with id ${key}`);
                yield this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/addErrorPath.jsx"), { id: key });
            }
        });
    }
    checkLayers() {
        utils_1.utlis.traverseObject(this.document.layers, undefined, this.inspectLayers.bind(this));
    }
    inspectLayers(layerSec) {
        const type = utils_1.utlis.getGenSettings(layerSec, packageJson.name);
        if (type === "symbol") {
            this.checkIfStaticEmpty(layerSec);
        }
        if (type === "bitmap" || type === "meter") {
            this.isEmpty(layerSec, `${layerSec.name} is empty`);
        }
    }
    checkIfStaticEmpty(item) {
        if (item.type === "layerSection") {
            item.layers && item.layers.forEach(itemS => {
                if (itemS.name === constants_1.photoshopConstants.static) {
                    this.isEmpty(itemS, `Symbol with name ${item.name} has empty Static folder`);
                }
            });
        }
    }
    isEmpty(itemS, message) {
        if (!itemS.layers) {
            this.logError(itemS.id, itemS.name, message);
        }
        else {
            this.removeError(itemS.id);
        }
    }
    checkImageFolder() {
        this.assetsPath = this.getPath();
        if (!this.isPluginEnabled() && ~__dirname.search("Generator")) {
            this.logError(1001, "", "Image Assets plugin is not on.");
        }
        else {
            this.removeError(1001);
        }
    }
    isPluginEnabled() {
        return this.imageState.state;
    }
    checkLocalisationStruct() {
        return __awaiter(this, void 0, void 0, function* () {
            const localisationStruct = this.modelFactory.getPhotoshopModel().docLocalisationStruct;
            if (!localisationStruct) {
                return;
            }
            const langIds = localisationStruct && Object.keys(localisationStruct);
            for (let id of langIds) {
                const idRef = this.activeDocument.layers.findLayer(Number(id));
                yield this.createLocalisationResponse(idRef);
            }
        });
    }
    createLocalisationResponse(idRef) {
        return __awaiter(this, void 0, void 0, function* () {
            const platformId = idRef.layer.group.id;
            const wholeHierarchyStruct = [];
            this.getHierarchyStructure(idRef.layer.layers, [], wholeHierarchyStruct);
            yield this.sendLocalisationResponse(platformId, idRef.layer.id, wholeHierarchyStruct);
        });
    }
    getHierarchyStructure(idLayers, hierarchyStruct, wholeHierarchy) {
        let hierarchyClone = [];
        for (let item of idLayers) {
            if (item.layers) {
                hierarchyClone = [...hierarchyStruct];
                hierarchyClone.push(item.id);
                if (!item.layers.length) {
                    hierarchyClone.push(100000);
                    hierarchyClone.push(true);
                    break;
                }
                this.getHierarchyStructure(item.layers, hierarchyClone, wholeHierarchy);
            }
            else {
                hierarchyClone.push(item.id);
                hierarchyClone.push(true);
            }
        }
        if (~hierarchyClone.indexOf(true)) {
            hierarchyClone = [...hierarchyStruct, ...hierarchyClone];
            if (!~hierarchyClone.indexOf(100000)) {
                hierarchyClone.push(100000);
                hierarchyClone.push(true);
            }
            wholeHierarchy.push(hierarchyClone);
        }
    }
    sendLocalisationResponse(platfromId, langId, wholeHierarchyStruct) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let hierarchyStruct of wholeHierarchyStruct) {
                const hierarchyArray = [platfromId, langId, ...hierarchyStruct];
                const trueIndex = hierarchyArray.indexOf(true);
                const responseObj = {};
                this.createObjectResponse(hierarchyArray, 0, trueIndex - 2, responseObj);
                const response = [];
                response.push(responseObj);
                const isTrue = yield this.sendResponse(response);
                if (!isTrue) {
                    return;
                }
            }
        });
    }
    createObjectResponse(hierarchyArray, index, finalIndex, response) {
        response = response || {};
        if (index <= finalIndex) {
            response["id"] = hierarchyArray[index];
            response["layers"] = [];
            response["layers"][0] = {};
            if (index === finalIndex) {
                this.createObjectResponse(hierarchyArray, ++index, finalIndex, response["layers"]);
            }
            else {
                this.createObjectResponse(hierarchyArray, ++index, finalIndex, response["layers"][0]);
            }
        }
        else {
            let k = 0;
            for (let i = index; i < hierarchyArray.length - 1; i = i + 2) {
                response[k] = { id: hierarchyArray[i] };
                k++;
            }
        }
    }
    sendResponse(response) {
        return new Promise(resolve => {
            this.docEmitter.once(constants_1.photoshopConstants.emitter.layersLocalised, localisedLayers => {
                localisedLayers.toBeLocalised.forEach(id => {
                    this.logError(id, "local", "Need to localise the layer to continue");
                });
                localisedLayers.notToBeLocalised.forEach(id => {
                    this.removeError(id);
                });
                if (localisedLayers.toBeLocalised.length) {
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            });
            this.docEmitter.emit(constants_1.photoshopConstants.emitter.layersMovedMock, response);
        });
    }
    checkIsLayoutSuccessful() {
        if (!this.errorData.length) {
            this.initializeLayout();
        }
    }
    getPath() {
        const path = this.activeDocument.file;
        const extIndex = path.search(/\.(psd)/);
        return path.substring(0, extIndex);
    }
    initializeLayout() {
        const layout = FactoryClass_1.inject({ ref: CreateLayoutStructure_1.CreateLayoutStructure, dep: [ModelFactory_1.ModelFactory], isNonSingleton: true });
        FactoryClass_1.execute(layout, {
            storage: {
                layerMap: this.layerMap,
                bufferMap: this.bufferMap,
                assetsPath: this.assetsPath,
            }, generator: this.generator, activeDocument: this.activeDocument, docEmitter: this.docEmitter
        });
    }
    logError(id, name, errorType) {
        if (!utils_1.utlis.isIDExists(id, this.errorData)) {
            this.errorData.push({ id: id, name: name });
            this.docEmitter.emit(constants_1.photoshopConstants.logger.logError, id, name, errorType);
        }
    }
    removeError(id) {
        const beforeLength = this.errorData.length;
        utils_1.utlis.spliceFrom(id, this.errorData);
        const afterLength = this.errorData.length;
        if (beforeLength > afterLength) {
            this.docEmitter.emit(constants_1.photoshopConstants.logger.removeError, id);
        }
    }
}
exports.CreateProxyLayout = CreateProxyLayout;
//# sourceMappingURL=CreateProxyLayout.js.map