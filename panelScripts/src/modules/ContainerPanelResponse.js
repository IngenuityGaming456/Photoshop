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
exports.ContainerPanelResponse = void 0;
const utils_1 = require("../utils/utils");
const constants_1 = require("../constants");
const cloneDeep = require('lodash/cloneDeep.js');
class ContainerPanelResponse {
    constructor(modelFactory, photoshopFactory) {
        this.platformArray = [];
        this.deletionHandler = [];
        this.modelFactory = modelFactory;
        this.photoshopFactory = photoshopFactory;
    }
    execute(params) {
        this.platformArray = this.modelFactory.getPhotoshopModel().allQuestPlatforms;
        this.deletionHandler = this.modelFactory.getPhotoshopModel().allSessionHandler;
        this.generator = params.generator;
        this.docEmitter = params.docEmitter;
        this.activeDocument = params.activeDocument;
        this.documentManager = params.storage.documentManager;
        this.subscribeListeners();
        this.isReady();
    }
    subscribeListeners() {
        this.generator.on(constants_1.photoshopConstants.generator.layersDeleted, (eventLayers) => this.onLayersDeleted(eventLayers));
        this.docEmitter.on(constants_1.photoshopConstants.emitter.handleSocketResponse, (type) => this.getDataForChanges(type));
        this.docEmitter.on(constants_1.photoshopConstants.logger.getUpdatedHTMLSocket, socket => this.onSocketUpdate(socket));
        this.docEmitter.on(constants_1.photoshopConstants.logger.destroy, () => this.onDestroy());
        this.docEmitter.on(constants_1.photoshopConstants.logger.newDocument, () => this.onNewDocument());
        this.docEmitter.on(constants_1.photoshopConstants.logger.currentDocument, () => this.onCurrentDocument());
    }
    isReady() {
        this.docEmitter.emit(constants_1.photoshopConstants.logger.containerPanelReady);
    }
    onSocketUpdate(socket) {
        this.socket = socket;
    }
    onLayersDeleted(eventLayers) {
        return __awaiter(this, void 0, void 0, function* () {
            const activeDocumentCopy = cloneDeep(this.activeDocument);
            if (this.modelFactory.getPhotoshopModel().isDeletedFromLayout) {
                this.modelFactory.getPhotoshopModel().isDeletedFromLayout = false;
                return;
            }
            const questArray = this.modelFactory.getPhotoshopModel().allDrawnQuestItems;
            for (let item of eventLayers) {
                if (item.removed) {
                    const element = utils_1.utlis.isIDExists(item.id, questArray);
                    if (element) {
                        const elementView = utils_1.utlis.getElementView(element, activeDocumentCopy._layers);
                        const elementPlatform = utils_1.utlis.getElementPlatform(element, activeDocumentCopy._layers);
                        yield utils_1.utlis.sendResponseToPanel(elementView, elementPlatform, element.name, constants_1.photoshopConstants.socket.uncheckFromContainerPanel, "uncheckFinished", this.socket);
                    }
                }
            }
            utils_1.utlis.handleModelData(eventLayers, questArray, this.modelFactory.getPhotoshopModel().viewElementalMap, this.modelFactory.getPhotoshopModel().getQuestViews, this.deletionHandler, this.generator);
        });
    }
    getDataForChanges(type) {
        return __awaiter(this, void 0, void 0, function* () {
            this.activeDocument = yield this.documentManager.getDocument(this.activeDocument.id);
            this.setAutomationToYes();
            const previousResponse = this.modelFactory.getPhotoshopModel().previousContainerResponse(type);
            const currentResponse = this.modelFactory.getPhotoshopModel().currentContainerResponse(type);
            if (previousResponse) {
                yield this.getChanges(previousResponse, currentResponse, type);
            }
            else {
                yield this.construct(currentResponse, type);
            }
            this.setAutomationToNo();
        });
    }
    construct(currentResponse, type) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let platform of this.platformArray) {
                if (currentResponse[platform]["base"]) {
                    yield this.makePlatforms(platform, type);
                }
                const viewObj = currentResponse[platform];
                for (let view in viewObj) {
                    if (!viewObj.hasOwnProperty(view)) {
                        continue;
                    }
                    if (viewObj[view][view] && viewObj[view][view]["base"]) {
                        this.applyStartingLogs(view);
                        yield this.makeViews(view, platform, type);
                        this.applyEndingLogs(view);
                    }
                }
            }
        });
    }
    makePlatforms(platform, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const platformMap = this.modelFactory.getMappingModel().getPlatformMap();
            const platformJson = platformMap.get(platform);
            yield this.photoshopFactory.makeStruct(platformJson, null, null, null, type);
        });
    }
    makeViews(view, platform, type, currentJson) {
        return __awaiter(this, void 0, void 0, function* () {
            const viewMap = this.modelFactory.getMappingModel().getViewPlatformMap(platform);
            let viewJson = viewMap.get(view);
            if (!viewJson && currentJson) {
                viewJson = {
                    [view]: currentJson[view]
                };
            }
            const platformRef = utils_1.utlis.getPlatformRef(platform, this.activeDocument);
            const commonId = utils_1.utlis.getCommonId(platformRef);
            yield this.photoshopFactory.makeStruct(viewJson, commonId, null, platform, type);
        });
    }
    getChanges(previousResponseMap, responseMap, type) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let platform of this.platformArray) {
                yield this.getPlatformChanges(platform, previousResponseMap[platform], responseMap[platform], type);
            }
        });
    }
    getPlatformChanges(platform, previousPlatformView, currentPlatformView, type) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.sendPlatformJsonChanges(previousPlatformView, currentPlatformView, platform, type);
            for (let key in previousPlatformView) {
                if (!previousPlatformView.hasOwnProperty(key)) {
                    continue;
                }
                yield this.sendViewJsonChanges(previousPlatformView[key], currentPlatformView[key], key, platform, type);
            }
        });
    }
    ;
    sendPlatformJsonChanges(previousPlatformView, currentPlatformView, platform, type) {
        return __awaiter(this, void 0, void 0, function* () {
            if (currentPlatformView.base && !previousPlatformView.base) {
                yield this.makePlatforms(platform, type);
            }
        });
    }
    sendViewJsonChanges(previousJson, currentJson, key, platform, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const previousBaseChild = previousJson && previousJson[Object.keys(previousJson)[0]];
            const currentBaseChild = currentJson && currentJson[Object.keys(currentJson)[0]];
            if (currentBaseChild && currentBaseChild["base"] && previousBaseChild && !previousBaseChild["base"]) {
                this.applyStartingLogs(key);
                yield this.makeViews(key, platform, type, currentJson);
                this.applyEndingLogs(key);
                return;
            }
            for (let keyC in currentBaseChild) {
                if (currentBaseChild.hasOwnProperty(keyC)) {
                    if (!previousBaseChild[keyC]) {
                        yield this.sendAdditionRequest(Object.keys(previousJson)[0], currentBaseChild[keyC], keyC, platform, type);
                    }
                }
            }
        });
    }
    sendAdditionRequest(baseKey, currentObj, key, platform, type) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.photoshopFactory.makeStruct({ [key]: currentObj }, this.getParentId(baseKey, platform), baseKey, platform, type);
        });
    }
    getParentId(baseKey, platform) {
        const elementalMap = this.modelFactory.getPhotoshopModel().viewElementalMap;
        const view = elementalMap[platform][baseKey];
        return view.base.id;
    }
    applyStartingLogs(keys) {
        this.docEmitter.emit(constants_1.photoshopConstants.logger.logStatus, `Started making ${keys}`);
    }
    applyEndingLogs(keys) {
        this.docEmitter.emit(constants_1.photoshopConstants.logger.logStatus, `${keys} done`);
    }
    onDestroy() {
        this.socket.emit(constants_1.photoshopConstants.logger.destroy);
    }
    onNewDocument() {
        this.socket.emit(constants_1.photoshopConstants.socket.disablePage);
    }
    onCurrentDocument() {
        this.socket.emit(constants_1.photoshopConstants.socket.enablePage);
    }
    setAutomationToYes() {
        this.modelFactory.getPhotoshopModel().setAutomation = true;
    }
    setAutomationToNo() {
        setTimeout(() => {
            this.modelFactory.getPhotoshopModel().setAutomation = false;
        }, 2000);
    }
}
exports.ContainerPanelResponse = ContainerPanelResponse;
//# sourceMappingURL=ContainerPanelResponse.js.map