import {execute, inject} from "../FactoryClass";
import {MenuManager} from "./MenuManager";
import {IFactory, IParams} from "../../interfaces/IJsxParam";
import {NoPlatformState} from "../../states/photoshopMenuStates/NoPlatformState";
import {AddedPlatformState} from "../../states/photoshopMenuStates/AddedPlatformState";
import {AddedViewState} from "../../states/photoshopMenuStates/AddedViewState";
import {DeletedViewState} from "../../states/photoshopMenuStates/DeletedViewsState";
import {ModelFactory} from "../../models/ModelFactory";
import {DeletedPlatformState} from "../../states/photoshopMenuStates/DeletedPlatformState";
let menuLabels = require("../../res/menuLables");

export class MenuProxyManager implements IFactory {
    private readonly menuManager;
    private readonly modelFactory;
    private generator;
    private platformStack = [];
    private platformDeletion = {desktop: false, portrait: false, landscape: false};
    private viewDeletion = {};
    private platformArray = [];

    public constructor(modelFactory: ModelFactory) {
        this.modelFactory = modelFactory;
        this.menuManager = inject({
            ref: MenuManager, dep: [ModelFactory, NoPlatformState,
                AddedPlatformState, AddedViewState, DeletedViewState, DeletedPlatformState]
        });
    }

    public async execute(params: IParams) {
        this.generator = params.generator;
        this.subscribeListeners();
        await this.addMenuItems();
        this.platformArray = this.modelFactory.getPhotoshopModel().allQuestPlatforms;
        this.createViewDeletionObj();
        execute(this.menuManager, {generator: this.generator});
    }

    private subscribeListeners() {
        this.generator.on("validEntryStruct", (currentMenuName, currentPlatform) => {
            this.filterAllIncomingResults(currentMenuName, currentPlatform);
        });
        this.generator.on("layersDeleted", deletedLayers => {
            this.onLayersDeletion(deletedLayers)
        });
    }

    private async addMenuItems() {
        const menuArray = Object.keys(menuLabels);
        for (let menu of menuArray) {
            await this.drawMenuItems(menu);
        }
    }

    private async drawMenuItems(menu) {
        await this.generator.addMenuItem(menuLabels[menu].label,
            menuLabels[menu].displayName, true, false);
    }

    private createViewDeletionObj() {
        this.platformArray.forEach(platformKey => {
            this.viewDeletion[platformKey] = {};
            for(let menu in menuLabels) {
                if(!menuLabels.hasOwnProperty(menu)) {
                    continue;
                }
                if(menuLabels[menu].menuGroup === "Menu_View") {
                    this.viewDeletion[platformKey][menuLabels[menu].label] = false;
                }
            }
        });
    }

    private filterAllIncomingResults(currentMenuName: string, currentPlatform: string) {
        if (!currentPlatform) {
            this.handlePlatformAddition(currentMenuName);
        } else {
            this.handleViewAddition(currentMenuName, currentPlatform);
        }
    }

    private handlePlatformAddition(currentMenuName) {
        const platformMap = this.modelFactory.getMappingModel().getPlatformMap();
        const platformObj = platformMap.get(currentMenuName);
        Object.keys(Object.values(platformObj)[0]).forEach(key => {
            this.platformDeletion[key] = false;
        });
        this.menuManager.onPlatformAddition(currentMenuName);
    }

    private handleViewAddition(currentMenuName, currentPlatform) {
        this.viewDeletion[currentPlatform][currentMenuName] = false;
        if (!~this.platformStack.indexOf(currentPlatform)) {
            this.platformStack.push(currentPlatform);
        }
        if (this.platformStack.length === 3) {
            this.menuManager.onViewAddition(currentMenuName);
        }
    }

    private onLayersDeletion(eventLayers) {
        const viewElementalMap = this.modelFactory.getPhotoshopModel().viewElementalMap;
        const callback = this.getCallback(eventLayers);
        try {
            this.handlePlatformDeletion(eventLayers, viewElementalMap, callback)
                .handleViewDeletion(eventLayers, viewElementalMap, callback);
        } catch (err) {
            console.log(err);
        }
    }

    private getCallback(eventLayers) {
        if (this.responseIsArrayOfArrays(eventLayers)) {
            return this.handleArrayResponse;
        }
        return this.handleNormalResponse;
    }

    private responseIsArrayOfArrays(eventLayers): boolean {
        for (let item in eventLayers) {
            if (eventLayers[item] instanceof Array) {
                return true;
            }
        }
    }

    private handleArrayResponse(baseId, eventLayers): boolean {
        return eventLayers.some(item => {
            if (item instanceof Array) {
                return this.handleArrayResponse(baseId, item);
            } else {
                return this.handleNormalResponse(baseId, item);
            }
        })
    }

    private handleNormalResponse(baseId, eventLayers): boolean {
        return eventLayers.some(item => {
            if (item.id === baseId) {
                return true;
            }
        })
    }

    private handlePlatformDeletion(eventLayers, viewElementalMap, callback) {
        this.platformArray.forEach((platformKey) => {
            const platformId = viewElementalMap.get(platformKey).get("base");
            if (platformId) {
                if (callback(platformId, eventLayers)) {
                    this.platformDeletion[platformKey] = true;
                }
            }
        });
        const allTrue = this.platformDeletion["desktop"] &&
                        this.platformDeletion["portrait"] &&
                        this.platformDeletion["landscape"];
        if (allTrue) {
            this.menuManager.onAllPlatformsDeletion();
            throw new Error("No need to check for view deletion");
        }
        if (this.platformDeletion["portrait"] && this.platformDeletion["landscape"]) {
            this.menuManager.onPlatformDeletion("MobileView");
            throw new Error("No need to check for view deletion");
        }
        if (this.platformDeletion["desktop"]) {
            this.menuManager.onPlatformDeletion("DesktopView");
            throw new Error("No need to check for view deletion");
        }
        return this;
    }

    private handleViewDeletion(eventLayers, viewElementalMap, callback) {
        const viewMap = this.modelFactory.getMappingModel().getViewMap();
        if(viewMap) {
            [...viewElementalMap.keys()].forEach(platformKey => {
                viewMap.forEach((value, key) => {
                    this.checkElementKey(key, Object.keys(value), platformKey, eventLayers, callback, viewElementalMap);
                });
            });
            this.checkViewDeletion();
        }
    }

    private checkElementKey(viewKey, valueArray, platformKey, eventLayers, callback, viewElementalMap) {
        for(let value of valueArray) {
            if(this.viewDeletion[platformKey][viewKey]) {
                continue;
            }
            const valueObj = viewElementalMap.get(platformKey).get(value)["base"];
            if(!valueObj || !callback(valueObj.id, eventLayers)) {
                this.viewDeletion[platformKey][viewKey] = false;
                return;
            }
        }
        this.viewDeletion[platformKey][viewKey] = true;
    }

    private checkViewDeletion() {
        for(let menu in menuLabels) {
            if(!menuLabels.hasOwnProperty(menu)) {
                continue;
            }
            if(menuLabels[menu].menuGroup === "Menu_View") {
                this.checkViewForDeletion(menuLabels[menu].label);
            }
        }
    }

    private checkViewForDeletion(menuName) {
        const keysLength = Object.keys(this.viewDeletion).length;
        let count = 0;
        for(let key in this.viewDeletion) {
            if(this.viewDeletion[key][menuName]) {
                count++;
            }
        }
        if(count === keysLength) {
            this.menuManager.onViewDeletion(menuName);
        }
    }

}
