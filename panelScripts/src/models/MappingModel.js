"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MappingModel = /** @class */ (function () {
    function MappingModel() {
    }
    MappingModel.prototype.handleSocketStorage = function (socketStorage) {
        this.makeViewMap(socketStorage);
    };
    MappingModel.prototype.makeViewMap = function (responseMap) {
        this.viewMap = new Map();
        var backgroundBG = { backgrounds: responseMap.get("backgrounds") }, backgroundFG = { backgroundsFg: responseMap.get("fgbackgrounds") };
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
    ;
    MappingModel.prototype.makeComponentsMap = function () {
        var _this = this;
        this.componentsMap = new Map();
        var menuLabels = this.params.storage.menuLabels;
        Object.keys(menuLabels).forEach(function (menu) {
            if (menuLabels[menu].type === "comp") {
                _this.componentsMap.set(menuLabels[menu].label, {
                    label: menuLabels[menu].displayName,
                    elementArray: [],
                    filteredId: []
                });
            }
        });
    };
    MappingModel.prototype.makePlatformMap = function () {
        var desktopPlatform = { desktop: this.params.storage.platformStruct.desktop }, mobilePlatform = { mobile: this.params.storage.platformStruct.mobile };
        this.platformMap = new Map();
        this.platformMap.set("DesktopView", {
            desktop: desktopPlatform
        }).set("MobileView", {
            mobile: mobilePlatform
        });
    };
    MappingModel.prototype.makeLayoutMap = function () {
        this.layoutMap = new Map();
        this.layoutMap.set("LayoutEnabled", {});
    };
    MappingModel.prototype.makeTestingMap = function () {
        this.testingMap = new Map();
        this.testingMap.set("Testing", {});
    };
    MappingModel.prototype.makeLocalisationMap = function () {
        this.localisationMap = new Map();
        this.localisationMap.set("Localise", {});
    };
    MappingModel.prototype.getViewMap = function () {
        return this.viewMap;
    };
    ;
    MappingModel.prototype.getComponentsMap = function () {
        return this.componentsMap;
    };
    MappingModel.prototype.getPlatformMap = function () {
        return this.platformMap;
    };
    MappingModel.prototype.getLayoutMap = function () {
        return this.layoutMap;
    };
    MappingModel.prototype.getTestingMap = function () {
        return this.testingMap;
    };
    MappingModel.prototype.getLocalisationMap = function () {
        return this.localisationMap;
    };
    MappingModel.prototype.execute = function (params) {
        this.params = params;
        this.makeComponentsMap();
        this.makePlatformMap();
        this.makeLayoutMap();
        this.makePlatformMap();
        this.makeTestingMap();
        this.makeLocalisationMap();
    };
    return MappingModel;
}());
exports.MappingModel = MappingModel;
//# sourceMappingURL=MappingModel.js.map