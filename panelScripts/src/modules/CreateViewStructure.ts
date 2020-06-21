import {IFactory, IParams, IViewStructure} from "../interfaces/IJsxParam";
import {ModelFactory} from "../models/ModelFactory";
import {PhotoshopModel} from "../models/PhotoshopModels/PhotoshopModel";
import * as layerClass from "../../lib/dom/layer";
import {PhotoshopFactory} from "./PhotoshopFactory";
import {photoshopConstants as pc} from "../constants";
import * as path from "path";

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
    private questComponents = ["button", "image", "label", "meter", "animation", "shape", "container", "slider"];

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
            let params = this.getElementMap().get(menuName);
            this.emitValidCalls(menuName);
            const result = await this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/CreateView.jsx"));
            params = {
                [result]: {
                    [result]: {}
                }
            };
            for (let keys in params) {
                if (params.hasOwnProperty(keys)) {
                    this.modifyMappedPlatform(keys);
                    this.modifyElementalMap(keys);
                    await this.photoshopFactory.makeStruct(params[keys], insertionObj.insertId, null, this.platform);
                }
            }
        }
    }

    private modifyMappedPlatform(view) {
        const mappedPlatform = this.modelFactory.getPhotoshopModel().mappedPlatformObj;
        for(let key in mappedPlatform) {
            if(!mappedPlatform.hasOwnProperty(key)) {
                continue;
            }
            mappedPlatform[key][view] = {};
            const firstKey = Object.keys(mappedPlatform[key])[0];
            const rear = Object.keys(mappedPlatform[key][firstKey]["mapping"])[0];
            mappedPlatform[key][view] = {
                "mapping": {
                    [rear]: view
                }
            }
        }
    }

    private modifyElementalMap(view) {
        const elementalMap = this.modelFactory.getPhotoshopModel().viewElementalMap;
        this.addViewToElementalMap(elementalMap, view);
    }

    private addViewToElementalMap(elementalMap, view) {
        for (let key in elementalMap) {
            if (!elementalMap.hasOwnProperty(key)) {
                continue;
            }
            if (view in elementalMap[key]) {
                return;
            }
            elementalMap[key][view] = this.makeElementalObject();
        }
    }

    private makeElementalObject() {
        const elementalObj = {};
        for (let item of this.questComponents) {
            elementalObj[item] = [];
        }
        return elementalObj;
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
        if(menuName != pc.views.genericView) {
            this.docEmitter.emit("validEntryStruct", this.currentMenu, this.platform);
        }
    }

}