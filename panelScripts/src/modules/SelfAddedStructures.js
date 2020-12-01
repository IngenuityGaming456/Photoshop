"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelfAddedStructures = void 0;
const constants_1 = require("../constants");
const utils_1 = require("../utils/utils");
let packageJson = require("../../package.json");
class SelfAddedStructures {
    constructor(modelFactory) {
        this.modelFactory = modelFactory;
    }
    execute(params) {
        this.generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.documentManager = params.storage.documentManager;
        this.docEmitter = params.docEmitter;
        this.pluginId = packageJson.name;
        this.subscribeListeners();
    }
    subscribeListeners() {
        this.generator.on(constants_1.photoshopConstants.generator.layersAdded, addedLayers => {
            this.onLayersAdded(addedLayers);
        });
        this.generator.on(constants_1.photoshopConstants.generator.layerRenamed, renamedLayer => {
            this.onLayerRenamed(renamedLayer[0]);
        });
        //Layer Deletion call will eventually come from ContainerPanelResponse
        this.generator.on(constants_1.photoshopConstants.generator.layersMoved, movedLayers => {
            this.onLayersMoved(movedLayers);
        });
    }
    onLayersMoved(movedLayers) {
        return __awaiter(this, void 0, void 0, function* () {
            const lastLayerObj = utils_1.utlis.getLastParentAndChildLayers(movedLayers);
            const parentId = lastLayerObj.parent && lastLayerObj.parent.id;
            if (parentId) {
                for (const childItem of lastLayerObj.child) {
                    yield this.modifyParentAndChild(parentId, childItem.id);
                }
            }
        });
    }
    modifyParentAndChild(parentId, childId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.activeDocument = yield this.documentManager.getDocument(this.activeDocument.id);
            if (!utils_1.utlis.isIDExists(childId, this.modelFactory.getPhotoshopModel().allDrawnQuestItems)) {
                utils_1.utlis.handleModelData([{ id: childId }], [], this.modelFactory.getPhotoshopModel().viewElementalMap, this.modelFactory.getPhotoshopModel().getQuestViews, [], this.generator);
                const layerRef = this.activeDocument.layers.findLayer(childId);
                if (layerRef.layer && layerRef.layer.generatorSettings && layerRef.layer.generatorSettings[this.pluginId]) {
                    const type = layerRef.layer.generatorSettings[this.pluginId].json;
                    type !== "view" && this.setParams({ id: childId, name: layerRef.layer.name }, type);
                }
                else if (layerRef.layer && layerRef.layer.type === "layerSection") {
                    this.setContainerParams({ id: childId, name: layerRef.layer.name });
                }
            }
        });
    }
    onLayersAdded(addedLayers) {
        if (!this.modelFactory.getPhotoshopModel().setAutomation) {
            utils_1.utlis.getFirstAddedItem(addedLayers, this.onFirstAddedLayer.bind(this));
        }
    }
    onLayerRenamed(renamedLayer) {
        this.renameSelfStructures(renamedLayer.name, renamedLayer.id);
    }
    renameSelfStructures(name, id) {
        const elementalMap = this.modelFactory.getPhotoshopModel().viewElementalMap;
        utils_1.utlis.renameElementalMap(elementalMap, name, id, this.generator);
    }
    onFirstAddedLayer(addedLayer) {
        return __awaiter(this, void 0, void 0, function* () {
            this.activeDocument = yield this.documentManager.getDocument(this.activeDocument.id);
            if (!addedLayer.layers && addedLayer.type === "layerSection") {
                this.setContainerParams(addedLayer);
            }
            else {
                this.request = addedLayer;
                this.docEmitter.once("componentAdded", (type) => this.onComponentCreated(type));
            }
        });
    }
    setContainerParams(addedLayer) {
        this.setParams(addedLayer, "container");
    }
    onComponentCreated(type) {
        this.setComponentParams(type);
    }
    setComponentParams(type) {
        this.setParams(this.request, type);
    }
    setParams(addedLayer, type) {
        const paramsObj = {};
        paramsObj["type"] = type;
        paramsObj["parent"] = this.findParent(addedLayer);
        paramsObj["view"] = this.findView(addedLayer);
        paramsObj["platform"] = this.findPlatform(addedLayer);
        this.modelFactory.getPhotoshopModel().setChildMenuIds(paramsObj["platform"], addedLayer.id, addedLayer.name, type, paramsObj["view"]);
    }
    findParent(addedLayer) {
        return utils_1.utlis.findParent(addedLayer, this.activeDocument);
    }
    findView(addedLayer) {
        return utils_1.utlis.findView(addedLayer, this.activeDocument, "common");
    }
    findPlatform(addedLayer) {
        return utils_1.utlis.findPlatform(addedLayer, this.activeDocument);
    }
}
exports.SelfAddedStructures = SelfAddedStructures;
//# sourceMappingURL=SelfAddedStructures.js.map