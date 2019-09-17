import {IFactory, IParams, IPhotoshopState} from "../interfaces/IJsxParam";
let menuLabels = require("../res/menuLables.json");
import {Generator} from "../../../generator-core/lib/generator";
import {ModelFactory} from "../models/ModelFactory";

export class MenuManager implements IFactory {
    private generator: Generator;
    private noPlatform: IPhotoshopState;
    private addedPlatform: IPhotoshopState;
    private deletedView: IPhotoshopState;
    private addedView: IPhotoshopState;
    private currentState: IPhotoshopState;
    private modelFactory: ModelFactory;
    private platformStack = [];
    private platformArray = [];
    private viewArray = [];

    public constructor(modelFactory: ModelFactory, noPlatform: IPhotoshopState, addedPlatform: IPhotoshopState, 
                       addedView: IPhotoshopState, deletedView: IPhotoshopState) {
        this.modelFactory = modelFactory;
        this.noPlatform = noPlatform;
        this.addedPlatform = addedPlatform;
        this.addedView = addedView;
        this.deletedView = deletedView;
    }

    public async execute(params: IParams) {
        this.generator = params.generator;
        //this.subscribeListeners();
        await this.addMenuItems();
        //this.setStartingState();
    }

    private subscribeListeners() {
        this.generator.on("layersDeleted", eventLayers => this.onLayerDeletion(eventLayers));
        this.generator.onPhotoshopEvent("generatorMenuChanged", event => this.onButtonMenuClicked(event));
    }

    private async addMenuItems() {
        const menuArray = Object.keys(menuLabels);
        for(let menu of menuArray) {
            await this.drawMenuItems(menu);
        }
    }
    
    private setStartingState() {
        this.currentState = this.getNoPlatformState();
        this.onAllPlatformsDeletion();
    }

    private async drawMenuItems(menu) {
        await this.generator.addMenuItem(menuLabels[menu].label,
            menuLabels[menu].displayName, true, false);
    }

    public setCurrentState(state: IPhotoshopState) {
        this.currentState = state;
    }

    public onViewAddition(viewMenuName: string) {
        this.currentState.onViewAddition(this, this.generator, viewMenuName);
    }
    
    public onViewDeletion(viewMenuName: string) {
        this.currentState.onViewDeletion(this, this.generator, viewMenuName);
    }

    public onPlatformAddition(platformMenuName) {
        this.currentState.onPlatformAddition(this, this.generator, platformMenuName);
    }

    public onAllPlatformsDeletion() {
        this.currentState.onAllPlatformsDeletion(this, this.generator);
    }

    public getNoPlatformState() {
        return this.noPlatform;
    }
    
    public getPlatformAdditionState() {
        return this.addedPlatform;
    }
    
    public getViewDeletionState() {
        return this.deletedView;
    }
    
    public getAddedViewState() {
        return this.addedView;
    }

    private onButtonMenuClicked(event) {
        const menu = event.generatorMenuChanged;
        if(this.isPlatformAdded(menu.name)) {
            this.onPlatformAddition(menu.name);
            return;
        }
        if(this.isViewAdded(menu.name)) {
            this.onViewAddition(menu.name);
        }
    }
    
    private isViewAdded(menuName) {
        const viewMap = this.modelFactory.getMappingModel().getViewMap();
        return this.isAdded(menuName, viewMap, this.viewArray);
    }
    
    private isPlatformAdded(menuName) {
        const platformMap = this.modelFactory.getMappingModel().getPlatformMap();
        return this.isAdded(menuName, platformMap, this.platformArray);
    }
    
    private isAdded(menuName, valueMap, insertionArray) {
        if(~[...valueMap.keys()].indexOf(menuName)) {
            this.platformStack.push(menuName);
            const value = valueMap.get(menuName);
            insertionArray.push({name: menuName, values: Object.keys(value)});
            return true;
        }
    }
    
    private onLayerDeletion(eventLayers) {
        const baseMenuIds = this.modelFactory.getPhotoshopModel().menuIds;
        if (this.responseIsArrayOfArrays(eventLayers)) {
            this.getBaseId(eventLayers, baseMenuIds, this.handleArrayResponse);
        } else {
            this.getBaseId(eventLayers, baseMenuIds, this.handleNormalResponse);
        }
    }

    private handleArrayResponse(baseId, eventLayers): boolean {
        return eventLayers.some(item => {
            if(item instanceof Array) {
                return this.handleArrayResponse(baseId, item);
            } else {
                return this.handleNormalResponse(baseId, item);
            }
        })
    }

    private handleNormalResponse(baseId, eventLayers): boolean {
        return eventLayers.some(item => {
            if(item.id === baseId.id) {
                return true;
            }
        })
    }

    private getBaseId(eventLayers, baseMenuIds, callback) {
        const baseId = baseMenuIds.find(item => {
            if(callback(item, eventLayers)) {
                return true;
            }
        });
        if(baseId) {
            this.getMenuType(baseId);
        }
    }

    private getMenuType(baseId) {
        const idName = baseId.name;
        const deletedView = this.isViewDeleted(idName);
        if(deletedView) {
            this.onViewDeletion(deletedView);
            return;
        }
        const deletedPlatform = this.isAllPlatformsDeleted(idName);
        if(deletedPlatform) {
            this.onAllPlatformsDeletion();
        }
    }

    private isViewDeleted(idName) {
        const viewMap = this.modelFactory.getMappingModel().getViewMap();
        return this.isDeleted(idName, viewMap, this.viewArray);
    }
    
    private isAllPlatformsDeleted(idName): boolean {
        if(!this.platformStack.length) {
            return true;
        }
        const platformMap = this.modelFactory.getMappingModel().getPlatformMap();
        const deletedPlatform = this.isDeleted(idName, platformMap, this.platformArray);
        const platformIndex = this.platformStack.indexOf(deletedPlatform);
        this.platformStack.slice(platformIndex);
    }

    public isDeleted(idName, valueMap, insertionArray) {
        valueMap.forEach((value, key) => {
            if(~Object.keys(value).indexOf(idName)) {
                insertionArray = insertionArray.find(item => {
                    if(item.menuName === key) {
                        return true;
                    }
                });
                const insertionValueArray = insertionArray.values;
                if(!insertionValueArray.length) {
                    return key;
                }
                const idIndex = insertionValueArray.indexOf(idName);
                insertionValueArray.slice(idIndex);
            }
        });
        return null;
    }

    private responseIsArrayOfArrays(eventLayers): boolean {
        for(let item in eventLayers) {
            if(eventLayers[item] instanceof Array) {
                return true;
            }
        }
    }

}