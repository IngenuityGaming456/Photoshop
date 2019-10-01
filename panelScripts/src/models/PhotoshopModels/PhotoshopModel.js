"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var utils_1 = require("../../utils/utils");
var NoDataPhotoshopModel_1 = require("./NoDataPhotoshopModel");
var FactoryClass_1 = require("../../modules/FactoryClass");
var PhotoshopModel = /** @class */ (function () {
    function PhotoshopModel() {
        this.writeData = {};
        this.questItems = [];
        this.drawnQuestItems = [];
        this.viewObjStorage = [];
        this.clickedMenus = [];
        this.previousContainer = null;
        this.elementalMap = new Map();
        this.prevContainerResponse = new Map();
        this.containerResponse = new Map();
        this.questViews = [];
        this.mappedPlatform = {};
        this.questPlatforms = ["desktop", "portrait", "landscape"];
        this.layersErrorData = [];
    }
    PhotoshopModel.prototype.execute = function (params) {
        this.generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.subPhotoshopModel = params.storage.subPhotoshopModel;
        this.onPhotoshopStart();
        this.subscribeListeners();
        this.fireEvents();
        this.createStorage();
        this.filterContainers();
        this.elementalMap = this.createElementData();
        this.mappedPlatform = this.createPlatformMapping();
    };
    PhotoshopModel.prototype.subscribeListeners = function () {
        var _this = this;
        this.generator.onPhotoshopEvent("generatorMenuChanged", function (event) { return _this.onButtonMenuClicked(event); });
    };
    PhotoshopModel.prototype.fireEvents = function () {
        this.generator.emit("observerAdd", this);
    };
    PhotoshopModel.prototype.createElementData = function () {
        if (this.subPhotoshopModel instanceof NoDataPhotoshopModel_1.NoDataPhotoshopModel)
            FactoryClass_1.execute(this.subPhotoshopModel, this.getNoDataParams());
        return this.subPhotoshopModel.createElementData();
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
    PhotoshopModel.prototype.setToStarterMap = function (data) {
        this.generator.emit("setToStarterModel", this.activeDocument.id, data);
    };
    PhotoshopModel.prototype.handleSocketStorage = function (socketStorage) {
        this.prevContainerResponse = this.previousContainer;
        this.containerResponse = socketStorage;
        this.previousContainer = this.containerResponse;
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
        this.elementalMap.get(key) && this.elementalMap.get(key).set("base", id);
    };
    PhotoshopModel.prototype.setBaseMenuIds = function (platform, id, key) {
        var baseKey = this.elementalMap.get(platform).get(key);
        if (baseKey) {
            baseKey["base"] = {
                id: id,
                name: key
            };
        }
    };
    PhotoshopModel.prototype.setChildMenuIds = function (platform, childId, childName, childType, parentKey) {
        var baseKey = this.elementalMap.get(platform).get(parentKey);
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
    Object.defineProperty(PhotoshopModel.prototype, "allQuestViews", {
        get: function () {
            return this.questViews;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoshopModel.prototype, "viewStorage", {
        get: function () {
            return this.viewObjStorage;
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
    Object.defineProperty(PhotoshopModel.prototype, "clickedMenuNames", {
        get: function () {
            return this.clickedMenus;
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
    PhotoshopModel.prototype.onPhotoshopStart = function () {
    };
    PhotoshopModel.prototype.onPhotoshopClose = function () {
        this.writeData = {
            elementalMap: utils_1.utlis.mapToObject(this.elementalMap),
            clickedMenus: this.clickedMenus,
            containerResponse: utils_1.utlis.mapToObject(this.containerResponse)
        };
        this.generator.emit("writeData", this.writeData);
    };
    return PhotoshopModel;
}());
exports.PhotoshopModel = PhotoshopModel;
//# sourceMappingURL=PhotoshopModel.js.map