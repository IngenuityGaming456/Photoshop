import {IFactory, IParams} from "../interfaces/IJsxParam";
import {photoshopConstants as pc} from "../constants";
import {utlis} from "../utils/utils";

export class EventsManager implements IFactory{
    private generator;
    private documentManager;
    private isNewDocument: boolean = false;
    private activeDocId: number = null;

    public execute(params: IParams) {
        this.generator = params.generator;
        this.documentManager = params.storage.documentManager;
        this.subscribeListeners();
    }

    public onImageChanged(event) {
        const eventCopy = { ...event };
        this.isDocumentChange(eventCopy);
        if(this.activeDocId && this.activeDocId != eventCopy.id) {
            return;
        }
        this.isSelected(eventCopy);
        this.removeUnwantedEvents(eventCopy);
        try {
            this.isAddedEvent(eventCopy)
                .isDeletionEvent(eventCopy)
                .isRenameEvent(eventCopy)
                .isMovedEvent(eventCopy)
        } catch(err) {
            console.log(err);
        }
    }

    private isSelected(event) {
        if("selection" in event) {
            this.generator.emit("select");
        }
    }

    private subscribeListeners() {
        this.generator.on(pc.generator.activeDocumentId, activeDocId => this.activeDocId = activeDocId);
        this.generator.on(pc.logger.newDocument, () => {
            this.isNewDocument = true;
        });
        this.generator.on(pc.logger.currentDocument, () => {
            this.isNewDocument = false;
        });
        this.generator.on(pc.generator.eventProcessed, (event) => {
            if(!this.isNewDocument) this.onHandleEvents(event);
        });
        this.documentManager.on(pc.documentEvents.openDocumentsChanged, (allOpenDocuments, nowOpenDocuments, nowClosedDocuments) => {
            this.handleDocumentOpenClose(nowOpenDocuments, nowClosedDocuments);
        });
        this.generator.on(pc.generator.activeDocumentClosed, () => this.isNewDocument = false);
    }

    private handleDocumentOpenClose(nowOpenDocuments, nowClosedDocuments) {
        if(nowOpenDocuments.length) {
            this.handleOpenDocument(nowOpenDocuments);
        }
        if(nowClosedDocuments.length) {
            this.handleCloseDocument(nowClosedDocuments);
        }
    }

    private onHandleEvents(event) {
        switch(event) {
            case Events.COPY :
                this.generator.emit("copy");
                break;
            case Events.PASTE :
                this.generator.emit("paste");
                break;
            case Events.SAVE :
                this.generator.emit("save");
                break;
            case Events.COPYTOLAYER :
                this.generator.emit("copyToLayer");
                break;
            case Events.DUPLICATE :
                this.generator.emit("duplicate");
                break;
            case Events.UNDO :
                this.generator.emit("undo");
        }
    }

    private handleOpenDocument(nowOpenDocuments) {
        this.generator.emit(pc.generator.openedDocument, nowOpenDocuments[0])
    }

    private handleCloseDocument(nowCloseDocuments) {

        this.generator.emit(pc.generator.closedDocument, nowCloseDocuments[0]);
    }

    private isDocumentChange(event) {
        if(event.active) {
            this.generator.emit(pc.generator.activeDocumentChanged, event.id);
        }
    }

    private removeUnwantedEvents(event) {
        if(event.layers) {
            this.removeUnwantedLayers(event.layers);
            this.removeUnwantedProperty(event.layers);
        }
    }

    private removeUnwantedLayers(rawChange) {
        var unwantedLayers = [];
        rawChange.forEach((item, index) => {
            if((item.added && item.removed)) {
                unwantedLayers.push(index);
            }
        });
        this.sliceArray(rawChange, unwantedLayers);
    }

    private removeUnwantedProperty(rawChange) {
        if(this.checkAddedItem(rawChange)) {
            this.removeProperty(rawChange);
        }
    }

    private checkAddedItem(rawChange) {
        var addedTypeItem = rawChange.find(item => {
            if(item.added) {
                return true;
            }
            if(item.layers) {
                return this.checkAddedItem(item.layers);
            }
            return false;
        });
        return !!addedTypeItem;
    }

