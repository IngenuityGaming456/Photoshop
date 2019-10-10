import {IFactory, IModel, IParams} from "../interfaces/IJsxParam";
import {utlis} from "../utils/utils";

export class MappingModel implements IModel {
    deps?: IFactory[];
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
        viewMap.set("AddMainView", {
            backgrounds: responseObj["backgrounds"],
            bigWin: responseObj["bigWin"],
            baseGame: responseObj["baseGame"]
        }).set("AddPaytable", {
            paytable: responseObj["paytable"]
        }).set("AddIntroOutro", {
            IntroOutro: responseObj["IntroOutro"]
        }).set("AddFreeGameView", {
            backgroundsFg: responseObj["backgroundsFg"],
            freeGame: responseObj["freeGame"]
        });
        return viewMap;
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
            mobilePlatform = { mobile: this.params.storage.platformStruct.mobile };
        this.platformMap = new Map();
        this.platformMap.set("DesktopView", {
            desktop: desktopPlatform
        }).set("MobileView", {
            mobile: mobilePlatform
        });
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