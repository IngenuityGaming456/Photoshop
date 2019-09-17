import {IFactory, IModel, IParams} from "../interfaces/IJsxParam";
import {inject, execute} from "../modules/FactoryClass";
import {MappingModel} from "./MappingModel";
import {PhotoshopModel} from "./PhotoshopModel";
let menuLabels = require("../res/menuLables.json");
let platformStruct = require("../res/platform.json");
let languagesStruct = require("../res/languages.json");

export class ModelFactory implements IFactory {
    private mappingModel: MappingModel;
    private photoshopModel: PhotoshopModel;
    private socketStorageResponse;
    private generator;

    execute(params: IParams) {
        this.generator = params.generator;
        this.instantiate();
    }
    
    private instantiate() {
        this.mappingModel = inject({ref: MappingModel, dep: []});
        execute(this.mappingModel, {storage: {
                menuLabels: menuLabels,
                platformStruct: platformStruct,
                languageStruct: languagesStruct
            }});
        this.photoshopModel = inject({ref: PhotoshopModel, dep: []});
        execute(this.photoshopModel, {generator: this.generator});
    }
    
    public getMappingModel() {
        return this.mappingModel;
    }
    
    public getPhotoshopModel() {
        return this.photoshopModel;
    }

    public handleSocketStorage(storage) {
        this.socketStorageResponse = new Map(storage);
        this.photoshopModel.handleSocketStorage(this.socketStorageResponse);
        this.mappingModel.handleSocketStorage(this.socketStorageResponse);
    }

}