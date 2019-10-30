import {IFactory, IParams} from "../interfaces/IJsxParam";
import {ModelFactory} from "../models/ModelFactory";
import {utlis} from "../utils/utils";
import * as path from "path";

export class Validation implements IFactory {
    private modelFactory: ModelFactory;
    private generator;
    private activeDocument;
    private layersErrorData;
    private docEmitter;

    public constructor(modelFactory: ModelFactory) {
        this.modelFactory = modelFactory;
        this.layersErrorData = this.modelFactory.getPhotoshopModel().allLayersErrorData;
    };

    public execute(params: IParams) {
        this.generator = params.generator;
        this.docEmitter = params.docEmitter;
        this.activeDocument = params.activeDocument;
        this.subscribeListeners();
    }

    private subscribeListeners() {
        this.generator.on("layerRenamed", (eventLayers) => this.onLayersRename(eventLayers));
    }

    private isInHTML(key, id, questArray, drawnQuestItems) {
        if(~questArray.indexOf(key) && !utlis.isIDExists(id, drawnQuestItems)) {
            this.docEmitter.emit("logWarning", `Not allowed to create HTML Container, ${key} with id = ${id}`);
            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), {id: id});
        }
    }

    private onLayersRename(eventLayers) {
        const questArray = this.modelFactory.getPhotoshopModel().allQuestItems;
        const drawnQuestItems = this.modelFactory.getPhotoshopModel().allDrawnQuestItems;
        this.startValidationSequence(eventLayers, questArray, drawnQuestItems);
        this.isErrorFree(eventLayers);
    }

    private startValidationSequence(eventLayers, questArray, drawnQuestItems) {
        try {
            this.drawnQuestItemsRenamed(eventLayers[0].name, eventLayers[0].id, drawnQuestItems)
                .isInHTML(eventLayers[0].name, eventLayers[0].id, questArray, drawnQuestItems);
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
            if (questItem && questItem.name !== "generic") {
                this.docEmitter.emit("logWarning", `Not allowed to rename Quest Item, ${questItem.name} with id = ${id}`);
                this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/UndoRenamedLayer.jsx"),
                    {id: questItem.id, name: questItem.name});
                throw new Error("Validation Stop");
            }
            return this;
    }

    private isErrorFree(eventLayers) {
        const isInErrorData = this.layersErrorData.some(item => {
            if(item.id === eventLayers[0].id && !~eventLayers[0].name.search(/(Error)/)) {
                return true;
            }
        });
        if(isInErrorData) {
            utlis.spliceFrom(eventLayers[0].id, this.layersErrorData);
            this.docEmitter.emit("removeError", eventLayers[0].id);
        }
    }

}