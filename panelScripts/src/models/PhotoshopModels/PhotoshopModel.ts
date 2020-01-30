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
    private activeDocument;
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
        this.mappedPlatform = this.createPlatformMapping();
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

    public handleSocketStorage(socketStorage) {
        this.prevContainerResponse = this.previousContainer;
        this.containerResponse = socketStorage;
        this.previousContainer = this.containerResponse;
    }

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

    private createPlatformMapping() {
        const mappedPlatform = {};
        this.questPlatforms.forEach((item, index) => {
            mappedPlatform[item] = {};
            this.questViews.forEach(itemV => {
                mappedPlatform[item][itemV] = this.constructViewMapping(itemV, index);
            });
        });
        return mappedPlatform;
    }

    private constructViewMapping(itemV, index) {
        const nestedViewMap = {};
        if (itemV === pc.views.freeGame) {
            return {
                mapping: {
                    [this.questPlatforms[index]]: pc.views.baseGame
                }
            }
        }
        const consecutiveIndexes = utlis.getConsecutiveIndexes(this.questPlatforms, index);
        nestedViewMap[this.questPlatforms[consecutiveIndexes.firstIndex]] = itemV;
        nestedViewMap[this.questPlatforms[consecutiveIndexes.secondIndex]] = itemV;
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

    get allDrawnQuestItems() {
        return this.drawnQuestItems;
    }

    get viewElementalMap() {
        return this.elementalMap;
    }

    get allQuestItems() {
        return this.questItems;
    }

    get currentContainerResponse() {
        return this.containerResponse;
    }

    get mappedPlatformObj() {
        return this.mappedPlatform;
    }

    get previousContainerResponse() {
        return this.prevContainerResponse;
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

}