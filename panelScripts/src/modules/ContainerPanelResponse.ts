import {IFactory, IParams} from "../interfaces/IJsxParam";
import {ModelFactory} from "../models/ModelFactory";
import {utlis} from "../utils/utils";
import * as path from "path";
let packageJson = require("../../package.json");

export class ContainerPanelResponse implements IFactory {
    private modelFactory: ModelFactory;
    private generator;
    private platformArray = [];
    private socket;
    private photoshopFactory;
    private docEmitter;
    private activeDocument;
    private deletionHandler = [];

    public constructor(modelFactory: ModelFactory, photoshopFactory) {
        this.modelFactory = modelFactory;
        this.photoshopFactory = photoshopFactory;
    }

    public execute(params: IParams)
    {
        this.platformArray = this.modelFactory.getPhotoshopModel().allQuestPlatforms;
        this.deletionHandler = this.modelFactory.getPhotoshopModel().allSessionHandler;
        this.generator = params.generator;
        this.docEmitter = params.docEmitter;
        this.activeDocument = params.activeDocument;
        this.subscribeListeners();
    }

    private subscribeListeners() {
        this.generator.on("save", () => this.onSave());
        this.generator.on("layersDeleted", (eventLayers) => this.onLayersDeleted(eventLayers));
        this.docEmitter.on("HandleSocketResponse", () => this.getDataForChanges());
        this.docEmitter.on("getUpdatedHTMLSocket", socket => this.onSocketUpdate(socket));
    }

    private async onSave() {
        if(this.socket) {
            const docIdObj = await this.generator.getDocumentSettingsForPlugin(this.activeDocument.id,
                packageJson.name + "Document");
            this.socket.emit("activeDocument", this.activeDocument.directory, docIdObj.docId);
        }
    }

    private onSocketUpdate(socket) {
        this.socket = socket;
    }

    private async onLayersDeleted(eventLayers) {
        const questArray = this.modelFactory.getPhotoshopModel().allDrawnQuestItems;
        eventLayers.forEach(item => {
            const element = utlis.isIDExists(item.id, questArray);
            if(element) {
                const elementView = utlis.getElementView(element, this.activeDocument.layers);
                if(elementView) {
                    this.socket.emit("UncheckFromContainerPanel", elementView, element.name);
                }
            }
        });
        utlis.handleModelData(eventLayers, questArray, this.modelFactory.getPhotoshopModel().viewElementalMap,
                              this.deletionHandler);
    }

    private getDataForChanges() {
        const previousResponse = this.modelFactory.getPhotoshopModel().previousContainerResponse;
        const currentResponse = this.modelFactory.getPhotoshopModel().currentContainerResponse;
        if(previousResponse) {
            this.getChanges(previousResponse, currentResponse);
        }
    }

    private async getChanges(previousResponseMap, responseMap) {
        for(let platform of this.platformArray) {
            await this.getPlatformChanges(platform, previousResponseMap[platform], responseMap[platform]);
        }
    }

    private async getPlatformChanges(platform, previousPlatformView, currentPlatformView) {
        for(let key in previousPlatformView) {
            if(!previousPlatformView.hasOwnProperty(key)) {
                continue;
            }
            if(this.isViewDeleted(platform, key) === false) {
                await this.sendJsonChanges(previousPlatformView[key], currentPlatformView[key], platform);
            }
        }
    };

    private isViewDeleted(platform, valueKey) {
        const viewMap = this.modelFactory.getMappingModel().getViewPlatformMap(platform);
        const viewKeys = viewMap.keys();
        for(let key of viewKeys) {
            const value = viewMap.get(key);
            const isInValue = Object.keys(value).some(item => {
                if(item === valueKey) {
                    return true;
                }
            });
            if(isInValue) {
                return this.modelFactory.getPhotoshopModel().viewDeletion[platform][key];
            }
        }
    }

    private async sendJsonChanges(previousJson, currentJson, platform) {
        const previousBaseChild = previousJson[Object.keys(previousJson)[0]];
        const currentBaseChild = currentJson[Object.keys(currentJson)[0]];

        for (let key in currentBaseChild) {
            if(currentBaseChild.hasOwnProperty(key)) {
                if(!previousBaseChild[key]) {
                    await this.sendAdditionRequest(Object.keys(previousJson)[0], currentBaseChild[key], key,  platform);
                }
            }
        }

        for(let key in previousBaseChild) {
            if(previousBaseChild.hasOwnProperty(key)) {
                if(!currentBaseChild[key]) {
                    const keysArray = Object.keys(previousJson);
                    const firstKey = keysArray[0];
                    await this.sendDeletionRequest(firstKey, key, platform);
                }
            }
        }
    }

    private async sendAdditionRequest(baseKey, currentObj, key, platform) {
        await this.photoshopFactory.makeStruct({[key]: currentObj}, this.getParentId(baseKey), baseKey, platform);
    }

    private async sendDeletionRequest(view, key, platform) {
        const childId = this.getChildId(view, key, platform);
        if(!childId) {
            await this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), {id: childId});
        }
    }

    private getChildId(view, element, platform) {
        const elementalMap = this.modelFactory.getPhotoshopModel().viewElementalMap;
        const viewObj = elementalMap[platform][view];
        for(let key in viewObj) {
            if(!viewObj.hasOwnProperty(key)) {
                continue;
            }
            for(let item of viewObj[key]) {
                if(item.name === element) {
                    return item.id;
                }
            }
        }
        return null;
    }

    private getParentId(baseKey) {
        const baseId = this.modelFactory.getPhotoshopModel().allDrawnQuestItems;
        const parent = baseId.find(item => {
            if(item.name === baseKey) {
                return true;
            }
        });
        if(parent) {
            return parent.id;
        }
    }

}