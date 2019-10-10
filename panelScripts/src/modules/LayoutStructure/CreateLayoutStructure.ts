import {IFactory, IParams} from "../../interfaces/IJsxParam";
import {Generator} from "../../../../generator-core/lib/generator.js";
import * as fs from "fs";
import * as path from "path";
import {utlis} from "../../utils/utils";
import {ModelFactory} from "../../models/ModelFactory";
let packageJson = require("../../../package.json");

export class CreateLayoutStructure implements IFactory {
    private _generator: Generator;
    private _pluginId;
    private _activeDocument;
    private layerMap;
    private bufferMap;
    //dirty hack for test
    public static listenerFn: Function;
    public static modifiedIds = [];
    private modelFactory;

    public constructor(modelFactory: ModelFactory) {
        this.modelFactory = modelFactory;
    }

    public async execute(params: IParams) {
        this._generator = params.generator;
        this._pluginId = packageJson.name;
        this._activeDocument = params.activeDocument;
        this.layerMap = params.storage.layerMap;
        this.bufferMap = params.storage.bufferMap;
        this.unsubscribeEventListener("imageChanged");
        await this.restructureTempLayers();
        await this.modifyPathNames();
        const result = await this.requestDocument();
        utlis.traverseObject(result.layers, this.filterResult.bind(this));
        this.modifyJSON(result.layers);
        this.modifyBottomBar(result.layers);
        this.writeJSON(result, this.getPath());
        this.removeUnwantedLayers();
    }

    private async restructureTempLayers() {
        await this.restructure("Symbols");
        await this.restructure("WinFrames");
        await this.restructure("Paylines");
    }

    private async restructure(layerName) {
        const drawnQuestItems = this.modelFactory.getPhotoshopModel().allDrawnQuestItems;
        const items = drawnQuestItems.map(item => {
            if (item.name === layerName) {
                return item.id;
            }
            return -1;
        });
        for(let item of items) {
            if(item > -1) {
                await this._generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/addSpecialPath.jsx"),
                    {id: item});
            }
        }
    }

    private async requestDocument() {
        return await this._generator.getDocumentInfo(undefined);
    }

    private getPath() {
        const path = this._activeDocument.file;
        const extIndex = path.search(/\.(psd)/);
        return path.substring(0, extIndex);
    }

    private unsubscribeEventListener(eventName: string) {
        const listeners = this._generator.photoshopEventListeners(eventName);
        // Just a hack, will write a very detailed code in later phase.
        CreateLayoutStructure.listenerFn = listeners[1];
        this._generator.removePhotoshopEventListener(eventName, CreateLayoutStructure.listenerFn);
    }

    private filterResult(artLayerRef) {
        artLayerRef.name = this.applySplitter(artLayerRef.name);
        delete artLayerRef["generatorSettings"][this._pluginId];
    }

    private applySplitter(artLayerName) {
        if(~artLayerName.search(/\.(png|jpg)/)) {
            const extensionIndex = artLayerName.indexOf(".");
            const slashIndex = artLayerName.lastIndexOf("/");
            if(slashIndex > -1) {
                return artLayerName.substring(slashIndex + 1, extensionIndex);
            } else {
                return artLayerName.substring(0, extensionIndex);
            }
        }
        return artLayerName;
    }

    private async writeJSON(result, modifiedPath) {
        fs.writeFile(modifiedPath + ".json", JSON.stringify(result, null, "  "), (err) => {
            if(err) {
                console.log(err);
            }else {
                console.log("File successfully written");
            }
        });
    }

    private async modifyPathNames() {
        const bufferKeys = this.layerMap.keys();
        for(let key of bufferKeys) {
            const layerValue = this.layerMap.get(key);
            await this.handleBufferValue(layerValue, key);
        }
    }

    private async handleBufferValue(layerValue, key) {
        if(layerValue.frequency === 1) {
            CreateLayoutStructure.modifiedIds.push(key);
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

    private removeUnwantedLayers() {
        const targetPath = this.getPath() + "-assets";
        fs.readdirSync(targetPath).forEach(fileName => {
            this.removeFiles(targetPath + "/" + fileName);
        });
    }

    private removeFiles(targetPath) {
        const path = targetPath + "/common";
        fs.readdirSync(path).forEach(fileName => {
            if(~fileName.search(/(Animation)/)) {
                utlis.removeFile(path + "/" + fileName);
            }
        });
    }

    private modifyJSON(resultLayers) {
        resultLayers.forEach(item => {
            if (item.name === "freeGame") {
                const freeGameLayers = item.layers;
                const symbolRef = freeGameLayers.find(itemFG => {
                    if(itemFG.name === "Symbols") {
                        return true;
                    }
                });
                if(symbolRef) {
                    symbolRef.name += "FG";
                }
            } else if(item.layers) {
                this.modifyJSON(item.layers);
            }
        });
    }

    private modifyBottomBar(resultLayers) {
        resultLayers.forEach(item => {
            if (item.name === "baseGame") {
                const freeGameLayers = item.layers;
                const symbolRef = freeGameLayers.find(itemFG => {
                    if(itemFG.name === "buttonsContainerBG") {
                        return true;
                    }
                });
                if(symbolRef) {
                    symbolRef.name = "buttonsContainer";
                }
            } else if(item.layers) {
                this.modifyBottomBar(item.layers);
            }
        });
    }
}