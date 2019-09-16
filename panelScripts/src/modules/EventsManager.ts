import {IFactory, IParams} from "../interfaces/IJsxParam";

export class EventsManager implements IFactory{
    private generator;

    public execute(params: IParams) {
        this.generator = params.generator;
        this.isAddedEvent(params.events);
        this.isDeletionEvent(params.events);
        this.isRenameEvent(params.events);
    }

    private isAddedEvent(event) {
        if(event.layers && this.isAdded(event.layers)) {
            this.generator.emit("layersAdded", event.layers);
        }
    }

    private isDeletionEvent(event) {
        if(event.layers && this.isDeletion(event.layers)) {
            this.generator.emit("layersDeleted", event.layers);
        }
    }

    private isRenameEvent(event) {
        if(event.layers && !event.added && event.layers[0].name) {
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
    }

    private isDeletion(layers): boolean {
        const layersCount = layers.length;
        for(let i=0;i<layersCount;i++) {
            const subLayer = layers[i];
            if(subLayer.hasOwnProperty("removed")) {
                return true;
            }
        }
    }

}

// if(!event.layers[0].added && (event.layers[0].removed || event.layers[0].name)) {
//     componentsMap.forEach(item => {
//         Restructure.searchAndModifyControlledArray(event.layers, item);
//     });
// }
// _layerManager.addBufferData(event.layers);