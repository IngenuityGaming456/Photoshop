import {IFactory, IParams} from "../../interfaces/IJsxParam";
import * as fs from "fs";
import * as path from "path";
import {utlis} from "../../utils/utils";
import {ModelFactory} from "../../models/ModelFactory";
import {photoshopConstants as pc} from "../../constants";

let packageJson = require("../../../package.json");

export class CreateLayoutStructure implements IFactory {
    private _generator;
    private _pluginId;
    private _activeDocument;
    private layerMap;
    private bufferMap;
    //dirty hack for test
    private modifiedIds = [];
    private modelFactory;
    private assetsPath;
    private docEmitter;
    private result;
    //just for test

    public constructor(modelFactory: ModelFactory) {
        this.modelFactory = modelFactory;
        this.modifiedIds = this.modelFactory.getPhotoshopModel().allModifiedIds || [];
        this.modifiedIds.length = 0;
    }

    public async execute(params: IParams) {
        this._generator = params.generator;
        this._pluginId = packageJson.name;
        this._activeDocument = params.activeDocument;
        this.layerMap = params.storage.layerMap;
        this.bufferMap = params.storage.bufferMap;
        this.assetsPath = params.storage.assetsPath;
        this.docEmitter = params.docEmitter;
        this.emitStartStatus();
        await this.upperLevelUnwantedLayers();
        await this.restructureTempLayers();
        await this.modifyPathNames();
        const result = await this.requestDocument();
        this.result = result;
        utlis.traverseObject(result.layers, this.filterResult.bind(this));
        this.modifyJSON(result.layers);
        this.modifyBottomBar(result.layers);
        await this.removeUnwantedLayers();
        this.removeDuplicates(result.layers);
        this.writeJSON(result);
        this.emitStopStatus();
    }

    private emitStartStatus() {
        this.docEmitter.emit(pc.logger.logStatus, "Started generating layout");
    }

    private async restructureTempLayers() {
        await this.restructure(pc.generatorButtons.symbols);
        await this.restructure(pc.generatorButtons.winFrames);
        await this.restructure(pc.generatorButtons.paylines);
    }

