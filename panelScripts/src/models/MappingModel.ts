import {IFactory, IModel, IParams} from "../interfaces/IJsxParam";
import {utlis} from "../utils/utils";

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
    private generator;
    private params;
    private writeData = {};
    private docEmitter;

    execute(params: IParams) {
        this.params = params;
        this.generator = params.generator;
        this.docEmitter = params.docEmitter;
        this.fireEvents();
        this.makeGenericViewMap();
        this.makeComponentsMap();
        this.makePlatformMap();
        this.makeLayoutMap();
        this.makePlatformMap();
        this.makeTestingMap();
        this.makeLocalisationMap();
        this.handleOpenDocumentData(params.storage.openDocumentData);
    }

    private fireEvents() {
        this.docEmitter.emit("observerAdd", this);
    }

    public handleSocketStorage(socketStorage) {
        this.makeViewMap(socketStorage);
        this.docEmitter.emit("HandleSocketResponse");
    }

    private makeViewMap(responseObj) {
        this.desktopViewMap = this.makeSubViewMap(responseObj["desktop"]);
        this.landscapeViewMap = this.makeSubViewMap(responseObj["landscape"]);
        this.portraitViewMap = this.makeSubViewMap(responseObj["portrait"]);
    };

    private makeSubViewMap(responseObj) {
        const viewMap = new Map();
        viewMap.set("BaseGame", responseObj["BaseGame"])
               .set("paytable", responseObj["paytable"])
               .set("IntroOutro", responseObj["IntroOutro"])
               .set("FreeGame", responseObj["FreeGame"])
               .set("backgrounds", responseObj["backgrounds"])
               .set("backgroundsFg", responseObj["backgroundsFg"])
               .set("bigWin", responseObj["bigWin"])
               .set("loader", responseObj["loader"]);
        return viewMap;
    }

    private makeGenericViewMap(){
        this.genericViewMap = new Map();
        this.genericViewMap.set("AddGenericView", {
            generic: {
                generic: {}
            }});
    }
    
    private makeComponentsMap() {
        this.componentsMap = new Map();
        const menuLabels = this.params.storage.menuLabels;
        Object.keys(menuLabels).forEach(menu => {
            if (menuLabels[menu].type === "comp") {
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
        this.platformMap.set("desktop", desktopPlatform)
                        .set("portrait", portraitPlatform)
                        .set("landscape", landscapePlatform);
    }

    private makeLayoutMap() {
        this.layoutMap = new Map();
        this.layoutMap.set("LayoutEnabled", {});
    }

    private makeTestingMap() {
        this.testingMap = new Map();
        this.testingMap.set("Testing", {});
    }

    private makeLocalisationMap() {
        this.localisationMap = new Map();
        this.localisationMap.set("Localise", {});
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
        this.generator.emit("writeData", this.writeData);
    }

    private handleOpenDocumentData(data) {
        if(data) {
            this.desktopViewMap = utlis.objectToMap(data.desktopViewMap);
            this.portraitViewMap = utlis.objectToMap(data.portraitViewMap);
            this.landscapeViewMap = utlis.objectToMap(data.landscapeViewMap);
        }
    }

}