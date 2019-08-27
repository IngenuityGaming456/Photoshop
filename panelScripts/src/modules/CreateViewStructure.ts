import {IFactory, IJsxParam, IParams, IViewStructure} from "../interfaces/IJsxParam";
import {JsonComponentsFactory} from "./JsonComponentsFactory";
import {PhotoshopJsonComponent, QuestJsonComponent} from "./JsonComponents";
import * as path from "path";

export class CreateViewStructure implements  IFactory {

    private _generator;
    private _element;
    private readonly _viewClass : IViewStructure;

    public constructor(viewClass: IViewStructure) {
        this._viewClass = viewClass;
    }

    public execute(params: IParams) {
        this._generator = params.generator;
        this._element = params.factoryMap.get(params.menuName);
        this.drawStruct(this._element);
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
                jsxParams.childName = parserObject[keys].id;
                jsxParams.parentId = parserObject[keys].parent ?
                                     await this.findParentId(parserObject[keys].parent, insertionPoint) : insertionPoint;
                if(!layerType && !jsxParams.childName) {
                    jsxParams.childName = keys;
                    jsxParams.type = "layerSection";
                    insertionPoint = await this.createBaseStruct(jsxParams);
                    await this.makeStruct(parserObject[keys], insertionPoint);
                } else {
                    await this.createElementTree(jsxParams, layerType);
                }
            }
        }
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