import {IFactory, IParams} from "../interfaces/IJsxParam";
import {ModelFactory} from "../models/ModelFactory";
import {utlis} from "../utils/utils";
import * as path from "path";
import {PhotoshopModelApp} from "../../srcExtension/models/PhotoshopModels/PhotoshopModelApp";

export class Validation implements IFactory {
    private modelFactory: ModelFactory;
    private generator;
    private activeDocument;
    private readonly layersErrorData;
    private docEmitter;
    private alreadyRenamed = [];

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
        this.generator.on("layerRenamed", async eventLayers => await this.onLayersRename(eventLayers));
        this.generator.on("layersDeleted", eventLayers => this.onLayersDeleted(eventLayers))
    }

    private isInHTML(key, id, questArray, drawnQuestItems) {
        if(~questArray.indexOf(key) && !utlis.isIDExists(id, drawnQuestItems) && !~this.alreadyRenamed.indexOf(id)) {
            this.docEmitter.emit("logWarning", `Not allowed to create HTML Container, ${key} with id = ${id}`);
            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), {id: id});
        }
    }

    private async onLayersRename(eventLayers) {
        const questArray = this.modelFactory.getPhotoshopModel().allQuestItems;
        const drawnQuestItems = this.modelFactory.getPhotoshopModel().allDrawnQuestItems;
        await this.startValidationSequence(eventLayers, questArray, drawnQuestItems);
        this.isErrorFree(eventLayers, this.errorFreeFromRename.bind(this));
    }

    private onLayersDeleted(eventLayers) {
        this.isErrorFree(eventLayers, this.errorFreeFromDeletion.bind(this));
    }

    private async startValidationSequence(eventLayers, questArray, drawnQuestItems) {
        try {
            (await this.drawnQuestItemsRenamed(eventLayers[0].name, eventLayers[0].id, drawnQuestItems))
                .isInHTML(eventLayers[0].name, eventLayers[0].id, questArray, drawnQuestItems);
        } catch(err) {
            console.log("Validation Stopped");
        }
    }

    private async drawnQuestItemsRenamed(name, id, drawnQuestItems) {
        let selectedLayersString = await this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/SelectedLayersIds.jsx"));
        const layerId = selectedLayersString.toString().split(",")[0];
        if((this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).isRemoval) {
            if((this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).lastRemovalId === Number(id)) {
                (this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).isRemoval = false;
            }
            throw new Error("Validation Stop");
        }
        if((this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).isRenamedFromLayout) {
            if((this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).lastRename === Number(id)) {
                (this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).isRenamedFromLayout = false;
            }
            return this;
        }
        const layerRef = this.activeDocument.layers.findLayer(Number(layerId));
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
            if(utlis.getElementName(layerRef, "languages") && !~this.alreadyRenamed.indexOf(id)) {
                this.alreadyRenamed.push(id);
                this.docEmitter.emit("logWarning", `Can't rename an item inside languages`);
                this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/UndoRenamedLayer.jsx"),
                    {id: layerRef.layer.id, name: layerRef.layer.name});
                throw new Error("Validation Stop");
            }
            return this;
    }

    private isErrorFree(eventLayers, callback) {
        const errorData = callback(eventLayers);
        if(errorData) {
            utlis.spliceFrom(errorData.id, this.layersErrorData);
            this.docEmitter.emit("removeError", eventLayers[0].id);
        }
    }

    private errorFreeFromRename(eventLayers) {
        return this.layersErrorData.find(item => {
            if (item.id === eventLayers[0].id && !~eventLayers[0].name.search(/(Error)/)) {
                return true;
            }
        });
    }

    private errorFreeFromDeletion(eventLayers) {
        return this.layersErrorData.find(item => {
            const isInDeletedLayers = utlis.isIDExists(item.id, eventLayers);
            if(isInDeletedLayers) {
                return true;
            }
        })
    }

}