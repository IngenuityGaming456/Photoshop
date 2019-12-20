import {Document} from "../../lib/dom/document.js";
import {IFactory, IParams} from "../interfaces/IJsxParam";
import * as path from "path";
import {ModelFactory} from "../models/ModelFactory";
let LayerClass = require("../../lib/dom/layer.js");
let packageJson = require("../../package.json");

export class LayerManager implements IFactory{
    private  _generator;
    private  _activeDocument: Document;
    private  pluginId: string;
    public static promiseArray: Array<Promise<any>> = [];
    private eventName: string;
    private selectedLayers = [];
    private localisedLayers = [];
    private copiedLayers = [];
    private isPasteEvent = false;
    private docEmitter;
    private modelFactory;

    public constructor(modelFactory: ModelFactory) {
        this.modelFactory = modelFactory;
    }

    public execute(params: IParams) {
        this._generator = params.generator;
        this.docEmitter = params.docEmitter;
        this._activeDocument = params.activeDocument;
        this.pluginId = packageJson.name;
        this.subscribeListeners();
    }

    private subscribeListeners() {
        this._generator.on("layersAdded", eventLayers => {
            this.onLayersAdded(eventLayers);
        });
        this._generator.on("select", async () => {
            this.eventName = Events.SELECT;
            this.selectedLayers = await this.getSelectedLayers();
        });
        this._generator.on("copy", async () => {
            this.eventName = Events.COPY;
            this.copiedLayers = await this.getSelectedLayers();
        });
        this._generator.on("paste", () => {
            this.eventName = Events.PASTE;
            this.isPasteEvent = true;
        });
        this._generator.on("copyToLayer", () => {
            this.eventName = Events.COPYTOLAYER;
        });
        this._generator.on("duplicate", () => {
            this.eventName = Events.DUPLICATE;
            this.isPasteEvent = true;
        });
        this.docEmitter.on("localisation", localisedLayers => {
            this.localisedLayers = localisedLayers;
        });
    }

    private async onLayersAdded(eventLayers) {
        this.addBufferData(eventLayers);
    }

