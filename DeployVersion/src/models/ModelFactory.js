"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FactoryClass_1 = require("../modules/FactoryClass");
var MappingModel_1 = require("./MappingModel");
var DataPhotoshopModel_1 = require("./PhotoshopModels/DataPhotoshopModel");
var NoDataPhotoshopModel_1 = require("./PhotoshopModels/NoDataPhotoshopModel");
var PhotoshopChildModel_1 = require("./PhotoshopModels/PhotoshopChildModel");
var menuLabels = require("../res/menuLables.json");
var platformStruct = require("../res/platform.json");
var languagesStruct = require("../res/languages.json");
var ModelFactory = /** @class */ (function () {
    function ModelFactory() {
    }
    ModelFactory.prototype.execute = function (params) {
        this.generator = params.generator;
        this.docEmitter = params.docEmitter;
        this.activeDocument = params.activeDocument;
        this.openDocumentData = params.storage.openDocumentData;
        this.subPhotoshopModel = this.checkOpenData();
        this.instantiate();
    };
    ModelFactory.prototype.checkOpenData = function () {
        if (this.openDocumentData) {
            var dataModel = FactoryClass_1.inject({ ref: DataPhotoshopModel_1.DataPhotoshopModel, dep: [] });
            FactoryClass_1.execute(dataModel, { storage: { openDocumentData: this.openDocumentData } });
            return dataModel;
        }
        return FactoryClass_1.inject({ ref: NoDataPhotoshopModel_1.NoDataPhotoshopModel, dep: [] });
    };
    ModelFactory.prototype.instantiate = function () {
        this.mappingModel = FactoryClass_1.inject({ ref: MappingModel_1.MappingModel, dep: [] });
        FactoryClass_1.execute(this.mappingModel, { storage: this.getMappingStorage(),
            generator: this.generator, docEmitter: this.docEmitter,
            activeDocument: this.activeDocument });
        this.photoshopModel = FactoryClass_1.inject({ ref: PhotoshopChildModel_1.PhotoshopChildModel, dep: [] });
        FactoryClass_1.execute(this.photoshopModel, { storage: this.getPhotoshopStorage(),
            generator: this.generator, docEmitter: this.docEmitter,
            activeDocument: this.activeDocument });
    };
    ModelFactory.prototype.getMappingStorage = function () {
        return {
            menuLabels: menuLabels,
            platformStruct: platformStruct,
            languageStruct: languagesStruct,
            openDocumentData: this.openDocumentData,
            subPhotoshopModel: this.subPhotoshopModel
        };
    };
    ModelFactory.prototype.getPhotoshopStorage = function () {
        return {
            openDocumentData: this.openDocumentData,
            subPhotoshopModel: this.subPhotoshopModel
        };
    };
    ModelFactory.prototype.getMappingModel = function () {
        return this.mappingModel;
    };
    ModelFactory.prototype.getPhotoshopModel = function () {
        return this.photoshopModel;
    };
    ModelFactory.prototype.handleSocketStorage = function (storage) {
        this.socketStorageResponse = storage;
        this.photoshopModel.handleSocketStorage(this.socketStorageResponse);
        this.mappingModel.handleSocketStorage(this.socketStorageResponse);
    };
    return ModelFactory;
}());
exports.ModelFactory = ModelFactory;
//# sourceMappingURL=ModelFactory.js.map