import {IFactory, IJsxParam, IParams, IViewStructure} from "../interfaces/IJsxParam";
import {ModelFactory} from "../models/ModelFactory";
import {CreatePlatform, CreateView} from "./CreateViewClasses";
import {PhotoshopModel} from "../models/PhotoshopModels/PhotoshopModel";
import * as layerClass from "../../lib/dom/layer";
import {PhotoshopFactory} from "./PhotoshopFactory";
let packageJson = require("../../package.json");

export class CreateViewStructure implements IFactory {

    private _generator;
    private _pluginId;
    private readonly _viewClass : IViewStructure;
    private readonly modelFactory: ModelFactory;
    private photoshopModel: PhotoshopModel;
    private activeDocument;
    private platform;
    private currentMenu;
    private viewDeletionObj;
    private menuName;
    private photoshopFactory;
    private docEmitter;

    public constructor(viewClass: IViewStructure, modelFactory: ModelFactory, photoshopFactory: PhotoshopFactory) {
        this._viewClass = viewClass;
        this.modelFactory = modelFactory;
        this.viewDeletionObj = this.modelFactory.getPhotoshopModel().viewDeletion;
        this.photoshopFactory = photoshopFactory;
    }

    public execute(params: IParams) {
        this.menuName = params.menuName;
        this._pluginId = packageJson.name;
        this._generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.currentMenu = params.menuName;
        this.docEmitter = params.docEmitter;
        this.photoshopModel = this.modelFactory.getPhotoshopModel();
        this.drawStruct(params.menuName);
    }

    private getElementMap() {
        return this.modelFactory.getMappingModel().getGenericViewMap();
    }
    
    private async drawStruct(menuName) {
        let insertionObj = await this._viewClass.shouldDrawStruct(this._generator, this.docEmitter, this.getPlatform.bind(this),
                                                                   this.viewDeletionObj, this.menuName);
        if(insertionObj !== "invalid") {
            this.platform = insertionObj.platform;
            const params = this.getElementMap().get(menuName);
            this.emitValidCalls(menuName);
            for (let keys in params) {
                if (params.hasOwnProperty(keys)) {
                    await this.photoshopFactory.makeStruct(params[keys], insertionObj.insertId, null, this.platform);
                }
            }
        }
    }

    private getPlatform(insertionPoint) {
        if(!insertionPoint) {
            return null;
        } else {
            const activeDocumentLayers: layerClass.LayerGroup = this.activeDocument.layers;
            const insertionRef = activeDocumentLayers.findLayer(Number(insertionPoint));
            return insertionRef.layer.group.name;
        }
    }

    private emitValidCalls(menuName) {
        if(menuName != "AddGenericView") {
            this.docEmitter.emit("validEntryStruct", this.currentMenu, this.platform);
        }
    }

}