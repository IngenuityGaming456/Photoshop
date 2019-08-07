import {Document} from "../../lib/dom/document.js";
import {Generator} from "../../../generator-core/lib/generator.js";
let LayerClass = require("../../lib/dom/layer.js");
let packageJson = require("../../package.json");

export class LayerManager {
    private readonly _generator: Generator;
    private readonly _activeDocument: Document;
    private readonly pluginId: string;
    public static promiseArray: Array<Promise<any>> = [];
    public constructor(generator: Generator, activeDocument: Document) {
        this._generator = generator;
        this._activeDocument = activeDocument;
        this.pluginId = packageJson.name;
    }

    public async addBufferData(changedLayers) {
        if (this._generator.isPasteEvent) {
            const addedLayers = this.handlePasteEvent(changedLayers, undefined);
            await this.getImageDataOfPaste(addedLayers);
            this._generator.isPasteEvent = false;
        } else {
            this.handleImportEvent(changedLayers, undefined);
        }
    }

    private handlePasteEvent(changedLayers, addedLayers) {
        addedLayers = addedLayers || [];
        const layersCount = changedLayers.length;
        for(let i=0;i<layersCount;i++) {
            const change = changedLayers[i];
            if(change.hasOwnProperty("added")) {
                addedLayers.push(change);
            } else {
                if(change.layers) {
                    addedLayers = this.handlePasteEvent(change.layers, addedLayers);
                }
            }
        }
        return addedLayers;
    }

    private handleImportEvent(changedLayers, promiseArray: Array<Promise<any>>) {
        promiseArray = promiseArray || [];
        const layersCount = changedLayers.length;
        for(let i=0;i<layersCount;i++) {
            const change = changedLayers[i];
            if(change.hasOwnProperty("added") && change.type === "layer") {
                this.getImageData(change.id, promiseArray);
            }
            if(change.hasOwnProperty("layers")) {
                this.handleImportEvent(change.layers, promiseArray);
            }
        }
    }

    private getImageData(layerId: number, promiseArray: Array<Promise<any>>) {
        let bufferPayload = {};
        let pixMapPromise = this._generator.getPixmap(this._activeDocument.id, layerId, {scaleX: 0.5, scaleY: 0.5});
        let bufferPromise = pixMapPromise
            .then(pixmap => {
                //writing layer's pixel data into it.
                //console.log("Got the pixel map");
                let pixmapBuffer = Buffer.from(pixmap.pixels);
                let cBuffer = LayerManager.compressBuffer(pixmapBuffer, pixmap.channelCount);
                let base64Pixmap = cBuffer.toString('base64');
                bufferPayload  = {
                    "pixels": base64Pixmap
                };
                return this.setLayerSettings(bufferPayload, layerId);
            })
            .catch((err) => console.log(err));
        //bufferPromise.then(() => console.log("Buffer Added to metadata"));
        promiseArray.push(bufferPromise);
    }

    private async getImageDataOfPaste(layersArray) {
        //console.log("Paste Image Pixel Data Addition Started");
        const layersCount = layersArray.length;
        for(let i=0;i<layersCount;i++) {
            const copiedLayerRef = this.findLayerRef(this._activeDocument.layers.layers,
                                                     this._generator.copiedLayers[i]);
            if(copiedLayerRef instanceof LayerClass.LayerGroup) {
                const pastedLayerRef = this.findLayerRef(this._activeDocument.layers.layers, layersArray[i].id);
                await this.handleGroupPaste(copiedLayerRef, pastedLayerRef);
            } else {
                await this.setBufferOnPaste(this._activeDocument.id, this._generator.copiedLayers[i], layersArray[i].id);
            }
        }
    }

    private async handleGroupPaste(copiedLayerGroup, pastedLayerGroup) {
        const copiedLayers = copiedLayerGroup.layers;
        const pastedLayers = pastedLayerGroup.layers;
        const layersCount = copiedLayers.length;
        for(let i=0;i<layersCount;i++) {
            if(copiedLayers[i] instanceof LayerClass.LayerGroup) {
                await this.handleGroupPaste(copiedLayers[i], pastedLayers[i]);
            } else {
                await this.setBufferOnPaste(this._activeDocument.id, copiedLayers[i].id, pastedLayers[i].id);
            }
        }
    }

    private async setBufferOnPaste(documentId, copyId, pasteId) {
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
        const promise = this._generator.setLayerSettingsForPlugin(bufferPayload, layerId, this.pluginId);
        LayerManager.promiseArray.push(promise);
        return promise;
    }

}