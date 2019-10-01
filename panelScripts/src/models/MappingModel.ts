import {IFactory, IModel, IParams} from "../interfaces/IJsxParam";
import {utlis} from "../utils/utils";

export class MappingModel implements IModel {
    deps?: IFactory[];
    private viewMap;
    private platformMap;
    private layoutMap;
    private testingMap;
    private localisationMap;
    private componentsMap;
    private generator;
    private params;
    private writeData = {};

    execute(params: IParams) {
        this.params = params;
        this.generator = params.generator;
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
        this.generator.emit("observerAdd", this);
    }

    public handleSocketStorage(socketStorage) {
        this.makeViewMap(socketStorage);
        this.generator.emit("HandleSocketResponse");
    }

    private makeViewMap(responseMap) {
        this.viewMap = new Map();
        let backgroundBG = { backgrounds: responseMap.get("backgrounds") },
            backgroundFG = { backgroundsFg: responseMap.get("fgbackgrounds") };
        this.viewMap.set("AddMainView", {
            backgrounds: backgroundBG,
            bigWinPresentation: responseMap.get("bigWinPresentation"),
            baseGame: responseMap.get("baseGame")
        }).set("AddPaytable", {
            paytable: responseMap.get("paytable")
        }).set("AddIntroOutro", {
            IntroOutro: responseMap.get("IntroOutro")
        }).set("AddFreeGameView", {
            fgbackgrounds: backgroundFG,
            freeGame: responseMap.get("freeGame")
        });
    };
    
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

    public getViewMap() {
        return this.viewMap;
    };
    
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

    public onPhotoshopStart() {

    }

    public onPhotoshopClose() {
        this.writeData = {
            viewMap: utlis.mapToObject(this.viewMap)
        };
        this.generator.emit("writeData", this.writeData);
    }

    private handleOpenDocumentData(data) {
        if(data) {
            this.viewMap = utlis.objectToMap(data.viewMap);
        }
    }

}