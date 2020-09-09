import {IDataSubModel, IFactory, IModel, IParams} from "../interfaces/IJsxParam";
import {inject, execute} from "../modules/FactoryClass";
import {MappingModel} from "./MappingModel";
import {DataPhotoshopModel} from "./PhotoshopModels/DataPhotoshopModel";
import {NoDataPhotoshopModel} from "./PhotoshopModels/NoDataPhotoshopModel";
import {PhotoshopModel} from "./PhotoshopModels/PhotoshopModel";

let menuLabels = require("../res/menuLables.json");
let platformStruct = require("../res/platform.json");
let languagesStruct = require("../res/languages.json");

export class ModelFactory implements IFactory {
    private mappingModel: MappingModel;
    private photoshopModel: PhotoshopModel;
    private activeDocument;
    private socketStorageResponse;
    private generator;
    private openDocumentData;
    private subPhotoshopModel: IDataSubModel;
    private docEmitter;

    execute(params: IParams) {
        this.generator = params.generator;
        this.docEmitter = params.docEmitter;
        this.activeDocument = params.activeDocument;
        this.openDocumentData = params.storage.openDocumentData;
        this.subPhotoshopModel = this.checkOpenData();
        this.instantiate();
    }

    private checkOpenData() {
        if (this.openDocumentData) {
            const dataModel = inject({ref: DataPhotoshopModel, dep: []});
            execute(dataModel, {storage: {openDocumentData: this.openDocumentData}});
            return dataModel;
        }
        return inject({ref: NoDataPhotoshopModel, dep: []});
    }

    private instantiate() {
        this.mappingModel = inject({ref: MappingModel, dep: []});
        execute(this.mappingModel, {
            storage: this.getMappingStorage(),
            generator: this.generator, docEmitter: this.docEmitter,
            activeDocument: this.activeDocument
        });
        /**calling photoshop modal class */
        this.photoshopModel = inject({ref: PhotoshopModel, dep: []});
        execute(this.photoshopModel, {
            storage: this.getPhotoshopStorage(),
            generator: this.generator, docEmitter: this.docEmitter,
            activeDocument: this.activeDocument
        });
    }

    private getMappingStorage() {
        return {
            menuLabels: menuLabels,
            platformStruct: platformStruct,
            languageStruct: languagesStruct,
            openDocumentData: this.openDocumentData,
            subPhotoshopModel: this.subPhotoshopModel
        }
    }

    private getPhotoshopStorage() {
        return {
            openDocumentData: this.openDocumentData,
            subPhotoshopModel: this.subPhotoshopModel
        };
    }

    public getMappingModel() {
        return this.mappingModel;
    }

    public getPhotoshopModel() {
        return this.photoshopModel;
    }

    public handleSocketStorage(storage, type) {
        this.socketStorageResponse = storage;
        this.photoshopModel.handleSocketStorage(this.socketStorageResponse, type);
        this.mappingModel.handleSocketStorage(this.socketStorageResponse, type);
    }

}