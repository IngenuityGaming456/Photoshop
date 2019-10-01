import {IFactory, IJsxParam, IParams, IViewStructure} from "../interfaces/IJsxParam";
import {JsonComponentsFactory} from "./JsonComponentsFactory";
import {PhotoshopJsonComponent, QuestJsonComponent} from "./JsonComponents";
import * as path from "path";
import {ModelFactory} from "../models/ModelFactory";
import {CreatePlatform, CreateView} from "./CreateViewClasses";
import {PhotoshopModel} from "../models/PhotoshopModels/PhotoshopModel";
import * as layerClass from "../../lib/dom/layer";
let packageJson = require("../../package.json");

export class CreateViewStructure implements IFactory {

    private _generator;
    private _element;
    private _pluginId;
    private readonly _viewClass : IViewStructure;
    private readonly modelFactory: ModelFactory;
    private photoshopModel: PhotoshopModel;
    private activeDocument;
    private platform;
    private baseView;
    private currentMenu;

    public constructor(viewClass: IViewStructure, modelFactory: ModelFactory) {
        this._viewClass = viewClass;
        this.modelFactory = modelFactory;
    }

    public execute(params: IParams) {
        this._pluginId = packageJson.name;
        this._generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.currentMenu = params.menuName;
        this.photoshopModel = this.modelFactory.getPhotoshopModel();
        this._element = this.getElementMap().get(params.menuName);
        this.subscribeListeners();
        this.drawStruct(this._element);
    }

    private subscribeListeners() {
        this._generator.on("drawAddedStruct", (parentId, parserObj, baseKey) => {
            this.makeStruct(parserObj, parentId, baseKey);
        });
        this._generator.on("deleteStruct", deletionId => { this.onDeletion(deletionId); });
    }

    private getElementMap() {
        if(this._viewClass instanceof CreatePlatform) {
            return this.modelFactory.getMappingModel().getPlatformMap();
        }
        if(this._viewClass instanceof CreateView) {
            return this.modelFactory.getMappingModel().getViewMap();
        }
    }
    
    private async drawStruct(params: Object) {
        let insertionPoint = await this._viewClass.shouldDrawStruct(this._generator);
        if(insertionPoint !== "invalid") {
            this.platform = this.getPlatform(insertionPoint);
            this.emitValidCalls();
            for (let keys in params) {
                if (params.hasOwnProperty(keys)) {
                    await this.makeStruct(params[keys], insertionPoint, null);
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

    private emitValidCalls() {
        this._generator.emit("validEntryStruct", this.currentMenu, this.platform);
    }

    private async makeStruct(parserObject: Object, insertionPoint: string, parentKey: string) {
        let layerType: string;
        for(let keys in parserObject) {
            let jsxParams: IJsxParam = {parentId: "", childName: "", type: ""};
            if(!parserObject.hasOwnProperty(keys)) {
                continue;
            }
            layerType = parserObject[keys].type;
            await this.setParams(jsxParams, parserObject, keys, insertionPoint);
            if(!layerType && !jsxParams.childName) {
                this.baseView = keys;
                await this.createBaseChild(jsxParams, keys, insertionPoint, parserObject);
            } else {
                this.platform && this.modifyJSXParams(jsxParams, this.getMappedKey(), layerType);
                await this.createElementTree(jsxParams, layerType, parentKey);
            }
        }
    }

    private getMappedKey() {
        const mappedPlatform = this.photoshopModel.mappedPlatformObj;
        if(this.platform) {
            return mappedPlatform[this.platform][this.baseView]["mapping"];
        }
        return null;
    }
    
    private async setParams(jsxParams, parserObject, keys, insertionPoint) {
        jsxParams.leaf = parserObject[keys].leaf;
        jsxParams.childName = parserObject[keys].id;
        jsxParams.parentId = parserObject[keys].parent ? await this.findParentId(parserObject[keys].parent, insertionPoint) : insertionPoint;    
    }
    
    private async createBaseChild(jsxParams, keys, insertionPoint, parserObject) {
        jsxParams.childName = keys;
        jsxParams.type = "layerSection";
        insertionPoint = await this.createBaseStruct(jsxParams);
        this.setBaseIds(keys, insertionPoint);
        await this.insertBaseMetaData(insertionPoint);
        await this.makeStruct(parserObject[keys], insertionPoint, keys);
    }

    private setBaseIds(keys, insertionPoint) {
        if(!this.platform) {
            this.photoshopModel.setPlatformMenuIds(Number(insertionPoint), keys);
        } else {
            this.photoshopModel.setBaseMenuIds(this.platform, Number(insertionPoint), keys);
        }
        this.photoshopModel.setDrawnQuestItems(Number(insertionPoint), keys);
    }

    private async insertBaseMetaData(insertionPoint) {
        await this._generator.setLayerSettingsForPlugin("view", insertionPoint, this._pluginId);
    }

    private async findParentId(childName, parentId): Promise<string> {
        return await this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/parentId.jsx"),
            {childName: childName, parentId: parentId});
    }

    private async createBaseStruct(jsxParams: IJsxParam): Promise<string> {
        return await this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/InsertLayer.jsx"),
            jsxParams);
    }

    private async createElementTree(jsxParams: IJsxParam, layerType: string, parentKey: string) {
        let jsonMap = JsonComponentsFactory.makeJsonComponentsMap();
        let element = jsonMap.get(layerType);
        let childId;
        if (element instanceof PhotoshopJsonComponent) {
            jsxParams.type = element.getType();
            jsxParams.subType = element.getSubType();
            childId = await element.setJsx(this._generator, jsxParams);
        }
        if (element instanceof QuestJsonComponent) {
            childId = await element.setJsx(this._generator, jsxParams);
        }
        this.setChildIds(childId, jsxParams, layerType, parentKey);
    }

    private setChildIds(childId, jsxParams, layerType, parentKey) {
        if(!this.platform) {
            this.photoshopModel.setPlatformMenuIds(childId, jsxParams.childName);
        } else {
            this.photoshopModel.setChildMenuIds(this.platform, childId, jsxParams.childName, layerType, parentKey);
        }
        this.photoshopModel.setDrawnQuestItems(childId, jsxParams.childName);
    }

    private onDeletion(deletionId) {
        this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), {id: deletionId});
    }

    private modifyJSXParams(jsxParams, mappedView, layerType) {
        if (layerType === "container") {
            if (jsxParams.leaf) {
                this.setParamsMapping(jsxParams, mappedView, layerType);
            }
        } else {
            this.setParamsMapping(jsxParams, mappedView, layerType);
        }
    }

    private setParamsMapping(jsxParams, mappedView, layerType) {
        const elementalMap = this.photoshopModel.viewElementalMap;
        for(let key in mappedView) {
            if(!mappedView.hasOwnProperty(key)) {
                continue;
            }
            const typeArray = elementalMap.get(key).get(mappedView[key])[layerType];
            const mappedLayer = typeArray.find(item => {
                if(item.name === jsxParams.childName) {
                    return true;
                }
            });
            if(mappedLayer) {
                jsxParams["mappedItem"] = mappedLayer;
                return;
            }
        }
    }

}