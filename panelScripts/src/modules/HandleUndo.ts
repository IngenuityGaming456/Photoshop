import {IFactory, IParams} from "../interfaces/IJsxParam";
import {ModelFactory} from "../models/ModelFactory";

export class HandleUndo implements IFactory {
    private generator;
    private sessionHandler = [];
    private modelFactory;
    private elementalMap;

    public constructor(modelFactory: ModelFactory) {
        this.modelFactory = modelFactory;
    }

    execute(params: IParams) {
        this.generator = params.generator;
        this.sessionHandler = this.modelFactory.getPhotoshopModel().allSessionHandler;
        this.elementalMap = this.modelFactory.getPhotoshopModel().viewElementalMap;
        this.subscribeListeners();
    }

    private subscribeListeners() {
        this.generator.on("layersAdded", eventLayers => this.onLayersModified(eventLayers));
        this.generator.on("layersDeleted", eventLayers => this.onLayersModified(eventLayers));
    }

    private onLayersModified(eventLayers) {
        for(let item of eventLayers) {
            const itemRef = this.isInModelData(item.id);
            if(itemRef) {
                this.handleModelData(itemRef);
            }
            if(item.layers) {
                this.onLayersModified(item.layers);
            }
        }
    }

    private isInModelData(itemId) {
        let itemRef = null;
        this.sessionHandler.find(item => {
            for(let key in item) {
                if(!item.hasOwnProperty(key)) {
                    continue;
                }
                 if(item[key].id && item[key].id === itemId) {
                    itemRef = Object.assign({}, item[key]);
                    itemRef["platform"] = item.platform;
                    itemRef["view"] = item.view;
                    return true;
                }
            }
        });
        return itemRef;
    }

    private handleModelData(itemRef) {
        this.elementalMap[itemRef.platform][itemRef.view][itemRef.type].push({
            id: itemRef.id,
            name: itemRef.name
        });
        this.modelFactory.getPhotoshopModel().setDrawnQuestItems(itemRef.id, itemRef.name);
    }
}