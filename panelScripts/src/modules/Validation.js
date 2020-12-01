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
exports.Validation = void 0;
const utils_1 = require("../utils/utils");
const path = require("path");
const constants_1 = require("../constants");
let languagesJson = require("../res/languages.json");
class Validation {
    constructor(modelFactory) {
        this.alreadyRenamed = [];
        this.modelFactory = modelFactory;
        this.layersErrorData = this.modelFactory.getPhotoshopModel().allLayersErrorData;
    }
    ;
    execute(params) {
        this.generator = params.generator;
        this.docEmitter = params.docEmitter;
        this.activeDocument = params.activeDocument;
        this.subscribeListeners();
    }
    subscribeListeners() {
        this.generator.on(constants_1.photoshopConstants.generator.layerRenamed, (eventLayers) => __awaiter(this, void 0, void 0, function* () { return yield this.onLayersRename(eventLayers); }));
        this.generator.on(constants_1.photoshopConstants.generator.layersDeleted, eventLayers => this.onLayersDeleted(eventLayers));
        this.generator.on(constants_1.photoshopConstants.generator.layersAdded, eventLayers => this.waitForDocumentResolution(eventLayers));
        this.generator.on(constants_1.photoshopConstants.generator.layersAdded, eventLayers => this.checkForNumericName(eventLayers));
        this.generator.on(constants_1.photoshopConstants.generator.layersMoved, eventLayers => this.waitForDocumentResolution(eventLayers));
        this.docEmitter.on(constants_1.photoshopConstants.emitter.layersMovedMock, eventLayers => this.onLayersLocalised(eventLayers, true));
    }
    checkForNumericName(eventLayers) {
        utils_1.utlis.traverseAddedLayers(eventLayers, this.isNumericInAdded.bind(this));
    }
    isNumericInAdded(item) {
        try {
            this.isNumeric(item.name, item.id);
        }
        catch (err) {
            console.log(err);
        }
    }
    isInHTML(key, id, questArray, drawnQuestItems) {
        if (~questArray.indexOf(key) && !utils_1.utlis.isIDExists(id, drawnQuestItems) && !~this.alreadyRenamed.indexOf(id)) {
            this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, `Not allowed to create HTML Container, ${key} with id = ${id}`);
            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), { id: id });
            throw new Error("Validation Stopped");
        }
        return this;
    }
    onLayersRename(eventLayers) {
        return __awaiter(this, void 0, void 0, function* () {
            const questArray = this.modelFactory.getPhotoshopModel().allQuestItems;
            const drawnQuestItems = this.modelFactory.getPhotoshopModel().allDrawnQuestItems;
            yield this.startValidationSequence(eventLayers, questArray, drawnQuestItems);
            this.isErrorFree(eventLayers, this.errorFreeFromRename.bind(this));
        });
    }
    onLayersDeleted(eventLayers) {
        this.isErrorFree(eventLayers, this.errorFreeFromDeletion.bind(this));
    }
    waitForDocumentResolution(eventLayers, isOmit) {
        this.generator.once(constants_1.photoshopConstants.generator.documentResolved, () => this.onLayersLocalised(eventLayers, isOmit));
    }
    onLayersLocalised(eventLayers, isOmit) {
        return __awaiter(this, void 0, void 0, function* () {
            const localisationStructure = this.modelFactory.getPhotoshopModel().docLocalisationStruct;
            const langIds = localisationStructure && Object.keys(localisationStructure);
            if (!langIds) {
                return;
            }
            for (let langId of langIds) {
                const langRef = utils_1.utlis.isIDExistsRec(langId, eventLayers);
                if (langRef) {
                    const langStructArray = [];
                    this.createLangStructArray(langStructArray, eventLayers, langRef);
                    const langStructArrays = utils_1.utlis.breakArrayOnTrue(langStructArray);
                    for (let langArray of langStructArrays) {
                        this.modifyLangArray(langArray);
                        const compareStruct = this.makeCompareStruct(langArray);
                        yield this.compareLocalisation(compareStruct, localisationStructure, langRef.id, isOmit);
                    }
                }
            }
        });
    }
    modifyLangArray(langArray) {
        const langId = langArray[0];
        const langIdRef = this.activeDocument.layers.findLayer(langId);
        if (!(~languagesJson["languages"].indexOf(langIdRef.layer.name))) {
            const actualLangId = langIdRef.layer.group.id;
            langArray.unshift(actualLangId);
        }
    }
    createLangStructArray(langStructArray, eventLayers, langRef) {
        eventLayers.forEach(layer => {
            if (layer.id > langRef.id) {
                langStructArray.push(layer.id);
            }
            if (layer.layers) {
                this.createLangStructArray(langStructArray, layer.layers, langRef);
            }
            else {
                langStructArray.push(true);
            }
        });
    }
    makeCompareStruct(langStructArray) {
        const localisedObj = this.interpretLocalisedStruct(langStructArray);
        const localisedLayers = localisedObj.localised;
        const localisedStruct = localisedObj.struct;
        return {
            langId: langStructArray[0],
            localisedLayers: localisedLayers,
            localisedStruct: localisedStruct
        };
    }
    interpretLocalisedStruct(langStructArray) {
        const langStructLength = langStructArray.length;
        let trueIndex = langStructLength + 1;
        const localisedArray = [];
        const structArray = [];
        for (let index in langStructArray) {
            if (langStructArray[index] === true) {
                trueIndex = index;
                break;
            }
        }
        for (let i = trueIndex - 1; i < langStructLength; i = i + 2) {
            localisedArray.push(langStructArray[i]);
        }
        for (let i = 1; i <= trueIndex - 2; i++) {
            structArray.push(langStructArray[i]);
        }
        return {
            localised: localisedArray,
            struct: structArray
        };
    }
    compareLocalisation(compareStruct, localisationStructure, langId, isOmit) {
        return __awaiter(this, void 0, void 0, function* () {
            const langRef = this.activeDocument.layers.findLayer(compareStruct.langId);
            if (!langRef) {
                return;
            }
            const langName = langRef.layer.name;
            const toCompareWith = localisationStructure[langId][langName];
            for (let item of compareStruct.localisedLayers) {
                const localisedRef = this.activeDocument.layers.findLayer(item);
                if (!localisedRef && item === 100000) {
                    const localisedObj = yield this.showLocalisationWarning(compareStruct.localisedStruct, langId, langName);
                    this.docEmitter.emit(constants_1.photoshopConstants.emitter.layersLocalised, localisedObj);
                    return;
                }
                if (!localisedRef) {
                    return;
                }
                this.compareFromLocalisedName(localisedRef, toCompareWith, compareStruct.localisedStruct, langId, langName, isOmit);
            }
        });
    }
    compareFromLocalisedName(localisedRef, toCompareWith, compareStruct, langId, langName, isOmit) {
        const compareArray = [];
        for (let key in toCompareWith) {
            if (!toCompareWith.hasOwnProperty(key)) {
                continue;
            }
            const struct = toCompareWith[key]["struct"];
            const structNames = this.getStructNames(struct);
            const compareStructNames = this.getCompareStructNames(compareStruct);
            if (utils_1.utlis.containAll(structNames, compareStructNames).isTrue) {
                const localisedCompare = this.activeDocument.layers.findLayer(toCompareWith[key]["localise"]);
                const localisedCompareName = localisedCompare.layer.name;
                const localisedCompareId = localisedCompare.layer.id;
                if (localisedCompareName !== localisedRef.layer.name) {
                    compareArray.push({ isTrue: false });
                }
                else {
                    compareArray.push({ isTrue: true, id: localisedCompareId });
                }
            }
        }
        for (let item of compareArray) {
            if (item.isTrue === true) {
                console.log("Same Image Entered");
                this.docEmitter.emit(constants_1.photoshopConstants.emitter.layersLocalised, {
                    toBeLocalised: [],
                    notToBeLocalised: [item.id]
                });
                return;
            }
        }
        this.checkImageStatus(localisedRef, compareStruct, langId, langName, isOmit);
    }
    getStructNames(struct) {
        const structNames = [];
        for (let item of struct) {
            structNames.push(item.name);
        }
        return structNames;
    }
    getCompareStructNames(compareStruct) {
        const compareStructNames = [];
        for (let item of compareStruct) {
            const layerName = this.activeDocument.layers.findLayer(item).layer.name;
            compareStructNames.push(layerName);
        }
        return compareStructNames;
    }
    checkImageStatus(localisedRef, compareStruct, langId, langName, isOmit) {
        return __awaiter(this, void 0, void 0, function* () {
            const localisedId = localisedRef.layer.id;
            if (isOmit) {
                const localisedObj = yield this.showLocalisationWarning(compareStruct, langId, langName);
                this.docEmitter.emit(constants_1.photoshopConstants.emitter.layersLocalised, localisedObj);
                return;
            }
            if (this.isInvalidImage(compareStruct, langId, langName)) {
                this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, "Can't enter new image without localising old ones");
                this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), { id: localisedId });
            }
            if (this.isLocalisationSafe(compareStruct, langId, langName)) {
                console.log("add without any issues");
            }
            else {
                this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), { id: localisedId });
                this.showLocalisationWarning(compareStruct, langId, langName);
            }
        });
    }
    isInvalidImage(compareStruct, langId, langName) {
        const localisedLayers = this.getLocalisedLayers(compareStruct, langId, langName).localisedLayers;
        const localisingLayers = this.getLocalisingLayers(compareStruct);
        return !utils_1.utlis.containAll(localisedLayers, localisingLayers).isTrue;
    }
    isLocalisationSafe(compareStruct, langId, langName) {
        const localisedLayers = this.getLocalisedLayers(compareStruct, langId, langName).localisedLayers;
        const localisingLayers = this.getLocalisingLayers(compareStruct);
        return utils_1.utlis.containAll(localisedLayers, localisingLayers).isTrue && (localisingLayers.length > localisedLayers.length);
    }
    showLocalisationWarning(compareStruct, langId, langName) {
        return __awaiter(this, void 0, void 0, function* () {
            const localisedObj = this.getLocalisedLayers(compareStruct, langId, langName);
            const localisingLayers = this.getLocalisingLayers(compareStruct);
            const containObj = utils_1.utlis.containAll(localisedObj.localisedLayers, localisingLayers);
            const toBeLocalised = [];
            const notToBeLocalised = [];
            if (!containObj.isTrue) {
                const delocalisedLayers = containObj.delocalisedLayers;
                for (let name of delocalisedLayers) {
                    const indexName = localisedObj.localisedLayers.indexOf(name);
                    const id = localisedObj.localisedLayersIds[indexName];
                    const response = yield this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/ShowOptionPanel.jsx"), { name: name });
                    if (response === "no") {
                        const langStruct = this.modelFactory.getPhotoshopModel().docLocalisationStruct;
                        const langObj = langStruct[langId][langName];
                        let deletionKey;
                        for (let item in langObj) {
                            if (!langObj.hasOwnProperty(item)) {
                                continue;
                            }
                            if (langObj[item]["localise"] === id) {
                                deletionKey = item;
                                break;
                            }
                        }
                        delete langObj[deletionKey];
                        notToBeLocalised.push(id);
                        const deletedLayers = [];
                        this.deleteLocalisedStructFromPhotoshop(compareStruct[compareStruct.length - 1], null, deletedLayers);
                        this.deleteLayersFromPhotoshop(deletedLayers);
                    }
                    else if (response === "yes") {
                        toBeLocalised.push(id);
                    }
                }
            }
            return {
                toBeLocalised: toBeLocalised,
                notToBeLocalised: notToBeLocalised
            };
        });
    }
    getLocalisingLayers(compareStruct) {
        const localisingLayers = [];
        const compLocalisedLength = compareStruct.length;
        const localisationContainerId = compareStruct[compLocalisedLength - 1];
        const containerRef = this.activeDocument.layers.findLayer(localisationContainerId);
        const localisingPhotoshopLayers = containerRef && containerRef.layer.layers;
        for (let item of localisingPhotoshopLayers) {
            localisingLayers.push(item.name);
        }
        return localisingLayers;
    }
    getLocalisedLayers(compareStruct, langId, langName) {
        const localisedLayers = [];
        const localisedLayersIds = [];
        const localisationStructure = this.modelFactory.getPhotoshopModel().docLocalisationStruct;
        const langStruct = localisationStructure[langId][langName];
        for (let item in langStruct) {
            if (!langStruct.hasOwnProperty(item)) {
                continue;
            }
            const struct = langStruct[item]["struct"];
            const structNames = this.getStructNames(struct);
            const compareStructNames = this.getCompareStructNames(compareStruct);
            if (utils_1.utlis.containAll(structNames, compareStructNames).isTrue) {
                const localisedLayerId = langStruct[item]["localise"];
                const localisedLayerName = this.activeDocument.layers.findLayer(localisedLayerId).layer.name;
                localisedLayers.push(localisedLayerName);
                localisedLayersIds.push(localisedLayerId);
            }
        }
        return {
            localisedLayers: localisedLayers,
            localisedLayersIds: localisedLayersIds
        };
    }
    deleteLocalisedStructFromPhotoshop(lastId, previousId, deletedLayers) {
        const lastIdRef = this.activeDocument.layers.findLayer(lastId);
        if (~languagesJson.languages.indexOf(lastIdRef.layer.name)) {
            deletedLayers.push(lastIdRef.layer.id);
            return;
        }
        if (!(lastIdRef.layer.layers && lastIdRef.layer.layers.length)) {
            deletedLayers.push(lastId);
            lastIdRef.layer.group && this.deleteLocalisedStructFromPhotoshop(lastIdRef.layer.group.id, lastId, deletedLayers);
        }
        else {
            if (!utils_1.utlis.isLayerExists(lastIdRef, previousId)) {
                deletedLayers.push(lastId);
                previousId = lastId;
                lastIdRef.layer.group && this.deleteLocalisedStructFromPhotoshop(lastIdRef.layer.group.id, previousId, deletedLayers);
            }
        }
    }
    deleteLayersFromPhotoshop(deletedLayers) {
        for (let item of deletedLayers) {
            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), { id: item });
        }
    }
    startValidationSequence(eventLayers, questArray, drawnQuestItems) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (yield this.drawnQuestItemsRenamed(eventLayers[0].name, eventLayers[0].id, drawnQuestItems))
                    .isInHTML(eventLayers[0].name, eventLayers[0].id, questArray, drawnQuestItems)
                    .isNumeric(eventLayers[0].name, eventLayers[0].id);
            }
            catch (err) {
                console.log("Validation Stopped");
            }
        });
    }
    drawnQuestItemsRenamed(name, id, drawnQuestItems) {
        return __awaiter(this, void 0, void 0, function* () {
            const selectedIdPrevName = this.modelFactory.getPhotoshopModel().selectedName;
            const layerId = this.modelFactory.getPhotoshopModel().selectedNameId;
            if (this.modelFactory.getPhotoshopModel().isRemoval) {
                if (this.modelFactory.getPhotoshopModel().lastRemovalId === Number(id)) {
                    this.modelFactory.getPhotoshopModel().isRemoval = false;
                }
                throw new Error("Validation Stop");
            }
            if (this.modelFactory.getPhotoshopModel().isRenamedFromLayout) {
                if (this.modelFactory.getPhotoshopModel().lastRename === Number(id)) {
                    this.modelFactory.getPhotoshopModel().isRenamedFromLayout = false;
                }
                return this;
            }
            const layerRef = this.activeDocument.layers.findLayer(Number(layerId));
            const questItem = drawnQuestItems.find(item => {
                if (item.id === id && item.name !== name) {
                    return true;
                }
            });
            if (questItem && questItem.name !== "generic") {
                this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, `Not allowed to rename Quest Item, ${questItem.name} with id = ${id}`);
                this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/UndoRenamedLayer.jsx"), { id: questItem.id, name: questItem.name });
                throw new Error("Validation Stop");
            }
            if (utils_1.utlis.getElementName(layerRef, constants_1.photoshopConstants.languages)) {
                if (selectedIdPrevName != name) {
                    this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, `Can't rename an item inside languages`);
                    this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/UndoRenamedLayer.jsx"), { id: layerRef.layer.id, name: selectedIdPrevName });
                }
                throw new Error("Validation Stop");
            }
            return this;
        });
    }
    isNumeric(name, id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (~name.search(/^[\W\d_]+/)) {
                yield this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/UndoRenamedLayer.jsx"), { id: id, name: "Special-" + name });
                throw new Error("Validation Stop");
            }
            return this;
        });
    }
    isErrorFree(eventLayers, callback) {
        const errorData = callback(eventLayers);
        for (let errorElm of errorData) {
            utils_1.utlis.spliceFrom(errorElm.id, this.layersErrorData);
            this.docEmitter.emit(constants_1.photoshopConstants.logger.removeError, errorElm.id);
        }
    }
    errorFreeFromRename(eventLayers) {
        return this.layersErrorData.filter(item => {
            if (item.id === eventLayers[0].id && !~eventLayers[0].name.search(/(Error)/)) {
                return true;
            }
        });
    }
    errorFreeFromDeletion(eventLayers) {
        return this.layersErrorData.filter(item => {
            const isInDeletedLayers = utils_1.utlis.isIDExists(item.id, eventLayers);
            if (isInDeletedLayers) {
                return true;
            }
        });
    }
}
exports.Validation = Validation;
//# sourceMappingURL=Validation.js.map