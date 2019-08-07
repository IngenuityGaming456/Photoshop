import {IFactory} from "../interfaces/IJsxParam";
import {Generator} from "../../../generator-core/lib/generator.js";
import * as fs from "fs";
import * as path from "path";
import {LayerManager} from "./LayerManager";
let packageJson = require("../../package.json");

export class CreateLayoutStructure implements IFactory {
    private _generator: Generator;
    private _document;
    private _pluginId;
    private _activeDocument;
    //dirty hack for test
    public static listenerFn: Function;
    public static modifiedIds = [];

    public async execute(generator, menuName: string, factoryMap, activeDocument) {
        this._generator = generator;
        this._pluginId = packageJson.name;
        this._activeDocument = activeDocument;
        this.unsubscribeEventListener("imageChanged");
        this._document = await this.requestDocument();
        let result = JSON.stringify(this._document, null, "  ");
        this.writeJSON(result);
    }

    private async requestDocument() {
        return await this._generator.getDocumentInfo(undefined);
    }

    private unsubscribeEventListener(eventName: string) {
        const listeners = this._generator.photoshopEventListeners(eventName);
        // Just a hack, will write a very detailed code in later phase.
        CreateLayoutStructure.listenerFn = listeners[1];
        this._generator.removePhotoshopEventListener(eventName, CreateLayoutStructure.listenerFn);
    }

    private async writeJSON(result) {
        const path = this._activeDocument.file;
        const extIndex = path.search(/\.(psd)/);
        const modifiedPath = path.substring(0, extIndex);
        Promise.all(LayerManager.promiseArray)
            .then(() => {
                // this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/alert.jsx"), {
                //     message: "All layers have been pixel detailed"
                // });
                //dirty hack for 5th Aug demo
                fs.writeFile(modifiedPath + ".txt", result, (err) => {
                    if(err) {
                        console.log(err);
                    } else {
                        const artLayers = this.getAllArtLayers(this._document.layers, undefined);
                        this.modifyPaths(artLayers);
                    }
                });
            });
    }

    private getAllArtLayers(documentLayers, artLayers) {
        artLayers = artLayers || [];
        let noOfLayers = documentLayers.length;
        for(let i=0;i<noOfLayers;i++) {
            if(documentLayers[i].type === "layer") {
                artLayers.push(documentLayers[i]);
            }
            if(documentLayers[i].type === "layerSection") {
                if(documentLayers[i].layers) {
                    artLayers = this.getAllArtLayers(documentLayers[i].layers, artLayers);
                }
            }
        }
        return artLayers;
    }

    private async modifyPaths(artLayers) {
        const noOfArtLayers = artLayers.length;
        const layerMap = new Map();
        const bufferMap = new Map();
        let keyPixmap, generatorJson;
        for (let i = 0; i < noOfArtLayers; i++) {
            if(artLayers[i].hasOwnProperty("generatorSettings")) {
                generatorJson = artLayers[i].generatorSettings[this._pluginId];
                if(generatorJson) {
                    keyPixmap = JSON.parse(generatorJson.json);
                }
            }
            const layerObj = {
                buffer: keyPixmap.pixels,
                frequency: 1,
                name: artLayers[i].name
            };
            layerMap.set(artLayers[i].id, layerObj);
            bufferMap.set(layerObj.buffer, 0);
        }
        //console.log("mapped");
        this.getBufferFrequency(layerMap, bufferMap);
    }

    private getBufferFrequency(layerMap, bufferMap) {
        layerMap.forEach((value, key) => {
            let freq = bufferMap.get(value.buffer);
            freq++;
            value.frequency = freq;
            bufferMap.set(value.buffer, freq);
            layerMap.set(key, value);
        });
        //console.log("layerMap updated");
        this.modifyPathNames(layerMap);
    }


    private modifyPathNames(layerMap) {
        let promiseArray = [];
        layerMap.forEach( (value, key) => {
            if(value.frequency === 1) {
                CreateLayoutStructure.modifiedIds.push(key);
                promiseArray.push(this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/addPath.jsx"),
                    {id: key}));
            }
        });
        Promise.all(promiseArray)
            .then(() => {
                this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/alert.jsx"), {
                    message: "Export is complete"
                });
            });
    }
}