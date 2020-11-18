import {IParams} from "../interfaces/IJsxParam";
import {photoshopConstants as pc} from "../constants";
import {utlis} from "../utils/utils";
let packageJson = require("../../package.json");

export class SelfAddedStructures {
    private generator;
    private activeDocument;
    private modelFactory;
    private documentManager;
    private request;
    private docEmitter;
    private pluginId;

    public constructor(modelFactory) {
        this.modelFactory = modelFactory;
    }

    public execute(params: IParams) {
        this.generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.documentManager = params.storage.documentManager;
        this.docEmitter = params.docEmitter;
        this.pluginId = packageJson.name;
        this.subscribeListeners();
    }

    private subscribeListeners() {
        this.generator.on(pc.generator.layersAdded, addedLayers => {
            this.onLayersAdded(addedLayers);
        });
        this.generator.on(pc.generator.layersMoved, movedLayers => {
            this.onLayersMoved(movedLayers);
        });
    }

    private async onLayersMoved(movedLayers) {
        const lastLayerObj = utlis.getLastParentAndChildLayers(movedLayers);
        const parentId = lastLayerObj.parent && lastLayerObj.parent.id;
        if(parentId) {
            for(const childItem of lastLayerObj.child) {
                await this.modifyParentAndChild(parentId, childItem.id);
            }
        }
    }

    private async modifyParentAndChild(parentId, childId) {
        this.activeDocument = await this.documentManager.getDocument(this.activeDocument.id);
        if(!utlis.isIDExists(childId, this.modelFactory.getPhotoshopModel().allDrawnQuestItems)) {
            utlis.handleModelData([{id: childId}], [], this.modelFactory.getPhotoshopModel().viewElementalMap, []);
            const layerRef = this.activeDocument.layers.findLayer(childId);
            if(layerRef.layer && layerRef.layer.generatorSettings && layerRef.layer.generatorSettings[this.pluginId]) {
                const type = layerRef.layer.generatorSettings[this.pluginId].json;
                type !== "view" && this.setParams({id: childId, name: layerRef.layer.name}, type);
            } else if(layerRef.layer && layerRef.layer.type === "layerSection") {
                this.setContainerParams({id: childId, name: layerRef.layer.name});
            }
        }
    }

    private onLayersAdded(addedLayers) {
        if(!this.modelFactory.getPhotoshopModel().setAutomation) {
            utlis.getFirstAddedItem(addedLayers, this.onFirstAddedLayer.bind(this));
        }
    }

    private async onFirstAddedLayer(addedLayer) {
        this.activeDocument = await this.documentManager.getDocument(this.activeDocument.id);
        if(!addedLayer.layers && addedLayer.type === "layerSection") {
            this.setContainerParams(addedLayer);
        } else {
            this.request = addedLayer;
            this.docEmitter.once("componentAdded", (type) => this.onComponentCreated(type));
        }
    }

    private setContainerParams(addedLayer) {
        this.setParams(addedLayer, "container")
    }

    private onComponentCreated(type) {
        this.setComponentParams(type);
    }

    private setComponentParams(type) {
        this.setParams(this.request, type);
    }

    private setParams(addedLayer, type) {
        const paramsObj = {};
        paramsObj["type"] = type;
        paramsObj["parent"] = this.findParent(addedLayer);
        paramsObj["view"] = this.findView(addedLayer);
        paramsObj["platform"] = this.findPlatform(addedLayer);
        this.modelFactory.getPhotoshopModel().setChildMenuIds(paramsObj["platform"], addedLayer.id, addedLayer.name,
            type, paramsObj["view"]);
    }

    private findParent(addedLayer) {
        return utlis.findParent(addedLayer, this.activeDocument);
    }

    private findView(addedLayer) {
        return utlis.findView(addedLayer, this.activeDocument);
    }

    private findPlatform(addedLayer) {
        return utlis.findPlatform(addedLayer, this.activeDocument);
    }
}