    private async restructure(layerName) {
        const drawnQuestItems = this.modelFactory.getPhotoshopModel().allDrawnQuestItems;
        const items = drawnQuestItems.filter(item => {
            if (item.name === layerName) {
                return true
            }
        });
        for (let item of items) {
            const structRef = this._activeDocument.layers.findLayer(item.id);
            if(structRef.layer.group.name === pc.views.baseGame) {
                return;
            }
            if(structRef.layer.layers) {
                const structRefNestedLayers = structRef.layer.layers.length;
                for(let i=0;i<structRefNestedLayers;i++) {
                    await this._generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/addSpecialPath.jsx"),
                        {id: structRef.layer.layers[i].layers[0].id, parentName: layerName,
                    subLayerName: structRef.layer.layers[i].name});
                }
            }
        }
    }

    private async requestDocument() {
        return await this._generator.getDocumentInfo(undefined);
    }

    private filterResult(artLayerRef) {
        artLayerRef.name = this.applySplitter(artLayerRef.name);
        delete artLayerRef["generatorSettings"][this._pluginId];
    }

    private applySplitter(artLayerName) {
        if (~artLayerName.search(/\.(png|jpg)/)) {
            const extensionIndex = artLayerName.indexOf(".");
            const slashIndex = artLayerName.lastIndexOf("/");
            if (slashIndex > -1) {
                return artLayerName.substring(slashIndex + 1, extensionIndex);
            } else {
                return artLayerName.substring(0, extensionIndex);
            }
        }
        return artLayerName;
    }

    private async writeJSON(result) {
        fs.writeFile(this.assetsPath + ".json", JSON.stringify(result, null, "  "), (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("File successfully written");
            }
        });
    }

    private async modifyPathNames() {
        const bufferKeys = [...this.layerMap.keys()];
        this.modelFactory.getPhotoshopModel().isRenamedFromLayout = true;
        const bufferKeysCount = bufferKeys.length;
        let lastUniqueId;
        for(let i=0;i<bufferKeysCount;i++) {
            const layerValue = this.layerMap.get(bufferKeys[i]);
            if(layerValue.frequency === 1) {
                lastUniqueId = bufferKeys[i];
            }
        }
        this.modelFactory.getPhotoshopModel().lastRename = lastUniqueId;
        for (let i=0;i<bufferKeysCount;i++) {
            const layerValue = this.layerMap.get(bufferKeys[i]);
            await this.handleBufferValue(layerValue, bufferKeys[i]);
        }
    }

    private async handleBufferValue(layerValue, key) {
        const layerRef = this._activeDocument.layers.findLayer(key);
        if (layerValue.frequency === 1 || (layerRef && utlis.getElementName(layerRef, pc.languages))) {
            !~this.modifiedIds.indexOf(key) && this.modifiedIds.push(key);
            await this._generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/addPath.jsx"),
                {id: key});
        }
        await this.setDuplicateMetaData(this.applySplitter(this.bufferMap.get(layerValue.buffer).parentName), key);
    }

    private async setDuplicateMetaData(parentName, key) {
        await this._generator.setLayerSettingsForPlugin({
            image: parentName
        }, key, this._pluginId + "Image");
    }

    private async removeUnwantedLayers() {
        const targetPath = this.assetsPath + "-assets";
        if(fs.existsSync(targetPath)) {
            fs.readdirSync(targetPath).forEach(fileName => {
                this.removeFiles(targetPath + "/" + fileName);
            });
        }
    }

    private async upperLevelUnwantedLayers() {
        this.modelFactory.getPhotoshopModel().isDeletedFromLayout = true;
        const str = `var upperLevelLayers = app.activeDocument.layers; 
                     var layersCount = upperLevelLayers.length;
                     for(var i=0;i<layersCount;i++) {
                          if(!~upperLevelLayers[i].name.search(/(desktop|landscape|portrait)/)) {
                               upperLevelLayers[i].remove();
                          }         
                     }`;
        await this._generator.evaluateJSXString(str);
    }

    private removeFiles(targetPath) {
        const path = targetPath + "/" + pc.common;
        if(!fs.existsSync(path)) {
            return;
        }
        fs.readdirSync(path).forEach(fileName => {
            if (~fileName.search(/(Animation)/)) {
                utlis.removeFile(path + "/" + fileName);
            }
        });
    }

    private modifyJSON(resultLayers) {
        resultLayers.forEach(item => {
            if(!item.layers) {
                return;
            }
            if (item.name === pc.views.freeGame) {
                const freeGameLayers = item.layers;
                const symbolRef = freeGameLayers.find(itemFG => {
                    if (itemFG.name === pc.generatorButtons.symbols) {
                        return true;
                    }
                });
                if (symbolRef) {
                    symbolRef.name += pc.fg;
                }
            } else if (item.layers) {
                this.modifyJSON(item.layers);
            }
        });
    }

    private modifyBottomBar(resultLayers) {
        resultLayers.forEach(item => {
            if (item.name === pc.views.baseGame) {
                const freeGameLayers = item.layers;
                const symbolRef = freeGameLayers.find(itemFG => {
                    if (itemFG.name === pc.buttonsContainerBg) {
                        return true;
                    }
                });
                if (symbolRef) {
                    symbolRef.name = pc.buttonsContainer;
                }
            } else if (item.layers) {
                this.modifyBottomBar(item.layers);
            }
        });
    }

    private removeDuplicates(layers) {
        for(let item of layers) {
            if(item.name === pc.common) {
                this.handleCommonLayers(item);
                break;
            }
            if(item.layers) {
                this.removeDuplicates(item.layers);
            }
        }
    }

    private handleCommonLayers(item) {
        const commonLayers = item.layers;
        commonLayers && commonLayers.forEach(view => {
             view.layers && this.handleViewDuplicates(view.layers, null);
        });
    }

    private handleViewDuplicates(viewLayers, uiMap) {
        uiMap = uiMap || [];
        viewLayers.forEach(item => {
            if(item.type === "layerSection" && !(item.generatorSettings && item.generatorSettings[this._pluginId])
                && utlis.isNotContainer(item, this._activeDocument, this.result.layers, this._pluginId)) {
                return;
            }
            if(~uiMap.indexOf(item.name)) {
                const sequence = this.getCorrectSequence(uiMap, item.name, 1);
                uiMap.push(item.name + sequence);
                item.name = item.name + sequence;
            }else {
                uiMap.push(item.name);
            }
            // //Mocking a text layer as it does not have generator setting by default.
            // if(item.type === "textLayer") {
            //     utlis.putComponentInGeneratorSettings(item, this._pluginId, "label");
            //
            // }
            // if(item.type === "layerSection") {
            //     utlis.putComponentInGeneratorSettings(item, this._pluginId, "container");
            // }
            // if(item.type === "layer") {
            //     utlis.putComponentInGeneratorSettings(item, this._pluginId, "image");
            // }
            // if(item.generatorSettings && item.generatorSettings[this._pluginId]) {
            //     const genSettings = item.generatorSettings[this._pluginId].json;
            //     if(!uiMap.hasOwnProperty(genSettings)) {
            //         uiMap[genSettings] = [];
            //         uiMap[genSettings].push(item.name);
            //     } else {
            //         if(~uiMap[genSettings].indexOf(item.name)) {
            //
            //         } else {
            //             uiMap[genSettings].push(item.name);
            //         }
            //     }
            // }
            if(item.layers) {
                this.handleViewDuplicates(item.layers, uiMap);
            }
        })
    }

    private getCorrectSequence(uiArray, name, count) {
        if(~uiArray.indexOf(name + count)) {
            return this.getCorrectSequence(uiArray, name, ++count);
        } else {
            return count;
        }
    }

    private emitStopStatus() {
        this.docEmitter.emit(pc.logger.logStatus, "Layout Generation done");
    }

}