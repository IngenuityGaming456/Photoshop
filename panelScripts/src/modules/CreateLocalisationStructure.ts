import {IFactory, IParams} from "../interfaces/IJsxParam";
import {Document} from "../../lib/dom/document.js";
import * as layerClass from "../../lib/dom/layer.js"
import * as path from "path";
import {ModelFactory} from "../models/ModelFactory";
import {utlis} from "../utils/utils";
import {photoshopConstants as pc} from "../constants";
import {PhotoshopModelApp} from "../../srcExtension/models/PhotoshopModels/PhotoshopModelApp";

let packageJson = require("../../package.json");
let languagesStruct = require("../res/languages");

export class CreateLocalisationStructure implements IFactory {
    private _generator;
    private _activeDocument: Document;
    private documentManager;
    private docEmitter;
    private recordedResponse = [];
    private modelFactory;

    public constructor(modelFactory: ModelFactory) {
        this.modelFactory = modelFactory;
    }

    public async execute(params: IParams) {
        this._generator = params.generator;
        this._activeDocument = params.activeDocument;
        this.documentManager = params.storage.documentManager;
        this.docEmitter = params.docEmitter;
        await this.updateActiveDocument();
        this.recordedResponse = this.modelFactory.getPhotoshopModel().allRecordedResponse;
        const idsArray = await this.modifySelectedResponse(await this.findSelectedLayers());
        this.getParents(idsArray);
    }

    private async updateActiveDocument() {
        this._activeDocument = await this.documentManager.getDocument(this._activeDocument.id);
    }

    private async findSelectedLayers() {
        let selectedLayersString = await this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/SelectedLayersIds.jsx"));
        return selectedLayersString.toString().split(",");
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
            this.docEmitter.emit(pc.logger.logWarning, "Can't Localise an empty Button");
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
        const localisationStructure = (this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).docLocalisationStruct;
        const alreadyLocalised = [];
        this.getAlreadyLocalisedArray(idsMapKeys, localisationStructure, alreadyLocalised, null);
        const params = {
            languages: languagesStruct.languages,
            ids: idsMapKeys,
            values: idsMapValues,
            langId: langId,
            recordedResponse: this.recordedResponse,
            alreadyLocalised: alreadyLocalised
        };
        this.docEmitter.emit(pc.localisation, idsMapKeys);
        const response = await this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/ShowPanel.jsx"), params);
        response.length && this.createLocalisationStruct(idsMapKeys, idsMapValues, langId, response);
        await this.handleResponse(response);
    }

    private getAlreadyLocalisedArray(idsMapKeys, localisationLayers, alreadyLocalised, langName) {
        if(!localisationLayers) {
            return;
        }
        for(let item in localisationLayers) {
            if(!localisationLayers.hasOwnProperty(item)) {
                continue;
            }
            if(~languagesStruct["languages"].indexOf(item)) {
                langName = item;
            }
            if(localisationLayers[item].localise) {
                if(~idsMapKeys.indexOf(localisationLayers[item].localise)) {
                    const idKeyObj = utlis.hasKey(alreadyLocalised, localisationLayers[item].localise);
                    if(!idKeyObj) {
                        alreadyLocalised.push({
                            [localisationLayers[item].localise] : [langName]
                        });
                    } else {
                        idKeyObj[localisationLayers[item].localise].push(langName);
                    }
                }
                return;
            }
            this.getAlreadyLocalisedArray(idsMapKeys, localisationLayers[item], alreadyLocalised, langName);
        }
    }

    private createLocalisationStruct(mapKeys, mapValues, langId, response) {
        const localiseStruct = (this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).docLocalisationStruct || {};
        utlis.addKeyToObject(localiseStruct, langId);
        const responseArray = response.split(":");
        responseArray.forEach(response => {
            utlis.addKeyToObject(localiseStruct[langId], response.split(",")[0]);
            const responseId = localiseStruct[langId][response.split(",")[0]];
            if(response.split(",")[1] === "null") {
                return;
            }
                mapKeys.forEach((mapItem, index) => {
                const nextAvailableIndex = utlis.getNextAvailableIndex(responseId, index);
                    responseId[nextAvailableIndex] = {};
                    responseId[nextAvailableIndex]["localise"] = mapItem;
                    responseId[nextAvailableIndex]["struct"] = mapValues[index];
            })
        });
        (this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).docLocalisationStruct = localiseStruct;
    }

    private async handleResponse(response) {
        const responseArray = response.split(":");
        for(let item of responseArray) {
            const responseSubArray = item.split(",");
            this.recordedResponse.push(responseSubArray[0]);
            await this._generator.setLayerSettingsForPlugin(pc.generatorIds.lang, Number(responseSubArray[1]), packageJson.name);
            const viewCount = responseSubArray.length;
            for(let i=2;i<viewCount;i++) {
                await this._generator.setLayerSettingsForPlugin(pc.generatorIds.view, Number(responseSubArray[i]), packageJson.name);
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
            if(item.name === pc.languages) {
                return true;
            }
        });
        return languagesRef.id;
    }

    private safeToLocalise(parent, idsMapValues) {
        if(!parent) {
            this.docEmitter.emit(pc.logger.logWarning, "Can't Localise a container");
            return false;
        }
        const langItem =  idsMapValues[0].find(item => {
            if (item.name.search(/(languages)/) !== -1) {
                return true;
            }
        });
        if(langItem) {
            this.docEmitter.emit(pc.logger.logWarning, "Can't Localise an already localised layer");
            return false;
        }
        return true;
    }

    private filterMapValues(filterArray) {
        filterArray.forEach(item => {
            let keyIndex;
            item.forEach((key, index) => {
                if(key.name === pc.common) {
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