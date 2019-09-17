import {IFactory, IParams} from "../interfaces/IJsxParam";
import {ModelFactory} from "../models/ModelFactory";
import {utlis} from "../utils/utils";

export class Validation implements IFactory {
    private modelFactory: ModelFactory;
    private generator;

    public constructor(modelFactory: ModelFactory) {
        this.modelFactory = modelFactory;
    };

    public execute(params: IParams) {
        this.generator = params.generator;
        this.subscribeListeners();
    }

    private subscribeListeners() {
        this.generator.on("layersAdded", (eventLayers) => this.onLayersAddition(eventLayers));
        this.generator.on("layerRenamed", (eventLayers) => this.onLayersRename(eventLayers));
    }

    public isInHTML(key, questArray) {
        if(~questArray.indexOf(key)) {
            throw new Error(`Draw ${key} from the HTML panel`);
        }
    }

    private onLayersAddition(eventLayers) {
        const baseIds = this.modelFactory.getPhotoshopModel().menuIds;
        let baseParent;
        eventLayers.forEach(item => {
            if(!baseParent) {
                baseParent = baseIds.find(itemB => {
                    if(itemB.id === item.id) {
                        return true;
                    }
                });
            } else {
                if(item.added) {
                    this.validateIfAlreadyPresent(baseParent.name, item.name);
                }
            }
        });
    }

    private validateIfAlreadyPresent(parent, key) {

    }

    private onLayersRename(eventLayers) {
        const baseId = this.modelFactory.getPhotoshopModel().menuIds;
        const childId = this.modelFactory.getPhotoshopModel().childIds;
        const concatId = baseId.concat(childId);
        let id;
        eventLayers.forEach(item => {
            id = utlis.isIDExists(item.id, concatId);
            if(id) {
                return;
            }
        });
        this.validationID(id);
    }

    private validationID(id) {
        //Call photoshop to change the layer name;
    }

}