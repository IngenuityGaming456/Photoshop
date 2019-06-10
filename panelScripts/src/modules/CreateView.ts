import {IJsxParam} from "../interfaces/IJsxParam";
import * as path from "path";
import {JsonComponentsFactory} from "./JsonComponentsFactory";
import {PhotoshopJsonComponent, QuestJsonComponent} from "./JsonComponents";

export class CreateView {
    private readonly _generator;

    public constructor(generator, element, viewsMap) {
        this._generator = generator;
        this.drawStruct(viewsMap.get(element.label))
    }

    private async drawStruct(params) {
        for (let keys in params) {
            if (params.hasOwnProperty(keys))
                 await this.makeStruct(params[keys], null);
        }
        return Promise.resolve();
    }

    private async makeStruct(parserObject, baseKeyName: string) {
        let layerType: string;
        for(let keys in parserObject) {
            let jsxParams: IJsxParam = {parentName: "", childName: "", type: ""};
            if(parserObject.hasOwnProperty(keys)) {
                layerType = parserObject[keys].type;
                jsxParams.childName = parserObject[keys].id;
                if(!baseKeyName) {
                    baseKeyName = keys;
                    jsxParams.childName = baseKeyName;
                    jsxParams.type = "layerSection";
                    await this._generator.evaluateJSXFile(path.join(__dirname + "../../../jsx/InsertLayer.jsx"),
                                                          jsxParams);
                    await this.makeStruct(parserObject[keys], baseKeyName);
                } else {
                    jsxParams.parentName = parserObject[keys].parent ? parserObject[keys].parent : baseKeyName;
                    await this.createElementTree(jsxParams, layerType);
                }
            }
        }
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