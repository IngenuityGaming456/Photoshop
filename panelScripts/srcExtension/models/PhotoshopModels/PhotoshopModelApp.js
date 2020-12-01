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
exports.PhotoshopModelApp = void 0;
const PhotoshopModel_1 = require("../../../src/models/PhotoshopModels/PhotoshopModel");
const path = require("path");
const constants_1 = require("../../../src/constants");
const utils_1 = require("../../../src/utils/utils");
const languages = require("../../../src/res/languages.json");
class PhotoshopModelApp extends PhotoshopModel_1.PhotoshopModel {
    constructor() {
        super(...arguments);
        this.sessionHandler = [];
        this.modifiedIds = [];
        this.recordedResponse = [];
        this.isFromLayout = false;
        this.renamedFromLayout = false;
        this.isRemovalOn = false;
        this.lastId = null;
        this.lastRenameId = null;
        this.localisationStruct = null;
        this.isAutomationOn = false;
        this.mappedIds = [];
    }
    execute(params) {
        super.execute(params);
    }
    subscribeListeners() {
        super.subscribeListeners();
        this.generator.on(constants_1.photoshopConstants.generator.layersDeleted, eventLayers => this.onLayersDeleted(eventLayers));
        this.generator.on("select", () => this.storeSelectedName());
        this.generator.on("select", () => this.storeSelectedIds());
    }
    onLayersDeleted(eventLayers) {
        const activeDocumentNonUpdated = Object.assign({}, this.activeDocument);
        eventLayers.forEach(deletedLayers => {
            const deletedRef = activeDocumentNonUpdated._layers.findLayer(deletedLayers.id);
            if (!deletedRef)
                return;
            if (utils_1.utlis.getElementName(deletedRef, constants_1.photoshopConstants.languages)) {
                const platformName = utils_1.utlis.getElementName(deletedRef, null);
                const platformRef = utils_1.utlis.getPlatformRef(platformName, this.activeDocument);
                const commonId = utils_1.utlis.getCommonId(platformRef);
                const commonRef = this.activeDocument.layers.findLayer(commonId);
                const mappedView = utils_1.utlis.getView(commonRef, deletedRef.layer.name);
                if (mappedView) {
                    this.deleteMappedViewFromLocalisationStruct(mappedView, this.localisationStruct);
                }
                else if (~languages["languages"].indexOf(deletedRef.layer.name)) {
                    this.deletedMappedLangIdFromLocalisationStruct(deletedRef.layer.name, this.localisationStruct);
                }
            }
        });
    }
    deleteMappedViewFromLocalisationStruct(mappedView, localisationLayers) {
        for (let item in localisationLayers) {
            if (!localisationLayers.hasOwnProperty(item)) {
                continue;
            }
            const localisedStruct = localisationLayers[item];
            if (localisedStruct.struct) {
                for (let structLayers of localisedStruct.struct) {
                    if (structLayers.id === mappedView) {
                        delete localisationLayers[item];
                        break;
                    }
                }
            }
            else {
                this.deleteMappedViewFromLocalisationStruct(mappedView, localisedStruct);
            }
        }
    }
    deletedMappedLangIdFromLocalisationStruct(deletedLangId, localisationLayers) {
        for (let item in localisationLayers) {
            if (!localisationLayers.hasOwnProperty(item)) {
                continue;
            }
            if (localisationLayers[item].localise) {
                return;
            }
            if (item === deletedLangId) {
                delete localisationLayers[item];
                return;
            }
            this.deletedMappedLangIdFromLocalisationStruct(deletedLangId, localisationLayers[item]);
        }
    }
    handleData() {
        super.handleData();
        this.localisationStruct = this.accessDocLocalisationStruct();
        this.modifiedIds = this.accessModifiedIds();
    }
    accessDocLocalisationStruct() {
        return this.subPhotoshopModel.accessDocLocalisationStruct();
    }
    accessModifiedIds() {
        return this.subPhotoshopModel.accessModifiedIds();
    }
    storeSelectedName() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isAutomationOn) {
                return;
            }
            yield Promise.resolve();
            let selectedLayersString = yield this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/SelectedLayers.jsx"));
            this.selectedIdName = selectedLayersString.toString().split(",")[0];
        });
    }
    storeSelectedIds() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isAutomationOn) {
                return;
            }
            yield Promise.resolve();
            let selectedLayersString = yield this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/SelectedLayersIds.jsx"));
            this.selectedId = selectedLayersString.toString().split(",")[0];
        });
    }
    getWriteData() {
        super.getWriteData();
        this.writeData["docLocalisationStruct"] = this.localisationStruct;
        this.writeData["modifiedIds"] = this.modifiedIds;
    }
    get selectedName() {
        return this.selectedIdName;
    }
    get selectedNameId() {
        return this.selectedId;
    }
    get allSessionHandler() {
        return this.sessionHandler;
    }
    get allModifiedIds() {
        return this.modifiedIds;
    }
    get allRecordedResponse() {
        return this.recordedResponse;
    }
    get isDeletedFromLayout() {
        return this.isFromLayout;
    }
    set isDeletedFromLayout(value) {
        this.isFromLayout = value;
    }
    set isRenamedFromLayout(value) {
        this.renamedFromLayout = value;
    }
    get isRenamedFromLayout() {
        return this.renamedFromLayout;
    }
    set isRemoval(value) {
        this.isRemovalOn = value;
    }
    get isRemoval() {
        return this.isRemovalOn;
    }
    set lastRemovalId(value) {
        this.lastId = value;
    }
    get lastRemovalId() {
        return this.lastId;
    }
    set lastRename(value) {
        this.lastRenameId = value;
    }
    get lastRename() {
        return this.lastRenameId;
    }
    set docLocalisationStruct(value) {
        this.localisationStruct = value;
    }
    get docLocalisationStruct() {
        return this.localisationStruct;
    }
    set automationOn(value) {
        this.isAutomationOn = value;
    }
    get automationOn() {
        return this.isAutomationOn;
    }
    setMappedIds(id) {
        this.mappedIds.push(id);
    }
    getMappedIds() {
        return this.mappedIds;
    }
}
exports.PhotoshopModelApp = PhotoshopModelApp;
//# sourceMappingURL=PhotoshopModelApp.js.map