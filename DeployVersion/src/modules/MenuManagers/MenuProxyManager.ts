import {execute, inject} from "../FactoryClass";
import {MenuManager} from "./MenuManager";
import {IFactory, IParams} from "../../interfaces/IJsxParam";
import {NoPlatformState} from "../../states/photoshopMenuStates/NoPlatformState";
import {AddedPlatformState} from "../../states/photoshopMenuStates/AddedPlatformState";
import {AddedViewState} from "../../states/photoshopMenuStates/AddedViewState";
import {DeletedViewState} from "../../states/photoshopMenuStates/DeletedViewsState";
import {ModelFactory} from "../../models/ModelFactory";
import {DeletedPlatformState} from "../../states/photoshopMenuStates/DeletedPlatformState";
import {UtilsPhotoshopState} from "../../utils/utilsPhotoshopState";
let menuLabels = require("../../res/menuLables");

export class MenuProxyManager implements IFactory {
    private readonly menuManager;
    private readonly modelFactory;
    private generator;
    private viewDeletion = {};
    private platformDeletion;
    private platformArray = [];
    private menuStates = [];
    private docEmitter;
    public constructor(modelFactory: ModelFactory) {
        this.modelFactory = modelFactory;
        this.menuManager = inject({
            ref: MenuManager, dep: [ModelFactory, NoPlatformState,
                AddedPlatformState, AddedViewState, DeletedViewState, DeletedPlatformState]
        });
    }

    public async execute(params: IParams) {
        this.generator = params.generator;
        this.docEmitter = params.docEmitter;
        this.platformArray = this.modelFactory.getPhotoshopModel().allQuestPlatforms;
        this.viewDeletion = this.modelFactory.getPhotoshopModel().viewDeletion;
        this.platformDeletion = this.modelFactory.getPhotoshopModel().allPlatformDeletion;
        this.menuStates = this.modelFactory.getPhotoshopModel().allMenuStates;
        this.subscribeListeners();
        await this.addMenuItems();
        execute(this.menuManager, {generator: this.generator});
    }

    private subscribeListeners() {
        this.docEmitter.on("validEntryStruct", (currentMenuName, currentPlatform) => {
            this.filterAllIncomingResults(currentMenuName, currentPlatform);
        });
        this.generator.on("layersDeleted", deletedLayers => {
            this.onLayersDeletion(deletedLayers)
        });
        this.docEmitter.on("currentDocument", () => this.enableAllMenuItems());
        this.docEmitter.on("newDocument", () => this.disableAllMenuItems());
    }

    private async addMenuItems() {
        const menuArray = Object.keys(menuLabels);
        for (let menu of menuArray) {
            await this.drawMenuItems(menu);
        }
    }

    private async drawMenuItems(menu) {
        if(menuLabels[menu].enabled === false) {
            await this.generator.addMenuItem(menuLabels[menu].label,
                menuLabels[menu].displayName, menuLabels[menu].enabled, false);
        } else {
            await this.generator.addMenuItem(menuLabels[menu].label,
                menuLabels[menu].displayName, true, false);
        }
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
        let count = 0;
        for(let key in this.viewDeletion) {
            if(this.viewDeletion[key][currentMenuName] === false) {
                count ++;
            }
        }
        if(count === 3) {
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
            console.log("Platform Deletion Detected");
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
            const platformId = viewElementalMap[platformKey]["base"];
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
        Object.keys(viewElementalMap).forEach(platformKey => {
            const viewMap = this.modelFactory.getMappingModel().getViewPlatformMap(platformKey);
            if(viewMap) {
                viewMap.forEach((value, key) => {
                    this.checkElementKey(key, Object.keys(value), platformKey, eventLayers, callback, viewElementalMap);
                });
            }
        });
        this.checkViewDeletion();
    }

    private checkElementKey(viewKey, valueArray, platformKey, eventLayers, callback, viewElementalMap) {
        if(this.viewDeletion[platformKey][viewKey]) {
            return;
        }
        for(let value of valueArray) {
            const valueObj = viewElementalMap[platformKey][value]["base"];
            if(!valueObj || !callback(valueObj.id, eventLayers)) {
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
        for(let key in this.viewDeletion) {
            if(this.viewDeletion[key][menuName]) {
                this.menuManager.onViewDeletion(menuName);
                return;
            }
        }
    }

    private async enableAllMenuItems() {
        for(let menu in menuLabels) {
            if(menuLabels.hasOwnProperty(menu) && menuLabels[menu].enabled !== false) {
                await this.generator.toggleMenu(menuLabels[menu].label, true, false,
                    menuLabels[menu].displayName);
            }
        }
    }

    private async disableAllMenuItems() {
        for(let menu in menuLabels) {
            if(menuLabels.hasOwnProperty(menu)) {
                    await this.generator.toggleMenu(menuLabels[menu].label,false, false,
                        menuLabels[menu].displayName);
                }
            }
        }
}
