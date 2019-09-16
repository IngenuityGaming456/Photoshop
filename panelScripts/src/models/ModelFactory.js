"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FactoryClass_1 = require("../modules/FactoryClass");
var MappingModel_1 = require("./MappingModel");
var PhotoshopModel_1 = require("./PhotoshopModel");
var menuLabels = require("../res/menuLables.json");
var platformStruct = require("../res/platform.json");
var languagesStruct = require("../res/languages.json");
var ModelFactory = /** @class */ (function () {
    function ModelFactory() {
    }
    ModelFactory.prototype.execute = function (params) {
        this.instantiate();
    };
    ModelFactory.prototype.instantiate = function () {
        this.mappingModel = FactoryClass_1.inject({ ref: MappingModel_1.MappingModel, dep: [] });
        FactoryClass_1.execute(this.mappingModel, { storage: {
                menuLabels: menuLabels,
                platformStruct: platformStruct,
                languageStruct: languagesStruct
            } });
        this.photoshopModel = FactoryClass_1.inject({ ref: PhotoshopModel_1.PhotoshopModel, dep: [] });
    };
    ModelFactory.prototype.getMappingModel = function () {
        return this.mappingModel;
    };
    ModelFactory.prototype.getPhotoshopModel = function () {
        return this.photoshopModel;
    };
    ModelFactory.prototype.handleSocketStorage = function (storage) {
        this.socketStorageResponse = new Map(storage);
        this.photoshopModel.handleSocketStorage(this.socketStorageResponse);
        this.mappingModel.handleSocketStorage(this.socketStorageResponse);
    };
    return ModelFactory;
}());
exports.ModelFactory = ModelFactory;
//# sourceMappingURL=ModelFactory.js.map