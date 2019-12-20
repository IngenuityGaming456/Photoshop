"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var utils_1 = require("../../utils/utils");
var NoDataPhotoshopModel_1 = require("./NoDataPhotoshopModel");
var FactoryClass_1 = require("../../modules/FactoryClass");
var menuLabels = require("../../res/menuLables");
var PhotoshopModel = /** @class */ (function () {
    function PhotoshopModel() {
        this.writeData = {};
        this.questItems = [];
        this.drawnQuestItems = [];
        this.viewObjStorage = [];
        this.clickedMenus = [];
        this.previousContainer = null;
        this.elementalMap = {};
        this.questViews = [];
        this.mappedPlatform = {};
        this.questPlatforms = ["desktop", "portrait", "landscape"];
        this.layersErrorData = [];
        this.menuStates = [];
    }
    PhotoshopModel.prototype.execute = function (params) {
        this.generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.docEmitter = params.docEmitter;
        this.subPhotoshopModel = params.storage.subPhotoshopModel;
        this.onPhotoshopStart();
        this.subscribeListeners();
        this.fireEvents();
        this.createStorage();
        this.filterContainers();
        this.handleData();
    };
    PhotoshopModel.prototype.subscribeListeners = function () {
        var _this = this;
        this.generator.onPhotoshopEvent("generatorMenuChanged", function (event) { return _this.onButtonMenuClicked(event); });
    };
    PhotoshopModel.prototype.fireEvents = function () {
        this.docEmitter.emit("observerAdd", this);
    };
    PhotoshopModel.prototype.handleData = function () {
        this.executeSubModels();
        this.elementalMap = this.createElementData();
        this.mappedPlatform = this.createPlatformMapping();
        this.platformDeletion = this.createPlatformDeletion();
        this.viewDeletionObj = this.createViewDeletionObj();
        this.menuStates = this.accessMenuState();
        this.currentState = this.accessCurrentState();
        this.previousContainer = this.accessContainerResponse();
        this.drawnQuestItems = this.accessDrawnQuestItems();
    };
    PhotoshopModel.prototype.executeSubModels = function () {
        if (this.subPhotoshopModel instanceof NoDataPhotoshopModel_1.NoDataPhotoshopModel) {
            FactoryClass_1.execute(this.subPhotoshopModel, this.getNoDataParams());
        }
    };
    PhotoshopModel.prototype.createElementData = function () {
        return this.subPhotoshopModel.createElementData();
    };
    PhotoshopModel.prototype.createPlatformDeletion = function () {
        return this.subPhotoshopModel.createPlatformDeletion();
    };
    PhotoshopModel.prototype.createViewDeletionObj = function () {
        return this.subPhotoshopModel.createViewDeletionObj();
    };
    PhotoshopModel.prototype.accessMenuState = function () {
        return this.subPhotoshopModel.accessMenuState();
    };
    PhotoshopModel.prototype.accessCurrentState = function () {
        return this.subPhotoshopModel.accessCurrentState();
    };
    PhotoshopModel.prototype.accessContainerResponse = function () {
        return this.subPhotoshopModel.accessContainerResponse();
    };
    PhotoshopModel.prototype.accessDrawnQuestItems = function () {
        return this.subPhotoshopModel.accessDrawnQuestItems();
    };
    PhotoshopModel.prototype.getNoDataParams = function () {
        return {
            storage: {
                viewObjStorage: this.viewObjStorage,
                questPlatforms: this.questPlatforms,
            }
        };
    };
    PhotoshopModel.prototype.onButtonMenuClicked = function (event) {
        this.clickedMenus.push(event.generatorMenuChanged.name);
    };
    PhotoshopModel.prototype.handleSocketStorage = function (socketStorage) {
        this.prevContainerResponse = this.previousContainer;
        this.containerResponse = socketStorage;
        this.previousContainer = this.containerResponse;
        console.log(this.prevContainerResponse);
        console.log(this.prevContainerResponse === this.previousContainer);
    };
    PhotoshopModel.prototype.createStorage = function () {
        var _this = this;
        var folderPath = path.join(__dirname, "../../viewRes");
        fs.readdirSync(folderPath).forEach(function (fileName) {
            var jsonObject = require(folderPath + "/" + fileName);
            _this.viewObjStorage.push(jsonObject);
        });
    };
    PhotoshopModel.prototype.filterContainers = function () {
        var _this = this;
        this.viewObjStorage.forEach(function (item) {
            _this.storeItems(item);
        });
    };
    PhotoshopModel.prototype.storeItems = function (item) {
        var _this = this;
        Object.keys(item).forEach(function (key) {
            if (!item[key].type) {
                _this.questViews.push(key);
                _this.storeItems(item[key]);
            }
            _this.pushToItems(key);
        });
    };
    PhotoshopModel.prototype.pushToItems = function (key) {
        if (!utils_1.utlis.isKeyExists(this.questItems, key)) {
            this.questItems.push(key);
        }
    };
    PhotoshopModel.prototype.createPlatformMapping = function () {
        var _this = this;
        var mappedPlatform = {};
        this.questPlatforms.forEach(function (item, index) {
            mappedPlatform[item] = {};
            _this.questViews.forEach(function (itemV) {
                mappedPlatform[item][itemV] = _this.constructViewMapping(itemV, index);
            });
        });
        return mappedPlatform;
    };
    PhotoshopModel.prototype.constructViewMapping = function (itemV, index) {
        var nestedViewMap = {};
        if (itemV === "freeGame") {
            return {
                mapping: (_a = {},
                    _a[this.questPlatforms[index]] = "baseGame",
                    _a)
            };
        }
        var consecutiveIndexes = utils_1.utlis.getConsecutiveIndexes(this.questPlatforms, index);
        nestedViewMap[this.questPlatforms[consecutiveIndexes.firstIndex]] = itemV;
        nestedViewMap[this.questPlatforms[consecutiveIndexes.secondIndex]] = itemV;
        return {
            mapping: nestedViewMap
        };
        var _a;
    };
    PhotoshopModel.prototype.setPlatformMenuIds = function (id, key) {
        if (this.elementalMap[key]) {
            this.elementalMap[key]["base"] = id;
        }
    };
    PhotoshopModel.prototype.setBaseMenuIds = function (platform, id, key) {
        var baseKey = this.elementalMap[platform][key];
        if (baseKey) {
            baseKey["base"] = {
                id: id,
                name: key
            };
        }
    };
    PhotoshopModel.prototype.setChildMenuIds = function (platform, childId, childName, childType, parentKey) {
        var baseKey = this.elementalMap[platform][parentKey];
        if (baseKey) {
            baseKey[childType].push({
                id: childId,
                name: childName
            });
        }
    };
    PhotoshopModel.prototype.setDrawnQuestItems = function (id, key) {
        this.drawnQuestItems.push({ id: id, name: key });
    };
    Object.defineProperty(PhotoshopModel.prototype, "menuCurrentState", {
        get: function () {
            return this.currentState;
        },
        set: function (currentState) {
            this.currentState = currentState;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoshopModel.prototype, "allDrawnQuestItems", {
        get: function () {
            return this.drawnQuestItems;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoshopModel.prototype, "viewElementalMap", {
        get: function () {
            return this.elementalMap;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoshopModel.prototype, "allQuestItems", {
        get: function () {
            return this.questItems;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoshopModel.prototype, "currentContainerResponse", {
        get: function () {
            return this.containerResponse;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoshopModel.prototype, "mappedPlatformObj", {
        get: function () {
            return this.mappedPlatform;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoshopModel.prototype, "previousContainerResponse", {
        get: function () {
            return this.prevContainerResponse;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoshopModel.prototype, "allQuestPlatforms", {
        get: function () {
            return this.questPlatforms;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoshopModel.prototype, "allLayersErrorData", {
        get: function () {
            return this.layersErrorData;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoshopModel.prototype, "viewDeletion", {
        get: function () {
            return this.viewDeletionObj;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoshopModel.prototype, "allPlatformDeletion", {
        get: function () {
            return this.platformDeletion;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoshopModel.prototype, "allMenuStates", {
        get: function () {
            return this.menuStates;
        },
        enumerable: true,
        configurable: true
    });
    PhotoshopModel.prototype.onPhotoshopStart = function () {
    };
    PhotoshopModel.prototype.onPhotoshopClose = function () {
        this.writeData = {
            elementalMap: this.elementalMap,
            clickedMenus: this.clickedMenus,
            containerResponse: this.containerResponse,
            viewDeletion: this.viewDeletionObj,
            platformDeletion: this.platformDeletion,
            menuStates: this.getMenuStates(),
            menuCurrentState: this.currentState,
            drawnQuestItems: this.drawnQuestItems
        };
        this.generator.emit("writeData", this.writeData);
    };
    PhotoshopModel.prototype.getMenuStates = function () {
        for (var key in menuLabels) {
            if (!menuLabels.hasOwnProperty(key)) {
                continue;
            }
            var menuResult = this.generator.getMenuState(menuLabels[key].label);
            if (menuResult && !menuResult.enabled) {
                this.menuStates.push(menuLabels[key].label);
            }
        }
        return this.menuStates;
    };
    return PhotoshopModel;
}());
exports.PhotoshopModel = PhotoshopModel;
//# sourceMappingURL=PhotoshopModel.js.map