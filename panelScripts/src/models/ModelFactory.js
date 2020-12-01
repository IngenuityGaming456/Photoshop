"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelFactory = void 0;
const FactoryClass_1 = require("../modules/FactoryClass");
const MappingModel_1 = require("./MappingModel");
const DataPhotoshopModel_1 = require("./PhotoshopModels/DataPhotoshopModel");
const NoDataPhotoshopModel_1 = require("./PhotoshopModels/NoDataPhotoshopModel");
const PhotoshopModel_1 = require("./PhotoshopModels/PhotoshopModel");
let menuLabels = require("../res/menuLables.json");
let platformStruct = require("../res/platform.json");
let languagesStruct = require("../res/languages.json");
class ModelFactory {
    execute(params) {
        this.generator = params.generator;
        this.docEmitter = params.docEmitter;
        this.activeDocument = params.activeDocument;
        this.openDocumentData = params.storage.openDocumentData;
        this.subPhotoshopModel = this.checkOpenData();
        this.instantiate();
    }
    checkOpenData() {
        if (this.openDocumentData) {
            const dataModel = FactoryClass_1.inject({ ref: DataPhotoshopModel_1.DataPhotoshopModel, dep: [] });
            FactoryClass_1.execute(dataModel, { storage: { openDocumentData: this.openDocumentData } });
            return dataModel;
        }
        return FactoryClass_1.inject({ ref: NoDataPhotoshopModel_1.NoDataPhotoshopModel, dep: [] });
    }
    instantiate() {
        this.mappingModel = FactoryClass_1.inject({ ref: MappingModel_1.MappingModel, dep: [] });
        FactoryClass_1.execute(this.mappingModel, {
            storage: this.getMappingStorage(),
            generator: this.generator, docEmitter: this.docEmitter,
            activeDocument: this.activeDocument
        });
        /**calling photoshop modal class */
        this.photoshopModel = FactoryClass_1.inject({ ref: PhotoshopModel_1.PhotoshopModel, dep: [] });
        FactoryClass_1.execute(this.photoshopModel, {
            storage: this.getPhotoshopStorage(),
            generator: this.generator, docEmitter: this.docEmitter,
            activeDocument: this.activeDocument
        });
    }
    getMappingStorage() {
        return {
            menuLabels: menuLabels,
            platformStruct: platformStruct,
            languageStruct: languagesStruct,
            openDocumentData: this.openDocumentData,
            subPhotoshopModel: this.subPhotoshopModel
        };
    }
    getPhotoshopStorage() {
        return {
            openDocumentData: this.openDocumentData,
            subPhotoshopModel: this.subPhotoshopModel
        };
    }
    getMappingModel() {
        return this.mappingModel;
    }
    getPhotoshopModel() {
        return this.photoshopModel;
    }
    handleSocketStorage(storage, type) {
        this.socketStorageResponse = storage;
        this.photoshopModel.handleSocketStorage(this.socketStorageResponse, type);
        this.mappingModel.handleSocketStorage(this.socketStorageResponse, type);
    }
}
exports.ModelFactory = ModelFactory;
//# sourceMappingURL=ModelFactory.js.map