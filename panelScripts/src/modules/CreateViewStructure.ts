import {IJsxParam, IStructure, IViewStructure} from "../interfaces/IJsxParam";
import {JsonComponentsFactory} from "./JsonComponentsFactory";
import {PhotoshopJsonComponent, QuestJsonComponent} from "./JsonComponents";
import * as path from "path";

export class CreateViewStructure implements  IStructure {

    private readonly _generator;
    private readonly _element;
    private readonly _viewClass : IViewStructure;

    public constructor(generator, viewClass: IViewStructure) {
        this._generator = generator;
        this._viewClass = viewClass;
        this._element = viewClass.getElement();
        this.drawStruct(this._element);
    }

    public async drawStruct(params: Object) {
        let insertionPoint = await this._viewClass.shouldDrawStruct();
        if(insertionPoint !== "invalid") {
            for (let keys in params) {
                if (params.hasOwnProperty(keys)) {
                    await this.makeStruct(params[keys], insertionPoint);
                }
            }
        }
    }

    public async makeStruct(parserObject: Object, insertionPoint: string) {
        let layerType: string;
        for(let keys in parserObject) {
            let jsxParams: IJsxParam = {parentName: "", childName: "", type: ""};
            if(parserObject.hasOwnProperty(keys)) {
                layerType = parserObject[keys].type;
                jsxParams.childName = parserObject[keys].id;
                jsxParams.parentName = parserObject[keys].parent ? parserObject[keys].parent : insertionPoint;
                if(!layerType && !jsxParams.childName) {
                    jsxParams.childName = keys;
                    jsxParams.type = "layerSection";
                    await this.createBaseStruct(jsxParams);
                    await this.makeStruct(parserObject[keys], keys);
                } else {
                    await this.createElementTree(jsxParams, layerType);
                }
            }
        }
    }

    private async createBaseStruct(jsxParams: IJsxParam) {
        jsxParams["checkSelection"] = "true";
        this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/InsertLayer.jsx"),
        jsxParams);
    }

    private async createElementTree(jsxParams: IJsxParam, layerType: string) {
        let jsonMap = JsonComponentsFactory.makeJsonComponentsMap();
        let element = jsonMap.get(layerType);
        if(element instanceof PhotoshopJsonComponent) {
            jsxParams.type = element.getType();
            jsxParams.subType = element.getSubType();
            await element.setJsx(this._generator, jsxParams);
        }
        if(element instanceof QuestJsonComponent) {
            await element.setJsx(this._generator, jsxParams);
        }
    }
}