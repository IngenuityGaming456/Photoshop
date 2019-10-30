import {IFactory, IParams} from "../../interfaces/IJsxParam";
import {utlis} from "../../utils/utils";
import * as path from "path";
import {ModelFactory} from "../../models/ModelFactory";
import {execute, inject} from "../FactoryClass";
import {CreateLayoutStructure} from "./CreateLayoutStructure";
let packageJson = require("../../../package.json");

export class CreateProxyLayout implements IFactory {
    private generator;
    private document;
    private activeDocument;
    private artLayers = [];
    private nameCache = [];
    private errorData = [];
    private readonly modelFactory;
    private bufferMap = new Map();
    private docEmitter;
    private layerMap;
    private assetsPath;
    private imageState;

    public constructor(modelFactory: ModelFactory) {
         this.modelFactory = modelFactory;
         this.errorData = this.modelFactory.getPhotoshopModel().allLayersErrorData;
    }

    public async execute(params: IParams) {
        this.generator = params.generator;
        this.docEmitter = params.docEmitter;
        this.activeDocument = params.activeDocument;
        this.imageState = params.storage.menuState;
        this.document = await this.generator.getDocumentInfo(undefined);
        await this.modifyParentNames();
        this.checkSymbols();
        this.checkImageFolder();
        this.checkIsLayoutSuccessful();
    }

    private async modifyParentNames() {
        utlis.traverseObject(this.document.layers, this.getAllArtLayers.bind(this));
        this.artLayers.reverse();
        await this.modifyPaths();
    }

    private async modifyPaths() {
        const noOfArtLayers = this.artLayers.length;
        const layerMap = new Map();
        let keyPixmap, generatorJson;
        for (let i = 0; i < noOfArtLayers; i++) {
            generatorJson = this.artLayers[i].generatorSettings[packageJson.name];
            if(!generatorJson) {
                continue;
            }
            keyPixmap = JSON.parse(generatorJson.json);
            const layerObj = {
                buffer: keyPixmap.pixels,
                frequency: 1,
                name: this.artLayers[i].name,
                parentName: ""
            };
            layerMap.set(this.artLayers[i].id, layerObj);
            this.bufferMap.set(layerObj.buffer, {
                freq: 0,
                parentName: "",
            });
        }
        await this.getBufferFrequency(layerMap);
    }

    private async getBufferFrequency(layerMap) {
        this.layerMap = layerMap;
        const layerMapKeys = layerMap.keys();
        for(let key of layerMapKeys) {
            const value = layerMap.get(key);
            let bufferObj = this.bufferMap.get(value.buffer);
            bufferObj.freq++;
            value.frequency = bufferObj.freq;
            await this.modifyPathNames(value, key, bufferObj);
        }
    }

    private getAllArtLayers(artLayerRef) {
        this.artLayers.push(artLayerRef);
    }

    async modifyPathNames(value, key, bufferObj) {
        if(value.frequency === 1) {
            bufferObj.parentName = value.name;
            await this.setToNameCache(value.name, key);
        }
    }

    private async setToNameCache(layerName, key) {
        if(!~this.nameCache.indexOf(layerName)) {
            this.nameCache.push(layerName);
        } else {
            this.logError(key, layerName, `Error in name of ${layerName} with id ${key}`);
            await this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/addErrorPath.jsx"), {id: key});
        }
    }

    private checkSymbols() {
        utlis.traverseBaseFreeGame(this.document.layers, this.inspectSymbols.bind(this));
    }

    private inspectSymbols(viewLayer) {
        for(let item of viewLayer.layers) {
            if(item.name === "Symbols" && item.layers) {
                item.layers.forEach(itemS => {
                    this.checkIfStaticEmpty(itemS);
                });
            }
        }
    }

    private checkIfStaticEmpty(item) {
        if(item.type === "layerSection") {
            item.layers.forEach(itemS => {
                if(itemS.name === "Static") {
                    if (!itemS.layers) {
                        this.logError(itemS.id, itemS.name, `Symbol with name ${item.name} has empty Static folder`);
                    } else {
                        this.removeError(itemS.id);
                    }
                }
            });
        }
    }

    private checkImageFolder() {
        this.assetsPath = this.getPath();
        // if(!this.isPluginEnabled()) {
        //     this.logError(1001, "", "Image Assets plugin is not on.");
        // } else {
        //     this.removeError(1001);
        // }
    }

    private isPluginEnabled() {
        return this.imageState.state;
    }

    private checkIsLayoutSuccessful() {
        if(!this.errorData.length) {
            this.initializeLayout();
        }
    }

    private getPath() {
        const path = this.activeDocument.file;
        const extIndex = path.search(/\.(psd)/);
        return path.substring(0, extIndex);
    }

    private initializeLayout() {
        const layout = inject({ref: CreateLayoutStructure, dep: [ModelFactory], isNonSingleton: true});
        execute(layout, {storage: {
                layerMap: this.layerMap,
                bufferMap: this.bufferMap,
                assetsPath: this.assetsPath,
            }, generator: this.generator, activeDocument: this.activeDocument, docEmitter: this.docEmitter});
    }

    private logError(id, name, errorType) {
        if(!utlis.isIDExists(id, this.errorData)) {
            this.errorData.push({id: id, name: name});
            this.docEmitter.emit("logError", id, name, errorType);
        }
    }

    private removeError(id) {
        const beforeLength = this.errorData.length;
        utlis.spliceFrom(id, this.errorData);
        const afterLength = this.errorData.length;
        if (beforeLength > afterLength) {
            this.docEmitter.emit("removeError", id);
        }
    }

}