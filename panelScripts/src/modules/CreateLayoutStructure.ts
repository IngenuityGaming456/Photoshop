import {IFactory, IParams} from "../interfaces/IJsxParam";
import {Generator} from "../../../generator-core/lib/generator.js";
import * as fs from "fs";
import * as path from "path";
let packageJson = require("../../package.json");

export class CreateLayoutStructure implements IFactory {
    private _generator: Generator;
    private _document;
    private _pluginId;
    private _activeDocument;
    private artLayers = [];
    //dirty hack for test
    public static listenerFn: Function;
    public static modifiedIds = [];

    public async execute(params: IParams) {
        this._generator = params.generator;
        this._pluginId = packageJson.name;
        this._activeDocument = params.activeDocument;
        this.unsubscribeEventListener("imageChanged");
        this.modifyParentNames();
        const result = await this.requestDocument();
        this.traverseObject(result.layers, this.filterResult.bind(this));
        this.writeJSON(result, this.getPath());
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

    private modifyParentNames() {
        this.traverseObject(this._activeDocument.layers.layers, this.getAllArtLayers.bind(this));
        this.modifyPaths();
    }

    private getAllArtLayers(artLayerRef) {
        this.artLayers.push(artLayerRef);
    }

    private filterResult(artLayerRef) {
        delete artLayerRef["generatorSettings"][this._pluginId];
    }

    private async writeJSON(result, modifiedPath) {
        fs.writeFile(modifiedPath + ".txt", JSON.stringify(result, null, "  "), (err) => {
            if(err) {
                console.log(err);
            }else {
                console.log("File successfully written");
            }
        });
    }

    private traverseObject(documentLayers, callback) {
        let noOfLayers = documentLayers.length;
        for(let i=0;i<noOfLayers;i++) {
            if(documentLayers[i].type === "layer") {
                callback(documentLayers[i]);
            }
            if(documentLayers[i].type === "layerSection") {
                if(documentLayers[i].layers) {
                    this.traverseObject(documentLayers[i].layers, callback);
                }
            }
        }
    }

    private modifyPaths() {
        const noOfArtLayers = this.artLayers.length;
        const layerMap = new Map();
        const bufferMap = new Map();
        let keyPixmap, generatorJson;
        for (let i = 0; i < noOfArtLayers; i++) {
           // if(artLayers[i].hasOwnProperty("generatorSettings")) {
                generatorJson = this.artLayers[i].generatorSettings[this._pluginId];
                if(generatorJson) {
                    keyPixmap = JSON.parse(generatorJson.json);
                }
           // }
            const layerObj = {
                buffer: keyPixmap.pixels,
                frequency: 1,
                name: this.artLayers[i].name
            };
            layerMap.set(this.artLayers[i].id, layerObj);
            bufferMap.set(layerObj.buffer, {
                freq: 0,
                parentName: ""
            });
        }
        //console.log("mapped");
        this.getBufferFrequency(layerMap, bufferMap);
    }

    private getBufferFrequency(layerMap, bufferMap) {
        layerMap.forEach((value, key) => {
            let bufferObj = bufferMap.get(value.buffer);
            bufferObj.freq++;
            value.frequency = bufferObj.freq;
            this.modifyPathNames(value, key, bufferObj);
        });
    }

    private async modifyPathNames(value, key, bufferObj) {
         if(value.frequency === 1) {
              bufferObj.parentName = value.name;
              CreateLayoutStructure.modifiedIds.push(key);
              await this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/addPath.jsx"),
              {id: key});
         } else {
              await this.setDuplicateMetaData(bufferObj.parentName, key);
         }
    }

    private async setDuplicateMetaData(parentName, key) {
        await this._generator.setLayerSettingsForPlugin({
            image: parentName
        }, key, this._pluginId + "Image");
    }

}