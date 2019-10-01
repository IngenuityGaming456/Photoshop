import {IFactory, IParams} from "../interfaces/IJsxParam";
import {ModelFactory} from "../models/ModelFactory";
import {utlis} from "../utils/utils";
import * as path from "path";

export class Validation implements IFactory {
    private modelFactory: ModelFactory;
    private generator;
    private activeDocument;
    private layersErrorData;

    public constructor(modelFactory: ModelFactory) {
        this.modelFactory = modelFactory;
        this.layersErrorData = this.modelFactory.getPhotoshopModel().allLayersErrorData;
    };

    public execute(params: IParams) {
        this.generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.subscribeListeners();
    }

    private subscribeListeners() {
        this.generator.on("layersAdded", (eventLayers) => this.onLayersAddition(eventLayers));
        this.generator.on("layerRenamed", (eventLayers) => this.onLayersRename(eventLayers));
    }

    private isInHTML(key, id, questArray) {
        if(~questArray.indexOf(key)) {
            this.layersErrorData.push({
                id: id,
                name: key
            });
            this.generator.emit("logWarning", key, id, "HTMLContainerWarning");
            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), {id: id});
        }
    }

    private isAChangeToHTMLContainer(eventLayers, concatId) {
        let id;
        eventLayers.forEach(item => {
            id = utlis.isIDExists(item.id, concatId);
            if(id) {
                return;
            }
        });
        this.validationID(id);
    }

    private onLayersAddition(eventLayers) {
        // const elementalMap = this.modelFactory.getPhotoshopModel().viewElementalMap;
        // const allPresentItems = this.modelFactory.getPhotoshopModel().presentIds;
        // this.isAlreadyAdded(eventLayers, elementalMap, allPresentItems, undefined);
    }

    private isAlreadyAdded(eventLayers, elementalMap, allPresentItems, baseParent) {
        eventLayers.forEach(item => {
            if(!baseParent) {
                baseParent = utlis.isIDExists(item.id, allPresentItems);
            } else {
                if(item.added) {
                    this.validateIfAlreadyPresent(baseParent.name, item.name, elementalMap);
                }
            }
            if(item.layers) {
                this.isAlreadyAdded(item.layers, elementalMap, allPresentItems, baseParent);
            }
        });
    }

    private validateIfAlreadyPresent(parentName, itemName, elementalMap) {
        const element = elementalMap.get(parentName);
    }

    private onLayersRename(eventLayers) {
        const questArray = this.modelFactory.getPhotoshopModel().allQuestItems;
        const drawnQuestItems = this.modelFactory.getPhotoshopModel().allDrawnQuestItems;
        this.startValidationSequence(eventLayers, questArray, drawnQuestItems);
        //this.isAChangeToHTMLContainer(eventLayers, drawnQuestItems);
    }

    private startValidationSequence(eventLayers, questArray, drawnQuestItems) {
        try {
            this.drawnQuestItemsRenamed(eventLayers[0].name, eventLayers[0].id, drawnQuestItems)
                .isInHTML(eventLayers[0].name, eventLayers[0].id, questArray);
        } catch(err) {
            console.log("Validation Stopped");
        }
    }

    private drawnQuestItemsRenamed(name, id, drawnQuestItems) {
            const questItem = drawnQuestItems.find(item => {
                if(item.id === id && item.name !== name) {
                    return true;
                }
            });
            if (questItem) {
                this.generator.emit("logWarning", questItem.name, id, "QuestElementRenamed");
                this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/UndoRenamedLayer.jsx"),
                    {id: questItem.id, name: questItem.name});
                throw new Error("Validation Stop");
            }
            return this;
    }

    private validationID(id) {
        //Call photoshop to change the layer name;
    }

}