import {IFactory, IJsxParam, IParams, IViewStructure} from "../interfaces/IJsxParam";
import {JsonComponentsFactory} from "./JsonComponentsFactory";
import {PhotoshopJsonComponent, QuestJsonComponent} from "./JsonComponents";
import * as path from "path";
import {ModelFactory} from "../models/ModelFactory";
import {CreatePlatform, CreateView} from "./CreateViewClasses";
let packageJson = require("../../package.json");

export class CreateViewStructure implements IFactory {

    private _generator;
    private _element;
    private _pluginId;
    private readonly _viewClass : IViewStructure;
    private readonly modelFactory: ModelFactory;
    
    public constructor(viewClass: IViewStructure, modelFactory: ModelFactory) {
        this._viewClass = viewClass;
        this.modelFactory = modelFactory;
    }

    public execute(params: IParams) {
        this._pluginId = packageJson.name;
        this._generator = params.generator;
        this._element = this.getElementMap().get(params.menuName);
        this.drawStruct(this._element);
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
            for (let keys in params) {
                if (params.hasOwnProperty(keys)) {
                    await this.makeStruct(params[keys], insertionPoint);
                }
            }
        }
    }

    private async makeStruct(parserObject: Object, insertionPoint: string) {
        let layerType: string;
        for(let keys in parserObject) {
            let jsxParams: IJsxParam = {parentId: "", childName: "", type: ""};
            if(parserObject.hasOwnProperty(keys)) {
                layerType = parserObject[keys].type;
                await this.setParams(jsxParams, parserObject, keys, insertionPoint);
                if(!layerType && !jsxParams.childName) {
                    await this.createBaseChild(jsxParams, keys, insertionPoint, parserObject);
                } else {
                    await this.createElementTree(jsxParams, layerType);
                }
            }
        }
    }
    
    private async setParams(jsxParams, parserObject, keys, insertionPoint) {
        jsxParams.childName = parserObject[keys].id;
        jsxParams.parentId = parserObject[keys].parent ? await this.findParentId(parserObject[keys].parent, insertionPoint) : insertionPoint;    
    }
    
    private async createBaseChild(jsxParams, keys, insertionPoint, parserObject) {
        jsxParams.childName = keys;
        jsxParams.type = "layerSection";
        insertionPoint = await this.createBaseStruct(jsxParams);
        this.modelFactory.getPhotoshopModel().setBaseMenuIds(Number(insertionPoint), keys);
        await this.insertBaseMetaData(insertionPoint);
        await this.makeStruct(parserObject[keys], insertionPoint);
    }

    private async insertBaseMetaData(insertionPoint) {
        this._generator.setLayerSettingsForPlugin("view", insertionPoint, this._pluginId);
    }

    private async findParentId(childName, parentId): Promise<string> {
        return await this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/parentId.jsx"),
            {childName: childName, parentId: parentId});
    }

    private async createBaseStruct(jsxParams: IJsxParam): Promise<string> {
        return await this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/InsertLayer.jsx"),
            jsxParams);
    }

    private async createElementTree(jsxParams: IJsxParam, layerType: string) {
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
        this.modelFactory.getPhotoshopModel().setChildMenuIds(childId, jsxParams.childName);
    }

}