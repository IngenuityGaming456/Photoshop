import {IFactory, IParams} from "../interfaces/IJsxParam";
import {Generator} from "../../../generator-core/lib/generator";
import {Document} from "../../lib/dom/document.js";
import * as layerClass from "../../lib/dom/layer.js"
import * as path from "path";

let languagesStruct = require("../res/languages");

export class CreateLocalisationStructure implements IFactory {
    private _generator: Generator;
    private _activeDocument: Document;
    private docEmitter;

    public async execute(params: IParams) {
        this._generator = params.generator;
        this._activeDocument = params.activeDocument;
        this.docEmitter = params.docEmitter;
        this.getParents(await this.findSelectedLayers());
    }

    private async findSelectedLayers(): Promise<Array<string>> {
        const selectedIds = await this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/SelectedLayersIds.jsx"));
        return selectedIds.toString().split(",");
    }
    
    private async getParents(idsArray: Array<string>) {
        const idsMap = new Map();
        idsArray.forEach((item) => {
            let parents = [];
            this.getParentStack(null, this._activeDocument.layers.layers, Number(item), parents);
            idsMap.set(Number(item), parents);
        });
        this.drawLayers(idsMap);
    }

    private getParentStack(parent, layers, id: number, parentStack): boolean {
        parentStack = parentStack || [];
        const isExist = layers.some(item => {
            if(item instanceof layerClass.LayerGroup) {
                return this.getParentStack(item, item.layers, id, parentStack);
            } else {
                if (item.id === id) {
                    return true;
                }
            }
        });
        if(isExist && parent) {
            parentStack.push({ name: parent.name, id: parent.id });
            return true;
        }
        return false;
    }

    private async drawLayers(idsMap: Map<any, any>) {
        const idsMapKeys = [...idsMap.keys()];
        const idsMapValues = [...idsMap.values()];
        const langId = this.findLanguageId(idsMapValues);
        this.filterMapValues(idsMapValues);
        const params = {
            languages: languagesStruct.languages,
            ids: idsMapKeys,
            values: idsMapValues,
            langId: langId
        };
        this.docEmitter.emit("localisation", idsMapKeys);
        await this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/ShowPanel.jsx"), params);
    }

    private findLanguageId(idsMapValues: Array<Array<any>>) {
        const docLayers: layerClass.LayerGroup = this._activeDocument.layers;
        const parent = idsMapValues[0].find(item => {
            if(item.name.search(/(desktop|portrait|landscape)/) !== -1) {
                return true;
            }
        });
        const parentRef = docLayers.findLayer(parent.id);
        const languagesRef = parentRef.layer.layers.find(item => {
            if(item.name === "languages") {
                return true;
            }
        });
        return languagesRef.id;
    }

    private filterMapValues(filterArray) {
        filterArray.forEach(item => {
            let keyIndex;
            item.forEach((key, index) => {
                if(key.name === "common") {
                    keyIndex = index;
                }
            });
            if(keyIndex) {
                item.splice(keyIndex);
                item.reverse();
            }
        });
    }
}