    private async handleLayersAddition(eventLayers, questItems, deletedLayers) {
        for(let item of eventLayers) {
            if(item.added) {
                const inQuest = questItems.some(key => {
                    if (key === item.name) {
                        return true;
                    }
                });
                if(inQuest) {
                    deletedLayers.push(item.id);
                    this.docEmitter.emit("logWarning", `Not Allowed to duplicate a quest element, ${item.name} with id = ${item.id}`);
                    await this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), {id: item.id});
                    return;
                }
            } else if(item.layers){
                this.handleLayersAddition(item.layers, questItems, deletedLayers);
            }
        }
    }

    private async getSelectedLayers() {
        let selectedLayersString = await this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/SelectedLayersIds.jsx"));
        return selectedLayersString.toString().split(",");
    }

    public async addBufferData(changedLayers) {
        switch(this.eventName) {
            case Events.COPYTOLAYER :
                await this.handleDuplicate(changedLayers, this.selectedLayers, []);
                break;
            case Events.DUPLICATE :
                await this.handleDuplicateEvent(changedLayers);
                break;
            default :
                await this.handleImportEvent(changedLayers, undefined);
        }
    }

    private async handleDuplicateEvent(changedLayers) {
        if(this.isPasteEvent) {
            const questItems = this.modelFactory.getPhotoshopModel().allQuestItems;
            const deletedLayers = [];
            await this.handleLayersAddition(changedLayers, questItems, deletedLayers);
            await this.handleDuplicate(changedLayers, this.copiedLayers, deletedLayers);
            this.isPasteEvent = false;
            return;
        }
        if(this.localisedLayers.length) {
            await this.handleDuplicate(changedLayers, this.localisedLayers, []);
            this.localisedLayers.splice(0, 1);
            return;
        }
        await this.handleDuplicate(changedLayers, this.selectedLayers, []);
    }

    private async handleDuplicate(changedLayers, parentLayers, deletedLayers) {
        const addedLayers = this.handleEvent(changedLayers, undefined);
        await this.getImageDataOfEvent(addedLayers, parentLayers, deletedLayers);
    }

    private handleEvent(changedLayers, addedLayers) {
        addedLayers = addedLayers || [];
        const layersCount = changedLayers.length;
        for(let i=0;i<layersCount;i++) {
            const change = changedLayers[i];
            if(change.hasOwnProperty("added")) {
                addedLayers.push(change);
            } else {
                if(change.layers) {
                    addedLayers = this.handleEvent(change.layers, addedLayers);
                }
            }
        }
        return addedLayers;
    }

    private async handleImportEvent(changedLayers, promiseArray: Array<Promise<any>>) {
        promiseArray = promiseArray || [];
        const layersCount = changedLayers.length;
        for(let i=0;i<layersCount;i++) {
            const change = changedLayers[i];
            if(change.hasOwnProperty("added") && change.type === "layer") {
                await this.getImageData(change.id, promiseArray);
                console.log("Pixels Added");
            }
            if(change.hasOwnProperty("layers")) {
                await this.handleImportEvent(change.layers, promiseArray);
            }
        }
    }

    private async getImageData(layerId: number, promiseArray: Array<Promise<any>>) {
        let pixmap = await this._generator.getPixmap(this._activeDocument.id, layerId, {scaleX: 0.5, scaleY: 0.5});
        let pixmapBuffer = Buffer.from(pixmap.pixels);
        let cBuffer = LayerManager.compressBuffer(pixmapBuffer, pixmap.channelCount);
        let base64Pixmap = cBuffer.toString('base64');
        const bufferPayload  = {
            "pixels": base64Pixmap
        };
        console.log("Pixels started to add");
        return this.setLayerSettings(bufferPayload, layerId);
    }

    private async getImageDataOfEvent(layersArray, parentLayers, deletedLayers) {
        //console.log("Paste Image Pixel Data Addition Started");
        const layersCount = layersArray.length;
        for(let i=0;i<layersCount;i++) {
            const copiedLayerRef = this.findLayerRef(this._activeDocument.layers.layers,
                                                     parentLayers[i]);
            if(copiedLayerRef instanceof LayerClass.LayerGroup) {
                await this.setBufferOnEvent(this._activeDocument.id, parentLayers[i], layersArray[i].id);
                const pastedLayerRef = this.findLayerRef(this._activeDocument.layers.layers, layersArray[i].id);
                if(~deletedLayers.indexOf(pastedLayerRef.id)) {
                    continue;
                }
                await this.handleGroupEvent(copiedLayerRef, pastedLayerRef);
            } else {
                await this.setBufferOnEvent(this._activeDocument.id, parentLayers[i], layersArray[i].id);
            }
        }
    }

    private getGeneratorSettings(parentLayerRef): boolean {
        return parentLayerRef.generatorSettings && parentLayerRef.generatorSettings[this.pluginId];
    }

    private async handleGroupEvent(copiedLayerGroup, pastedLayerGroup) {
        const copiedLayers = copiedLayerGroup.layers;
        const pastedLayers = pastedLayerGroup.layers;
        const layersCount = copiedLayers.length;
        for(let i=0;i<layersCount;i++) {
            if(copiedLayers[i] instanceof LayerClass.LayerGroup) {
                await this.handleGroupEvent(copiedLayers[i], pastedLayers[i]);
            } else {
                await this.setBufferOnEvent(this._activeDocument.id, copiedLayers[i].id, pastedLayers[i].id);
            }
        }
    }

    private async setBufferOnEvent(documentId, copyId, pasteId) {
        let bufferPayload = await this._generator.getLayerSettingsForPlugin(documentId, copyId, this.pluginId);
        await this.setLayerSettings(bufferPayload, pasteId);
        //console.log("Paste Image Pixel Data Added");
    }

    private findLayerRef(documentLayers, layerId) {
        let layerRef;
        documentLayers.some(item => {
            if(item.id == layerId) {
                layerRef = item;
                return true;
            }
            if(item.layers) {
                layerRef = this.findLayerRef(item.layers, layerId);
                if(layerRef) {
                    return true;
                }
            }
        });
        if(layerRef) {
            return layerRef;
        }
    }

    private static compressBuffer(buffer, channelCount) {
        const cBL = buffer.length/2 + 1;
        let cBuffer = Buffer.alloc(cBL);
        for(let i=0;i<buffer.length;i+=channelCount) {
            cBuffer[i] = buffer[i];
            cBuffer[i+1] = ( buffer[i+1] + buffer[i+2] + buffer[i+3] ) / 3;
        }
        return cBuffer;
    }

    private setLayerSettings(bufferPayload, layerId): Promise<any> {
        if(Object.keys(bufferPayload).length) {
            const promise = this._generator.setLayerSettingsForPlugin(bufferPayload, layerId, this.pluginId);
            LayerManager.promiseArray.push(promise);
            return promise;
        }
        return Promise.resolve();
    }
}

enum Events {
    DUPLICATE = "Dplc",
    SELECT = "slct",
    COPYTOLAYER = "CpTL",
    COPY = "copy",
    PASTE = "past",
}