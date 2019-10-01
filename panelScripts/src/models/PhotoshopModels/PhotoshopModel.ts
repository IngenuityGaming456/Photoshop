import * as path from "path";
import * as fs from "fs";
import {IModel, IParams} from "../../interfaces/IJsxParam";
import {utlis} from "../../utils/utils";
import {NoDataPhotoshopModel} from "./NoDataPhotoshopModel";
import {execute} from "../../modules/FactoryClass";

export class PhotoshopModel implements IModel {

    private generator;
    private activeDocument;
    private writeData = {};
    private questItems = [];
    private drawnQuestItems = [];
    private viewObjStorage = [];
    private clickedMenus = [];
    private previousContainer = null;
    private elementalMap = new Map();
    private prevContainerResponse = new Map();
    private containerResponse = new Map();
    private questViews = [];
    private mappedPlatform = {};
    private questPlatforms = ["desktop", "portrait", "landscape"];
    private subPhotoshopModel;
    private layersErrorData = [];

    execute(params: IParams) {
        this.generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.subPhotoshopModel = params.storage.subPhotoshopModel;
        this.onPhotoshopStart();
        this.subscribeListeners();
        this.fireEvents();
        this.createStorage();
        this.filterContainers();
        this.elementalMap = this.createElementData();
        this.mappedPlatform = this.createPlatformMapping();
    }

    private subscribeListeners() {
        this.generator.onPhotoshopEvent("generatorMenuChanged", (event) => this.onButtonMenuClicked(event));
    }

    private fireEvents() {
        this.generator.emit("observerAdd", this);
    }

    private createElementData() {
        if(this.subPhotoshopModel instanceof NoDataPhotoshopModel)
            execute(this.subPhotoshopModel, this.getNoDataParams());
        return this.subPhotoshopModel.createElementData();
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

    private setToStarterMap(data) {
        this.generator.emit("setToStarterModel", this.activeDocument.id, data);
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
        if (itemV === "freeGame") {
            return {
                mapping: {
                    [this.questPlatforms[index]]: "baseGame"
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
        this.elementalMap.get(key) && this.elementalMap.get(key).set("base", id);
    }

    public setBaseMenuIds(platform, id: number, key: string) {
        const baseKey = this.elementalMap.get(platform).get(key);
        if (baseKey) {
            baseKey["base"] = {
                id: id,
                name: key
            };
        }
    }

    public setChildMenuIds(platform: string, childId: number, childName: string, childType: string, parentKey: string) {
        const baseKey = this.elementalMap.get(platform).get(parentKey);
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

    get allQuestViews() {
        return this.questViews;
    }

    get viewStorage() {
        return this.viewObjStorage;
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

    get clickedMenuNames() {
        return this.clickedMenus;
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

    public onPhotoshopStart() {
    }

    public onPhotoshopClose() {
        this.writeData = {
            elementalMap: utlis.mapToObject(this.elementalMap),
            clickedMenus: this.clickedMenus,
            containerResponse: utlis.mapToObject(this.containerResponse)
        };
        this.generator.emit("writeData", this.writeData);
    }

}