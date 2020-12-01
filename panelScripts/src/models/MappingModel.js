"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MappingModel = void 0;
const utils_1 = require("../utils/utils");
const constants_1 = require("../constants");
class MappingModel {
    constructor() {
        this.writeData = {};
    }
    execute(params) {
        this.params = params;
        this.generator = params.generator;
        this.docEmitter = params.docEmitter;
        this.fireEvents();
        this.makeGenericViewMap();
        this.makeComponentsMap();
        this.makePlatformMap();
        this.makeImportMap();
        this.makeLayoutMap();
        this.makePlatformMap();
        this.makeTestingMap();
        this.makeLocalisationMap();
        this.handleOpenDocumentData(params.storage.openDocumentData);
        this.makeAssetsSyncMap();
    }
    fireEvents() {
        this.docEmitter.emit(constants_1.photoshopConstants.emitter.observerAdd, this);
    }
    handleSocketStorage(socketStorage, type) {
        this.makeViewMap(socketStorage);
        this.docEmitter.emit(constants_1.photoshopConstants.emitter.handleSocketResponse, type);
    }
    makeViewMap(responseObj) {
        this.desktopViewMap = this.makeSubViewMap(responseObj[constants_1.photoshopConstants.platforms.desktop]);
        this.landscapeViewMap = this.makeSubViewMap(responseObj[constants_1.photoshopConstants.platforms.landscape]);
        this.portraitViewMap = this.makeSubViewMap(responseObj[constants_1.photoshopConstants.platforms.portrait]);
    }
    ;
    makeSubViewMap(responseObj) {
        const viewMap = new Map();
        viewMap.set(constants_1.photoshopConstants.views.baseGame, responseObj[constants_1.photoshopConstants.views.baseGame])
            .set(constants_1.photoshopConstants.views.paytable, responseObj[constants_1.photoshopConstants.views.paytable])
            .set(constants_1.photoshopConstants.views.introOutro, responseObj[constants_1.photoshopConstants.views.introOutro])
            .set(constants_1.photoshopConstants.views.freeGame, responseObj[constants_1.photoshopConstants.views.freeGame])
            .set(constants_1.photoshopConstants.views.backgrounds, responseObj[constants_1.photoshopConstants.views.backgrounds])
            .set(constants_1.photoshopConstants.views.backgroundsFg, responseObj[constants_1.photoshopConstants.views.backgroundsFg])
            .set(constants_1.photoshopConstants.views.bigWin, responseObj[constants_1.photoshopConstants.views.bigWin])
            .set(constants_1.photoshopConstants.views.loader, responseObj[constants_1.photoshopConstants.views.loader]);
        return viewMap;
    }
    makeGenericViewMap() {
        this.genericViewMap = new Map();
        this.genericViewMap.set(constants_1.photoshopConstants.views.genericView, {});
    }
    makeComponentsMap() {
        this.componentsMap = new Map();
        const menuLabels = this.params.storage.menuLabels;
        Object.keys(menuLabels).forEach(menu => {
            if (menuLabels[menu].type === constants_1.photoshopConstants.menu.components) {
                this.componentsMap.set(menuLabels[menu].label, {
                    label: menuLabels[menu].displayName,
                    elementArray: [],
                    filteredId: []
                });
            }
        });
    }
    makePlatformMap() {
        let desktopPlatform = { desktop: this.params.storage.platformStruct.desktop }, portraitPlatform = { portrait: this.params.storage.platformStruct.portrait }, landscapePlatform = { landscape: this.params.storage.platformStruct.landscape };
        this.platformMap = new Map();
        this.platformMap.set(constants_1.photoshopConstants.platforms.desktop, desktopPlatform)
            .set(constants_1.photoshopConstants.platforms.portrait, portraitPlatform)
            .set(constants_1.photoshopConstants.platforms.landscape, landscapePlatform);
    }
    makeImportMap() {
        this.importMap = new Map();
        this.importMap.set(constants_1.photoshopConstants.generatorButtons.import, {});
    }
    /**
     * function will handle assets change functionality on click of asset change from photoshop
     */
    makeAssetsSyncMap() {
        this.assetsSyncMap = new Map();
        this.assetsSyncMap.set(constants_1.photoshopConstants.generatorButtons.syncAssets, {});
    }
    makeLayoutMap() {
        this.layoutMap = new Map();
        this.layoutMap.set(constants_1.photoshopConstants.generatorButtons.layoutEnabled, {});
    }
    makeTestingMap() {
        this.testingMap = new Map();
        this.testingMap.set(constants_1.photoshopConstants.generatorButtons.removePath, {});
    }
    makeLocalisationMap() {
        this.localisationMap = new Map();
        this.localisationMap.set(constants_1.photoshopConstants.generatorButtons.localise, {});
    }
    getComponentsMap() {
        return this.componentsMap;
    }
    getPlatformMap() {
        return this.platformMap;
    }
    getLayoutMap() {
        return this.layoutMap;
    }
    getTestingMap() {
        return this.testingMap;
    }
    getImportMap() {
        return this.importMap;
    }
    getSyncAssetsMap() {
        return this.assetsSyncMap;
    }
    getLocalisationMap() {
        return this.localisationMap;
    }
    getViewPlatformMap(platform) {
        const viewObj = {
            desktop: this.desktopViewMap,
            portrait: this.portraitViewMap,
            landscape: this.landscapeViewMap
        };
        return viewObj[platform];
    }
    getGenericViewMap() {
        return this.genericViewMap;
    }
    onPhotoshopStart() {
    }
    onPhotoshopClose() {
        this.writeData = {
            desktopViewMap: utils_1.utlis.mapToObject(this.desktopViewMap),
            portraitViewMap: utils_1.utlis.mapToObject(this.portraitViewMap),
            landscapeViewMap: utils_1.utlis.mapToObject(this.landscapeViewMap),
        };
        this.generator.emit(constants_1.photoshopConstants.generator.writeData, this.writeData);
    }
    handleOpenDocumentData(data) {
        if (data) {
            this.desktopViewMap = utils_1.utlis.objectToMap(data.desktopViewMap);
            this.portraitViewMap = utils_1.utlis.objectToMap(data.portraitViewMap);
            this.landscapeViewMap = utils_1.utlis.objectToMap(data.landscapeViewMap);
        }
    }
}
exports.MappingModel = MappingModel;
//# sourceMappingURL=MappingModel.js.map