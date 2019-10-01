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

    public constructor(modelFactory: ModelFactory) {
         this.modelFactory = modelFactory;
         this.errorData = this.modelFactory.getPhotoshopModel().allLayersErrorData;
    }

    public async execute(params: IParams) {
        this.generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.document = await this.generator.getDocumentInfo(undefined);
        this.errorData = this.modelFactory;
        this.subscribeListeners();
        await this.modifyParentNames();
        this.checkIsLayoutSuccessful();
    }
    
    private subscribeListeners() {
        this.generator.on("layerRenamed", (eventLayers) => this.onLayersRenamed(eventLayers));
    }
    
    private onLayersRenamed(eventLayers) {
        const isInErrorData = this.errorData.some(item => {
            if(item.id === eventLayers[0].name) {
                return true;
            }
        });
        if(isInErrorData) {
            this.generator.emit("removeError", eventLayers[0].id);
        }
    }

    private async modifyParentNames() {
        utlis.traverseObject(this.document.layers.layers, this.getAllArtLayers.bind(this));
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
                name: this.artLayers[i].name
            };
            layerMap.set(this.artLayers[i].id, layerObj);
            this.bufferMap.set(layerObj.buffer, {
                freq: 0,
                parentName: "",
                id: this.artLayers[i].id
            });
        }
        await this.getBufferFrequency(layerMap);
    }

    private async getBufferFrequency(layerMap) {
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
        if(~this.nameCache.indexOf(layerName)) {
            this.nameCache.push(layerName);
        } else {
            this.errorData.push({id: key, name: layerName});
            this.generator.emit("logError", layerName, key, "NameError");
            await this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/addPath.jsx"), {id: key});
        }
    }

    private checkIsLayoutSuccessful() {
        if(!this.errorData.length) {
            this.initializeLayout();
        }
    }

    private initializeLayout() {
        const layout = inject({ref: CreateLayoutStructure, dep: []});
        execute(layout, {storage: {
                bufferMap: this.bufferMap
            }, generator: this.generator, activeDocument: this.activeDocument});
    }

}