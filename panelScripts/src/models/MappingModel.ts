import {IFactory, IModel, IParams} from "../interfaces/IJsxParam";
import {utlis} from "../utils/utils";
import {photoshopConstants as pc} from "../constants";

export class MappingModel implements IModel {
    deps?: IFactory[];
    private genericViewMap;
    private desktopViewMap;
    private landscapeViewMap;
    private portraitViewMap;
    private platformMap;
    private layoutMap;
    private testingMap;
    private localisationMap;
    private componentsMap;
    private importMap;
    private generator;
    private params;
    private writeData = {};
    private docEmitter;
    private assetsSyncMap;

    execute(params: IParams) {
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

    private fireEvents() {
        this.docEmitter.emit(pc.emitter.observerAdd, this);
    }

    public handleSocketStorage(socketStorage, type) {
        this.makeViewMap(socketStorage);
        this.docEmitter.emit(pc.emitter.handleSocketResponse, type);
    }

    private makeViewMap(responseObj) {
        this.desktopViewMap = this.makeSubViewMap(responseObj[pc.platforms.desktop]);
        this.landscapeViewMap = this.makeSubViewMap(responseObj[pc.platforms.landscape]);
        this.portraitViewMap = this.makeSubViewMap(responseObj[pc.platforms.portrait]);
    };

    private makeSubViewMap(responseObj) {
        const viewMap = new Map();
        viewMap.set(pc.views.baseGame, responseObj[pc.views.baseGame])
               .set(pc.views.paytable, responseObj[pc.views.paytable])
               .set(pc.views.introOutro, responseObj[pc.views.introOutro])
               .set(pc.views.freeGame, responseObj[pc.views.freeGame])
               .set(pc.views.backgrounds, responseObj[pc.views.backgrounds])
               .set(pc.views.backgroundsFg, responseObj[pc.views.backgroundsFg])
               .set(pc.views.bigWin, responseObj[pc.views.bigWin])
               .set(pc.views.loader, responseObj[pc.views.loader]);
        return viewMap;
    }

    private makeGenericViewMap(){
        this.genericViewMap = new Map();
        this.genericViewMap.set(pc.views.genericView, { });
    }
    
    private makeComponentsMap() {
        this.componentsMap = new Map();
        const menuLabels = this.params.storage.menuLabels;
        Object.keys(menuLabels).forEach(menu => {
            if (menuLabels[menu].type === pc.menu.components) {
                this.componentsMap.set(menuLabels[menu].label,
                {
                    label: menuLabels[menu].displayName,
                    elementArray: [],
                    filteredId: []
                });
            }                
        });
    }

    private makePlatformMap() {
        let desktopPlatform = { desktop: this.params.storage.platformStruct.desktop },
            portraitPlatform = { portrait: this.params.storage.platformStruct.portrait },
            landscapePlatform = { landscape: this.params.storage.platformStruct.landscape };
        this.platformMap = new Map();
        this.platformMap.set(pc.platforms.desktop, desktopPlatform)
                        .set(pc.platforms.portrait, portraitPlatform)
                        .set(pc.platforms.landscape, landscapePlatform);
    }

    private makeImportMap() {
        this.importMap = new Map();
        this.importMap.set(pc.generatorButtons.import, {});
    }

    /**
     * function will handle assets change functionality on click of asset change from photoshop
     */
    private makeAssetsSyncMap() {
        this.assetsSyncMap = new Map();
        this.assetsSyncMap.set(pc.generatorButtons.syncAssets, {});
    }

    private makeLayoutMap() {
        this.layoutMap = new Map();
        this.layoutMap.set(pc.generatorButtons.layoutEnabled, {});
    }

    private makeTestingMap() {
        this.testingMap = new Map();
        this.testingMap.set(pc.generatorButtons.removePath, {});
    }

    private makeLocalisationMap() {
        this.localisationMap = new Map();
        this.localisationMap.set(pc.generatorButtons.localise, {});
    }

    public getComponentsMap() {
        return this.componentsMap;
    }
    
    public getPlatformMap() {
        return this.platformMap;
    }
    
    public getLayoutMap() {
        return this.layoutMap;
    }
    
    public getTestingMap() {
        return this.testingMap;
    }

    public getImportMap() {
        return this.importMap;
    }
    public getSyncAssetsMap(){
        return this.assetsSyncMap;
    }
    
    public getLocalisationMap() {
        return this.localisationMap;
    }

    public getViewPlatformMap(platform) {
        const viewObj = {
            desktop: this.desktopViewMap,
            portrait: this.portraitViewMap,
            landscape: this.landscapeViewMap
        };
        return viewObj[platform];
    }

    public getGenericViewMap() {
        return this.genericViewMap;
    }

    public onPhotoshopStart() {

    }

    public onPhotoshopClose() {
        this.writeData = {
            desktopViewMap: utlis.mapToObject(this.desktopViewMap),
            portraitViewMap: utlis.mapToObject(this.portraitViewMap),
            landscapeViewMap: utlis.mapToObject(this.landscapeViewMap),
        };
        this.generator.emit(pc.generator.writeData, this.writeData);
    }

    private handleOpenDocumentData(data) {
        if(data) {
            this.desktopViewMap = utlis.objectToMap(data.desktopViewMap);
            this.portraitViewMap = utlis.objectToMap(data.portraitViewMap);
            this.landscapeViewMap = utlis.objectToMap(data.landscapeViewMap);
        }
    }

}