import {Document} from "../../lib/dom/document.js";
import {IFactory, IParams} from "../interfaces/IJsxParam";
import * as path from "path";
import {ModelFactory} from "../models/ModelFactory";
import {photoshopConstants as pc} from "../constants";
import {PhotoshopModelApp} from "../../srcExtension/models/PhotoshopModels/PhotoshopModelApp";
import {utlis} from "../utils/utils";
let LayerClass = require("../../lib/dom/layer.js");
let packageJson = require("../../package.json");

export class LayerManager implements IFactory{
    private  _generator;
    private  _activeDocument: Document;
    private  pluginId: string;
    private eventName: string;
    private selectedLayers = [];
    private localisedLayers = [];
    private isPasteEvent = false;
    private docEmitter;
    private modelFactory;
    private queuedImageLayers = [];

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
        this._generator.on(pc.generator.layersAdded, (eventLayers, isNewDocument) => {
            this.onLayersAdded(eventLayers, isNewDocument);
        });
        this._generator.on(pc.generator.select, () => this.onLayersSelected());
        this._generator.on(pc.generator.copy, () => {
            this.eventName = Events.COPY;
        });
        this._generator.on(pc.generator.paste, () => {
            if(this.eventName === Events.COPY) {
                this.eventName = Events.PASTE;
                this.isPasteEvent = true;
            } else {
                this.eventName = Events.OTHER;
            }
        });
        this._generator.on(pc.generator.copyToLayer, () => {
            this.eventName = Events.COPYTOLAYER;
        });
        this._generator.on(pc.generator.duplicate, () => {
            if(this.eventName !== Events.OTHER) {
                this.eventName = Events.DUPLICATE;
                console.log(this.eventName);
            }
        });
        this.docEmitter.on(pc.localisation, localisedLayers => {
            this.localisedLayers = localisedLayers;
        });
    }

    private async onLayersSelected() {
        this.eventName = Events.SELECT;
        if((this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).automationOn) {
            return;
        }
        let selectedLayersString = await this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/SelectedLayersIds.jsx"));
        this.selectedLayers = selectedLayersString.toString().split(",");
    }

    private async onLayersAdded(eventLayers, isNewDocument) {
        if(isNewDocument) {
            this.constructQueuedArray(eventLayers);
            this.docEmitter.once(pc.logger.currentDocument, async ()=> {
                await this.handleImportEvent(this.queuedImageLayers);
                this.queuedImageLayers = [];
            });
            return;
        }
        await this.addBufferData(eventLayers);
    }

    private constructQueuedArray(eventLayers) {
        eventLayers.forEach(item => {
            this.queuedImageLayers.push(item);
        })
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
                    this.docEmitter.emit(pc.logger.logWarning, `Not Allowed to duplicate a quest element, ${item.name} with id = ${item.id}`);
                    await this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), {id: item.id});
                    return;
                }
            } else if(item.layers){
                this.handleLayersAddition(item.layers, questItems, deletedLayers);
            }
        }
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
                const mappedIds = (this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).getMappedIds();
                if(mappedIds.length) {
                    await this.handleMappedDuplicate(changedLayers, mappedIds, []);
                } else {
                    await this.handleImportEvent(changedLayers);
                }
        }
    }

    private async handleMappedDuplicate(changedLayers, parentLayers, deletedLayers) {
        const referredIds = await this.handleDuplicate(changedLayers, parentLayers, deletedLayers);
        utlis.spliceFromIdArray(parentLayers, referredIds);
    }

    private async handleDuplicateEvent(changedLayers) {
        if(this.isPasteEvent) {
            const questItems = this.modelFactory.getPhotoshopModel().allQuestItems;
            const deletedLayers = [];
            await this.handleLayersAddition(changedLayers, questItems, deletedLayers);
            await this.handleDuplicate(changedLayers, this.selectedLayers, deletedLayers);
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
        return await this.getImageDataOfEvent(addedLayers, parentLayers, deletedLayers);
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

    private async handleImportEvent(changedLayers) {
        const layersCount = changedLayers.length;
        for(let i=0;i<layersCount;i++) {
            const change = changedLayers[i];
            if(change.hasOwnProperty("added") && change.type === "layer") {
                try {
                    await this.getImageData(change.id);
                    console.log("Pixels Added");
                } catch(err) {
                    console.log("error occured while pixel update");
                }
            }
            if(change.hasOwnProperty("layers")) {
                await this.handleImportEvent(change.layers);
            }
        }
    }

    private async getImageData(layerId: number) {
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
        const referredIds = [];
        const layersCount = layersArray.length;
        for(let i=0;i<layersCount;i++) {
            const refObject = this.getCorrectCopiedLayerRef(layersArray[i].name, parentLayers);
            const copiedLayerRef = refObject?.ref;
            refObject && referredIds.push(refObject.id);
            if(copiedLayerRef instanceof LayerClass.LayerGroup) {
                await this.setBufferOnEvent(this._activeDocument.id, copiedLayerRef.id, layersArray[i].id);
                const pastedLayerRef = this.findLayerRef(this._activeDocument.layers.layers, layersArray[i].id);
                if(~deletedLayers.indexOf(pastedLayerRef.id)) {
                    continue;
                }
                await this.handleGroupEvent(copiedLayerRef, pastedLayerRef);
            } else {
                copiedLayerRef && await this.setBufferOnEvent(this._activeDocument.id, copiedLayerRef.id, layersArray[i].id);
            }
        }
        return referredIds;
    }

    private getCorrectCopiedLayerRef(layerName, parentLayers) {
        for(let id of parentLayers) {
            const ref = this.findLayerRef(this._activeDocument.layers.layers,
                id);
            if(ref && ref.layer && ref.layer.name === layerName || ref && ref.name && ref.name === layerName) {
                return {ref, id};
            }
        }
        return null;
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
                console.log("Duplicate Image Pixel Data Added ", pastedLayers[i].id);
            }
        }
    }

    private async setBufferOnEvent(documentId, copyId, pasteId) {
        let bufferPayload = await this._generator.getLayerSettingsForPlugin(documentId, copyId, this.pluginId);
        await this.setLayerSettings(bufferPayload, pasteId);
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

    private async setLayerSettings(bufferPayload, layerId): Promise<any> {
        if(Object.keys(bufferPayload).length) {
            try {
                await this._generator.setLayerSettingsForPlugin(bufferPayload, layerId, this.pluginId);
                console.log(`pixels added for id ${layerId}`)
            } catch(err) {
                console.log("error in pixel Mapping");
            }
        }
    }
}

enum Events {
    DUPLICATE = "Dplc",
    SELECT = "slct",
    COPYTOLAYER = "CpTL",
    COPY = "copy",
    PASTE = "past",
    OTHER = "other"
}