    private removeProperty(rawChange) {
        let unwantedLayers = [];
        rawChange.forEach((item, index) => {
            if(item.removed) {
                if(!item.layers) {
                    unwantedLayers.push(index);
                } else {
                    delete item.removed;
                }
            } else if(item.layers) {
                this.removeProperty(item.layers);
            }
        });
        this.sliceArray(rawChange, unwantedLayers);
    }

    private isAddedEvent(event) {
        if(event.layers) {
            const addedPath = this.isAdded(event.layers, []);
            if(!addedPath) {
                return this;
            }
            if(!addedPath.length) {
                this.generator.emit(pc.generator.layersAdded, event.layers, this.isNewDocument);
            } else {
                const parsedEvent = utlis.getParsedEvent(addedPath.reverse(), event.layers, {index: 0}, null);
                this.generator.emit(pc.generator.layersAdded, parsedEvent, this.isNewDocument);
            }
            throw new Error("Added Event Dispatched");
        }
        return this;
    }

    private isDeletionEvent(event) {
        if(event.layers && this.isDeletion(event.layers)) {
            this.generator.emit(pc.generator.layersDeleted, event.layers);
            throw new Error("Deletion Event Dispatched");
        }
        return this;
    }

    private isRenameEvent(event) {
        if(event.layers && event.layers.length && !event.layers[0].added && event.layers[0].name) {
            this.generator.emit(pc.generator.layerRenamed, event.layers);
            throw new Error("Rename Event Dispatched");
        }
        return this;
    }

    private isMovedEvent(event) {
        if(event.layers && this.isMoved(event.layers)) {
            this.generator.emit(pc.generator.layersMoved, event.layers);
        }
    }

    private isAdded(layers, pathArray) {
            const subPathArray = [];
            const layersCount = layers.length;
            for(let i=0;i<layersCount;i++) {
                const subLayer = layers[i];
                if(subLayer.hasOwnProperty("added")) {
                    subPathArray.push(i);
                    if(layersCount === 1) {
                        subPathArray.push(-1);
                    }
                    continue;
                }
                const addedResult = subLayer.layers && this.isAtLevel(subLayer.layers, "added");
                if(addedResult) {
                    subPathArray.push(i);
                    if(subLayer.layers) {
                        this.isAdded(subLayer.layers, pathArray);
                    }
                }
            }
            if(!subPathArray.length) {
                return null;
            }
            pathArray.push(subPathArray);
            return pathArray;
    }

    private isAtLevel(layers, key) {
        const layerLength = layers.length;
        for(let i=0;i<layerLength;i++) {
            const subLayer = layers[i];
            if(subLayer.hasOwnProperty(key)) {
                return true;
            }
            if(subLayer.hasOwnProperty("layers")) {
                const levelValue = this.isAtLevel(subLayer.layers, key);
                if (levelValue) {
                    return true;
                }
            }
        }
        return false;
    }

    private isMoved(layers): boolean {
        const layersCount = layers.length;
        for(let i=0;i<layersCount;i++) {
            const subLayer = layers[i];
            if(subLayer.hasOwnProperty("added") || subLayer.hasOwnProperty("removed")) {
                return false;
            }
            if(subLayer.hasOwnProperty("layers")) {
                return this.isMoved(subLayer.layers);
            }
        }
        return true;
    }

    private isDeletion(layers): boolean {
        const layersCount = layers.length;
        for(let i=0;i<layersCount;i++) {
            const subLayer = layers[i];
            if(subLayer.hasOwnProperty("removed")) {
                return true;
            }
        }
        return false;
    }

    private sliceArray(rawChange, unwantedLayers) {
        const unwantedCount = unwantedLayers.length;
        for(let i=0;i<unwantedCount;i++) {
            rawChange.splice(unwantedLayers[i], 1);
            unwantedLayers[i+1] -= (i+1);
        }
    }

}

enum Events {
    DUPLICATE = "Dplc",
    SELECT = "slct",
    COPYTOLAYER = "CpTL",
    COPY = "copy",
    PASTE = "past",
    SAVE= "save",
    UNDO = "undo"
}