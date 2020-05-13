"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils/utils");
var constants_1 = require("../constants");
var MappingModel = /** @class */ (function () {
    function MappingModel() {
        this.writeData = {};
    }
    MappingModel.prototype.execute = function (params) {
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
    };
    MappingModel.prototype.fireEvents = function () {
        this.docEmitter.emit(constants_1.photoshopConstants.emitter.observerAdd, this);
    };
    MappingModel.prototype.handleSocketStorage = function (socketStorage, type) {
        this.makeViewMap(socketStorage);
        this.docEmitter.emit(constants_1.photoshopConstants.emitter.handleSocketResponse, type);
    };
    MappingModel.prototype.makeViewMap = function (responseObj) {
        this.desktopViewMap = this.makeSubViewMap(responseObj[constants_1.photoshopConstants.platforms.desktop]);
        this.landscapeViewMap = this.makeSubViewMap(responseObj[constants_1.photoshopConstants.platforms.landscape]);
        this.portraitViewMap = this.makeSubViewMap(responseObj[constants_1.photoshopConstants.platforms.portrait]);
    };
    ;
    MappingModel.prototype.makeSubViewMap = function (responseObj) {
        var viewMap = new Map();
        viewMap.set(constants_1.photoshopConstants.views.baseGame, responseObj[constants_1.photoshopConstants.views.baseGame])
            .set(constants_1.photoshopConstants.views.paytable, responseObj[constants_1.photoshopConstants.views.paytable])
            .set(constants_1.photoshopConstants.views.introOutro, responseObj[constants_1.photoshopConstants.views.introOutro])
            .set(constants_1.photoshopConstants.views.freeGame, responseObj[constants_1.photoshopConstants.views.freeGame])
            .set(constants_1.photoshopConstants.views.backgrounds, responseObj[constants_1.photoshopConstants.views.backgrounds])
            .set(constants_1.photoshopConstants.views.backgroundsFg, responseObj[constants_1.photoshopConstants.views.backgroundsFg])
            .set(constants_1.photoshopConstants.views.bigWin, responseObj[constants_1.photoshopConstants.views.bigWin])
            .set(constants_1.photoshopConstants.views.loader, responseObj[constants_1.photoshopConstants.views.loader]);
        return viewMap;
    };
    MappingModel.prototype.makeGenericViewMap = function () {
        this.genericViewMap = new Map();
        this.genericViewMap.set(constants_1.photoshopConstants.views.genericView, {
            generic: {
                generic: {}
            }
        });
    };
    MappingModel.prototype.makeComponentsMap = function () {
        var _this = this;
        this.componentsMap = new Map();
        var menuLabels = this.params.storage.menuLabels;
        Object.keys(menuLabels).forEach(function (menu) {
            if (menuLabels[menu].type === constants_1.photoshopConstants.menu.components) {
                _this.componentsMap.set(menuLabels[menu].label, {
                    label: menuLabels[menu].displayName,
                    elementArray: [],
                    filteredId: []
                });
            }
        });
    };
    MappingModel.prototype.makePlatformMap = function () {
        var desktopPlatform = { desktop: this.params.storage.platformStruct.desktop }, portraitPlatform = { portrait: this.params.storage.platformStruct.portrait }, landscapePlatform = { landscape: this.params.storage.platformStruct.landscape };
        this.platformMap = new Map();
        this.platformMap.set(constants_1.photoshopConstants.platforms.desktop, desktopPlatform)
            .set(constants_1.photoshopConstants.platforms.portrait, portraitPlatform)
            .set(constants_1.photoshopConstants.platforms.landscape, landscapePlatform);
    };
    MappingModel.prototype.makeLayoutMap = function () {
        this.layoutMap = new Map();
        this.layoutMap.set(constants_1.photoshopConstants.generatorButtons.layoutEnabled, {});
    };
    MappingModel.prototype.makeTestingMap = function () {
        this.testingMap = new Map();
        this.testingMap.set(constants_1.photoshopConstants.generatorButtons.removePath, {});
    };
    MappingModel.prototype.makeLocalisationMap = function () {
        this.localisationMap = new Map();
        this.localisationMap.set(constants_1.photoshopConstants.generatorButtons.localise, {});
    };
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
    MappingModel.prototype.getViewPlatformMap = function (platform) {
        var viewObj = {
            desktop: this.desktopViewMap,
            portrait: this.portraitViewMap,
            landscape: this.landscapeViewMap
        };
        return viewObj[platform];
    };
    MappingModel.prototype.getGenericViewMap = function () {
        return this.genericViewMap;
    };
    MappingModel.prototype.onPhotoshopStart = function () {
    };
    MappingModel.prototype.onPhotoshopClose = function () {
        this.writeData = {
            desktopViewMap: utils_1.utlis.mapToObject(this.desktopViewMap),
            portraitViewMap: utils_1.utlis.mapToObject(this.portraitViewMap),
            landscapeViewMap: utils_1.utlis.mapToObject(this.landscapeViewMap),
        };
        this.generator.emit(constants_1.photoshopConstants.generator.writeData, this.writeData);
    };
    MappingModel.prototype.handleOpenDocumentData = function (data) {
        if (data) {
            this.desktopViewMap = utils_1.utlis.objectToMap(data.desktopViewMap);
            this.portraitViewMap = utils_1.utlis.objectToMap(data.portraitViewMap);
            this.landscapeViewMap = utils_1.utlis.objectToMap(data.landscapeViewMap);
        }
    };
    return MappingModel;
}());
exports.MappingModel = MappingModel;
//# sourceMappingURL=MappingModel.js.map