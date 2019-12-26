import {IFactory, IParams} from "../interfaces/IJsxParam";
import {Document} from "../../lib/dom/document.js";
import * as layerClass from "../../lib/dom/layer.js"
import * as path from "path";
import {ModelFactory} from "../models/ModelFactory";
import {utlis} from "../utils/utils";
let packageJson = require("../../package.json");
let languagesStruct = require("../res/languages");

export class CreateLocalisationStructure implements IFactory {
    private _generator;
    private _activeDocument: Document;
    private docEmitter;
    private recordedResponse = [];
    private modelFactory;

    public constructor(modelFactory: ModelFactory) {
        this.modelFactory = modelFactory;
    }

    public async execute(params: IParams) {
        this._generator = params.generator;
        this._activeDocument = params.activeDocument;
        this.docEmitter = params.docEmitter;
        this.recordedResponse = this.modelFactory.getPhotoshopModel().allRecordedResponse;
        const idsArray = await this.modifySelectedResponse(this.findSelectedLayers());
        this.getParents(idsArray);
    }

    private findSelectedLayers() {
        return this.modelFactory.getPhotoshopModel().allSelectedLayers;
    }

    private async modifySelectedResponse(idsArray: Array<string>) {
        const toSpliceIndexes = [];
        for(let item of idsArray) {
            const genSettings = await this._generator.getLayerSettingsForPlugin(this._activeDocument.id, Number(item), packageJson.name);
            if(genSettings === "button") {
                toSpliceIndexes.push(idsArray.indexOf(item));
                const button = this._activeDocument.layers.findLayer(Number(item));
                this.modifyIdsArray(button.layer, idsArray);
                utlis.spliceFromIndexes(idsArray, toSpliceIndexes);
            }
        }
        return idsArray;
    }

    private modifyIdsArray(button, idsArray) {
        button.layers.forEach(item => {
            if(item.layers) {
                item.layers.forEach(itemL => {
                    if(idsArray.indexOf(itemL.id.toString()) === -1) {
                        idsArray.push(itemL.id.toString());
                    }
                });
            }
        });
    }
    
    private async getParents(idsArray: Array<string>) {
        if(!idsArray.length) {
            this.docEmitter.emit("logWarning", "Can't Localise an empty Button");
            return;
        }
        const idsMap = new Map();
        for(let item of idsArray) {
            let parents = [];
            this.getParentStack(null, this._activeDocument.layers.layers, Number(item), parents);
            idsMap.set(Number(item), parents);
        }
        await this.drawLayers(idsMap);
    }

    private getParentStack(parent, layers, id: number, parentStack) {
        parentStack = parentStack || [];
        const isExist = layers.some(item => {
            if(item instanceof layerClass.LayerGroup) {
                return this.getParentStack(item, item.layers, id, parentStack);
            }
            if (item.id === id) {
                return true;
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
        if(!langId) {
            return;
        }
        this.filterMapValues(idsMapValues);
        const params = {
            languages: languagesStruct.languages,
            ids: idsMapKeys,
            values: idsMapValues,
            langId: langId,
            recordedResponse: this.recordedResponse
        };
        this.docEmitter.emit("localisation", idsMapKeys);
        const response = await this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/ShowPanel.jsx"), params);
        await this.handleResponse(response);
    }

    private async handleResponse(response) {
        const responseArray = response.split(":");
        for(let item of responseArray) {
            const responseSubArray = item.split(",");
            this.recordedResponse.push(responseSubArray[0]);
            await this._generator.setLayerSettingsForPlugin("lang", Number(responseSubArray[1]), packageJson.name);
            const viewCount = responseSubArray.length;
            for(let i=2;i<viewCount;i++) {
                await this._generator.setLayerSettingsForPlugin("view", Number(responseSubArray[i]), packageJson.name);
            }
        }
    }

    private findLanguageId(idsMapValues: Array<Array<any>>) {
        const docLayers: layerClass.LayerGroup = this._activeDocument.layers;
        const parent = idsMapValues[0].find(item => {
            if(item.name.search(/(desktop|portrait|landscape)/) !== -1) {
                return true;
            }
        });
        if(!this.safeToLocalise(parent, idsMapValues)) {
            return null;
        }
        const parentRef = docLayers.findLayer(parent.id);
        const languagesRef = parentRef.layer.layers.find(item => {
            if(item.name === "languages") {
                return true;
            }
        });
        return languagesRef.id;
    }

    private safeToLocalise(parent, idsMapValues) {
        if(!parent) {
            this.docEmitter.emit("logWarning", "Can't Localise a container");
            return false;
        }
        const langItem =  idsMapValues[0].find(item => {
            if (item.name.search(/(languages)/) !== -1) {
                return true;
            }
        });
        if(langItem) {
            this.docEmitter.emit("logWarning", "Can't Localise an already localised layer");
            return false;
        }
        return true;
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