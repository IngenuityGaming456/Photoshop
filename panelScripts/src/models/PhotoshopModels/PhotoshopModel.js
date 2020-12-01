"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoshopModel = void 0;
const path = require("path");
const fs = require("fs");
const utils_1 = require("../../utils/utils");
const NoDataPhotoshopModel_1 = require("./NoDataPhotoshopModel");
const FactoryClass_1 = require("../../modules/FactoryClass");
let menuLabels = require("../../res/menuLables");
const constants_1 = require("../../constants");
class PhotoshopModel {
    constructor() {
        this.writeData = {};
        this.questItems = [];
        this.drawnQuestItems = [];
        this.viewObjStorage = [];
        this.clickedMenus = [];
        this.previousContainer = null;
        this.elementalMap = {};
        this.questViews = [];
        this.selfViews = [];
        this.mappedPlatform = {};
        this.questPlatforms = [constants_1.photoshopConstants.platforms.desktop, constants_1.photoshopConstants.platforms.portrait, constants_1.photoshopConstants.platforms.landscape];
        this.layersErrorData = [];
        this.menuStates = [];
    }
    execute(params) {
        this.generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.docEmitter = params.docEmitter;
        this.subPhotoshopModel = params.storage.subPhotoshopModel;
        this.onPhotoshopStart();
        this.subscribeListeners();
        this.fireEvents();
        this.createStorage();
        this.filterContainers();
        this.handleData();
    }
    subscribeListeners() {
        this.generator.onPhotoshopEvent(constants_1.photoshopConstants.photoshopEvents.generatorMenuChanged, (event) => this.onButtonMenuClicked(event));
    }
    fireEvents() {
        this.docEmitter.emit(constants_1.photoshopConstants.emitter.observerAdd, this);
    }
    handleData() {
        this.executeSubModels();
        this.elementalMap = this.createElementData();
        this.platformDeletion = this.createPlatformDeletion();
        this.viewDeletionObj = this.createViewDeletionObj();
        this.menuStates = this.accessMenuState();
        this.currentState = this.accessCurrentState();
        this.previousContainer = this.accessContainerResponse();
        this.drawnQuestItems = this.accessDrawnQuestItems();
    }
    executeSubModels() {
        if (this.subPhotoshopModel instanceof NoDataPhotoshopModel_1.NoDataPhotoshopModel) {
            FactoryClass_1.execute(this.subPhotoshopModel, this.getNoDataParams());
        }
    }
    createElementData() {
        return this.subPhotoshopModel.createElementData();
    }
    createPlatformDeletion() {
        return this.subPhotoshopModel.createPlatformDeletion();
    }
    createViewDeletionObj() {
        return this.subPhotoshopModel.createViewDeletionObj();
    }
    accessMenuState() {
        return this.subPhotoshopModel.accessMenuState();
    }
    accessCurrentState() {
        return this.subPhotoshopModel.accessCurrentState();
    }
    accessContainerResponse() {
        return this.subPhotoshopModel.accessContainerResponse();
    }
    accessDrawnQuestItems() {
        return this.subPhotoshopModel.accessDrawnQuestItems();
    }
    getNoDataParams() {
        return {
            storage: {
                viewObjStorage: this.viewObjStorage,
                questPlatforms: this.questPlatforms,
            }
        };
    }
    onButtonMenuClicked(event) {
        this.clickedMenus.push(event.generatorMenuChanged.name);
    }
    handleSocketStorage(socketStorage, type) {
        if (type === "quest") {
            this.prevContainerResponse = this.previousContainer;
            this.containerResponse = socketStorage;
            this.previousContainer = this.containerResponse;
        }
        else {
            this.selfPreviousResponse = this.selfPreviousContainer;
            this.selfContainerResponse = socketStorage;
            this.selfPreviousContainer = this.selfContainerResponse;
        }
    }
    setRefreshResponse(storage) {
        this.selfPreviousContainer = storage;
    }
    /**
     * function reads views json file from viewRes folder
     */
    createStorage() {
        const folderPath = path.join(__dirname, "../../viewRes");
        fs.readdirSync(folderPath).forEach(fileName => {
            const jsonObject = require(folderPath + "/" + fileName);
            this.viewObjStorage.push(jsonObject);
        });
    }
    filterContainers() {
        this.viewObjStorage.forEach(item => {
            this.storeItems(item);
        });
    }
    storeItems(item) {
        Object.keys(item).forEach(key => {
            if (!item[key].type) {
                this.questViews.push(key);
                this.storeItems(item[key]);
            }
            this.pushToItems(key, item);
        });
    }
    pushToItems(key, item) {
        if (item[key].id) {
            key = item[key].id;
        }
        if (!utils_1.utlis.isKeyExists(this.questItems, key)) {
            this.questItems.push(key);
        }
    }
    createPlatformMapping(mappingResponse) {
        const mappedPlatform = {};
        mappedPlatform[mappingResponse["front"]] = {};
        [...this.questViews, ...this.selfViews].forEach(itemV => {
            mappedPlatform[mappingResponse["front"]][itemV] = this.constructViewMapping(itemV, mappingResponse);
        });
        this.mappedPlatform = mappedPlatform;
    }
    constructViewMapping(itemV, mappingResponse) {
        const nestedViewMap = {};
        if (itemV === constants_1.photoshopConstants.views.freeGame) {
            return {
                mapping: {
                    [mappingResponse["front"]]: constants_1.photoshopConstants.views.baseGame
                }
            };
        }
        nestedViewMap[mappingResponse["rear"]] = itemV;
        return {
            mapping: nestedViewMap
        };
    }
    setPlatformMenuIds(id, key) {
        if (this.elementalMap[key]) {
            this.elementalMap[key]["base"] = id;
        }
    }
    setBaseMenuIds(platform, id, key) {
        const baseKey = this.elementalMap[platform][key];
        if (baseKey) {
            baseKey["base"] = {
                id: id,
                name: key
            };
        }
    }
    setChildMenuIds(platform, childId, childName, childType, parentKey) {
        const baseKey = this.elementalMap[platform][parentKey];
        if (baseKey) {
            baseKey[childType].push({
                id: childId,
                name: childName
            });
        }
    }
    setDrawnQuestItems(id, key) {
        this.drawnQuestItems.push({ id: id, name: key });
    }
    set menuCurrentState(currentState) {
        this.currentState = currentState;
    }
    set setAutomation(value) {
        this.automation = value;
    }
    get setAutomation() {
        return this.automation;
    }
    get allDrawnQuestItems() {
        return this.drawnQuestItems;
    }
    get viewElementalMap() {
        return this.elementalMap;
    }
    get allQuestItems() {
        return this.questItems;
    }
    currentContainerResponse(type) {
        if (type === "quest") {
            return this.containerResponse;
        }
        else {
            return this.selfContainerResponse;
        }
    }
    get mappedPlatformObj() {
        return this.mappedPlatform;
    }
    previousContainerResponse(type) {
        if (type === "quest") {
            return this.prevContainerResponse;
        }
        else {
            return this.selfPreviousResponse;
        }
    }
    get allQuestPlatforms() {
        return this.questPlatforms;
    }
    get allLayersErrorData() {
        return this.layersErrorData;
    }
    get viewDeletion() {
        return this.viewDeletionObj;
    }
    get allPlatformDeletion() {
        return this.platformDeletion;
    }
    get allMenuStates() {
        return this.menuStates;
    }
    get menuCurrentState() {
        return this.currentState;
    }
    get selfMadeViews() {
        return this.selfViews;
    }
    get getQuestViews() {
        return this.questViews;
    }
    onPhotoshopStart() {
    }
    onPhotoshopClose() {
        this.getWriteData();
        this.generator.emit(constants_1.photoshopConstants.generator.writeData, this.writeData, true);
    }
    getWriteData() {
        this.containerResponse = this.containerResponse || this.previousContainer;
        this.writeData = {
            elementalMap: this.elementalMap,
            clickedMenus: this.clickedMenus,
            containerResponse: this.containerResponse,
            viewDeletion: this.viewDeletionObj,
            platformDeletion: this.platformDeletion,
            menuStates: this.getMenuStates(),
            menuCurrentState: this.currentState,
            drawnQuestItems: this.drawnQuestItems
        };
    }
    getMenuStates() {
        for (let key in menuLabels) {
            if (!menuLabels.hasOwnProperty(key)) {
                continue;
            }
            const menuResult = this.generator.getMenuState(menuLabels[key].label);
            if (menuResult && !menuResult.enabled) {
                this.menuStates.push(menuLabels[key].label);
            }
        }
        return this.menuStates;
    }
    getElementalObject() {
        return this.subPhotoshopModel;
    }
}
exports.PhotoshopModel = PhotoshopModel;
//# sourceMappingURL=PhotoshopModel.js.map