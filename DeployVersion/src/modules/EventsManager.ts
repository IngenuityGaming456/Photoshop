import {IFactory, IParams} from "../interfaces/IJsxParam";

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
        this.isDocumentChange(event);
        if(this.activeDocId && this.activeDocId != event.id) {
            return;
        }
        this.removeUnwantedEvents(event);
        this.isAddedEvent(event);
        this.isDeletionEvent(event);
        this.isRenameEvent(event);
    }

    private subscribeListeners() {
        this.generator.on("activeDocumentId", activeDocId => this.activeDocId = activeDocId);
        this.generator.on("newDocument", () => this.isNewDocument = true);
        this.generator.on("currentDocument", () => this.isNewDocument = false);
        this.generator.on("eventProcessed", (event) => {
            if(!this.isNewDocument) this.onHandleEvents(event);
        });
        this.documentManager.on("openDocumentsChanged", (allOpenDocuments, nowOpenDocuments, nowClosedDocuments) => {
            this.handleDocumentOpenClose(nowOpenDocuments, nowClosedDocuments);
        });
        this.generator.on("activeDocumentClosed", () => this.isNewDocument = false);
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
            case Events.SELECT :
                this.generator.emit("select");
                break;
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
        this.generator.emit("openedDocument", nowOpenDocuments[0])
    }

    private handleCloseDocument(nowCloseDocuments) {

        this.generator.emit("closedDocument", nowCloseDocuments[0]);
    }

    private isDocumentChange(event) {
        if(event.active) {
            this.generator.emit("activeDocumentChanged", event.id);
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
        if(event.layers && this.isAdded(event.layers)) {
            this.generator.emit("layersAdded", event.layers, this.isNewDocument);
        }
    }

    private isDeletionEvent(event) {
        if(event.layers && this.isDeletion(event.layers)) {
            this.generator.emit("layersDeleted", event.layers);
        }
    }

    private isRenameEvent(event) {
        if(event.layers && event.layers.length && !event.layers[0].added && event.layers[0].name) {
            this.generator.emit("layerRenamed", event.layers);
        }
    }

    private isAdded(layers): boolean {
        const layersCount = layers.length;
        for(let i=0;i<layersCount;i++) {
            const subLayer = layers[i];
            if(subLayer.hasOwnProperty("added")) {
                return true;
            }
            if(subLayer.hasOwnProperty("layers")) {
                return this.isAdded(subLayer.layers);
            }
        }
        return false;
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