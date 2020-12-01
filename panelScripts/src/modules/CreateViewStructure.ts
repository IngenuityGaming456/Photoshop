import {IFactory, IParams, IViewStructure} from "../interfaces/IJsxParam";
import {ModelFactory} from "../models/ModelFactory";
import * as layerClass from "../../lib/dom/layer";
import {PhotoshopFactory} from "./PhotoshopFactory";
import {photoshopConstants as pc} from "../constants";
import * as path from "path";
import {utlis} from "../utils/utils";
import {PhotoshopModelApp} from "../../srcExtension/models/PhotoshopModels/PhotoshopModelApp";

let packageJson = require("../../package.json");

export class CreateViewStructure implements IFactory {

    private _generator;
    private _pluginId;
    private readonly _viewClass : IViewStructure;
    private readonly modelFactory: ModelFactory;
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
            this.emitValidCalls(menuName);
            const result = await this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/CreateView.jsx"));
            utlis.pushUniqueToArray((this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).selfMadeViews, result);
            let params = {
                [result]: {
                    [result]: {}
                }
            };
            for (let keys in params) {
                if (params.hasOwnProperty(keys)) {
                    this.modifyElementalMap(keys);
                    await this.photoshopFactory.makeStruct(params[keys], insertionObj.insertId, null, this.platform);
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