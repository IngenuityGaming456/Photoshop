import * as path from "path";
import * as fs from "fs";
import {IModel, IParams} from "../../interfaces/IJsxParam";
import {utlis} from "../../utils/utils";
import {NoDataPhotoshopModel} from "./NoDataPhotoshopModel";
import {execute} from "../../modules/FactoryClass";
let menuLabels = require("../../res/menuLables");
import {photoshopConstants as pc} from "../../constants";

export class PhotoshopModel implements IModel {

    protected generator;
    protected subPhotoshopModel;
    protected activeDocument;
    protected writeData = {};
    private questItems = [];
    private drawnQuestItems = [];
    private viewObjStorage = [];
    private clickedMenus = [];
    private previousContainer = null;
    private elementalMap = {};
    private prevContainerResponse;
    private containerResponse;
    private questViews = [];
    private mappedPlatform = {};
    private questPlatforms = [pc.platforms.desktop, pc.platforms.portrait, pc.platforms.landscape];
    private layersErrorData = [];
    private viewDeletionObj;
    private platformDeletion;
    private menuStates = [];
    private currentState: string;
    private docEmitter;
    private selfPreviousResponse;
    private selfContainerResponse;
    private selfPreviousContainer;
    private automation;

    execute(params: IParams) {
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

    protected subscribeListeners() {
        this.generator.onPhotoshopEvent(pc.photoshopEvents.generatorMenuChanged, (event) => this.onButtonMenuClicked(event));
    }

    private fireEvents() {
        this.docEmitter.emit(pc.emitter.observerAdd, this);
    }

    protected handleData() {
        this.executeSubModels();
        this.elementalMap = this.createElementData();
        this.platformDeletion = this.createPlatformDeletion();
        this.viewDeletionObj =  this.createViewDeletionObj();
        this.menuStates = this.accessMenuState();
        this.currentState = this.accessCurrentState();
        this.previousContainer = this.accessContainerResponse();
        this.drawnQuestItems = this.accessDrawnQuestItems();
    }
 
    private executeSubModels() {
        if(this.subPhotoshopModel instanceof NoDataPhotoshopModel) {
            execute(this.subPhotoshopModel, this.getNoDataParams());
        }
    }

    private createElementData() {
        return this.subPhotoshopModel.createElementData();
    }

    private createPlatformDeletion() {
        return this.subPhotoshopModel.createPlatformDeletion();
    }

    private createViewDeletionObj() {
        return this.subPhotoshopModel.createViewDeletionObj();
    }

    private accessMenuState() {
        return this.subPhotoshopModel.accessMenuState();
    }

    private accessCurrentState() {
        return this.subPhotoshopModel.accessCurrentState();
    }

    private accessContainerResponse() {
        return this.subPhotoshopModel.accessContainerResponse();
    }

    private accessDrawnQuestItems() {
        return this.subPhotoshopModel.accessDrawnQuestItems();
    }

    private getNoDataParams() {
        return {
            storage: {
                viewObjStorage: this.viewObjStorage,
                questPlatforms: this.questPlatforms,
            }
        }
    }

    private onButtonMenuClicked(event) {
        this.clickedMenus.push(event.generatorMenuChanged.name);
    }

    public handleSocketStorage(socketStorage, type) {
        if(type === "quest") {
            this.prevContainerResponse = this.previousContainer;
            this.containerResponse = socketStorage;
            this.previousContainer = this.containerResponse;
        } else {
            this.selfPreviousResponse = this.selfPreviousContainer;
            this.selfContainerResponse = socketStorage;
            this.selfPreviousContainer = this.selfContainerResponse;
        }
    }

    public setRefreshResponse(storage) {
        this.selfPreviousContainer = storage;
    }

    /**
     * function reads views json file from viewRes folder
     */
    private createStorage() {
        const folderPath = path.join(__dirname, "../../viewRes");
        fs.readdirSync(folderPath).forEach(fileName => {
            const jsonObject = require(folderPath + "/" + fileName);
            this.viewObjStorage.push(jsonObject);
        });
    }

    private filterContainers() {
        this.viewObjStorage.forEach(item => {
            this.storeItems(item);
        });
    }

    private storeItems(item) {
        Object.keys(item).forEach(key => {
            if (!item[key].type) {
                this.questViews.push(key);
                this.storeItems(item[key]);
            }
            this.pushToItems(key);
        });
    }

    private pushToItems(key) {
        if (!utlis.isKeyExists(this.questItems, key)) {
            this.questItems.push(key);
        }
    }

    public createPlatformMapping(mappingResponse) {
        const mappedPlatform = {};
        mappedPlatform[mappingResponse["front"]] = {};
        this.questViews.forEach(itemV => {
                mappedPlatform[mappingResponse["front"]][itemV] = this.constructViewMapping(itemV, mappingResponse);
        });
        this.mappedPlatform = mappedPlatform;
    }

    private constructViewMapping(itemV, mappingResponse) {
        const nestedViewMap = {};
        if (itemV === pc.views.freeGame) {
            return {
                mapping: {
                    [mappingResponse["front"]]: pc.views.baseGame
                }
            }
        }
        nestedViewMap[mappingResponse["rear"]] = itemV;
        return {
            mapping: nestedViewMap
        }
    }

    public setPlatformMenuIds(id, key) {
        if(this.elementalMap[key]) {
            this.elementalMap[key]["base"] = id;
        }
    }

    public setBaseMenuIds(platform, id: number, key: string) {
        const baseKey = this.elementalMap[platform][key];
        if (baseKey) {
            baseKey["base"] = {
                id: id,
                name: key
            };
        }
    }

    public setChildMenuIds(platform: string, childId: number, childName: string, childType: string, parentKey: string) {
        const baseKey = this.elementalMap[platform][parentKey];
        if (baseKey) {
            baseKey[childType].push({
                id: childId,
                name: childName
            });
        }
    } 

    public setDrawnQuestItems(id, key) {
        this.drawnQuestItems.push({id: id, name: key});
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

    public currentContainerResponse(type) {
        if(type === "quest") {
            return this.containerResponse;
        } else {
            return this.selfContainerResponse;
        }
    }

    get mappedPlatformObj() {
        return this.mappedPlatform;
    }

    public previousContainerResponse(type) {
        if(type === "quest") {
            return this.prevContainerResponse;
        } else {
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

    public onPhotoshopStart() {
    }

    public onPhotoshopClose() {
        this.getWriteData();
        this.generator.emit(pc.generator.writeData, this.writeData, true);
    }

    protected getWriteData() {
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

    private getMenuStates() {
        for(let key in menuLabels) {
            if(!menuLabels.hasOwnProperty(key)) {
                continue;
            }
            const menuResult = this.generator.getMenuState(menuLabels[key].label);
            if(menuResult && !menuResult.enabled) {
                this.menuStates.push(menuLabels[key].label);
            }
        }
        return this.menuStates;
    }

    public getElementalObject() {
        this.subPhotoshopModel
    }

}