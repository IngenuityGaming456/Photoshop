import {IFactory, IParams} from "../interfaces/IJsxParam";
import {ModelFactory} from "../models/ModelFactory";
import {utlis} from "../utils/utils";
import * as layerClass from "../../lib/dom/layer";
import {PhotoshopModelApp} from "../../srcExtension/models/PhotoshopModels/PhotoshopModelApp";
import {photoshopConstants as pc} from "../constants";

export class ContainerPanelResponse implements IFactory {
    private modelFactory: ModelFactory;
    private generator;
    private platformArray = [];
    private socket;
    private photoshopFactory;
    private docEmitter;
    private activeDocument;
    private deletionHandler = [];
    private documentManager;

    public constructor(modelFactory: ModelFactory, photoshopFactory) {
        this.modelFactory = modelFactory;
        this.photoshopFactory = photoshopFactory;
    }

    public execute(params: IParams)
    {
        this.platformArray = this.modelFactory.getPhotoshopModel().allQuestPlatforms;
        this.deletionHandler = (this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).allSessionHandler;
        this.generator = params.generator;
        this.docEmitter = params.docEmitter;
        this.activeDocument = params.activeDocument;
        this.documentManager = params.storage.documentManager;
        this.subscribeListeners();
        this.isReady();
    }

    private subscribeListeners() {
        this.generator.on(pc.generator.layersDeleted, (eventLayers) => this.onLayersDeleted(eventLayers));
        this.docEmitter.on(pc.emitter.handleSocketResponse, () => this.getDataForChanges());
        this.docEmitter.on(pc.logger.getUpdatedHTMLSocket, socket => this.onSocketUpdate(socket));
        this.docEmitter.on(pc.logger.destroy, () => this.onDestroy());
        this.docEmitter.on(pc.logger.newDocument, () => this.onNewDocument());
        this.docEmitter.on(pc.logger.currentDocument, () => this.onCurrentDocument());
    }

    private isReady() {
        this.docEmitter.emit(pc.logger.containerPanelReady);
    }

    private onSocketUpdate(socket) {
        this.socket = socket;
    }

    private async onLayersDeleted(eventLayers) {
        if((this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).isDeletedFromLayout) {
            (this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).isDeletedFromLayout = false;
            return;
        }
        const questArray = this.modelFactory.getPhotoshopModel().allDrawnQuestItems;
        eventLayers.forEach(item => {
            if(item.removed) {
                const element = utlis.isIDExists(item.id, questArray);
                if(element) {
                    const elementView = utlis.getElementView(element, this.activeDocument.layers);
                    const elementPlatform = utlis.getElementPlatform(element, this.activeDocument.layers);
                    this.socket.emit(pc.socket.uncheckFromContainerPanel, elementPlatform, elementView, element.name);
                }
            }
        });
        utlis.handleModelData(eventLayers, questArray, this.modelFactory.getPhotoshopModel().viewElementalMap,
                              this.deletionHandler);
    }

    private async getDataForChanges() {
        const previousResponse = this.modelFactory.getPhotoshopModel().previousContainerResponse;
        const currentResponse = this.modelFactory.getPhotoshopModel().currentContainerResponse;
        if(previousResponse) {
            this.getChanges(previousResponse, currentResponse);
        } else {
            await this.construct(currentResponse);
        }
    }

    private async construct(currentResponse) {
        for(let platform of this.platformArray) {
            if (currentResponse[platform]["base"]) {
                await this.makePlatforms(platform);
            }
            const viewObj = currentResponse[platform];
            for (let view in viewObj) {
                if (!viewObj.hasOwnProperty(view)) {
                    continue;
                }
                if (viewObj[view][view] && viewObj[view][view]["base"]) {
                    this.applyStartingLogs(view);
                    await this.makeViews(view, platform);
                    this.applyEndingLogs(view);
                }
            }
        }
    }

    private async makePlatforms(platform) {
        const platformMap = this.modelFactory.getMappingModel().getPlatformMap();
        const platformJson = platformMap.get(platform);
        await this.photoshopFactory.makeStruct(platformJson, null, null, null);
    }

    private async makeViews(view, platform) {
        const viewMap = this.modelFactory.getMappingModel().getViewPlatformMap(platform);
        const viewJson = viewMap.get(view);
        const platformRef = utlis.getPlatformRef(platform, this.activeDocument);
        const commonId = utlis.getCommonId(platformRef);
        await this.photoshopFactory.makeStruct(viewJson, commonId, null, platform);
    }

    private async getChanges(previousResponseMap, responseMap) {
        for(let platform of this.platformArray) {
            await this.getPlatformChanges(platform, previousResponseMap[platform], responseMap[platform]);
        }
    }

    private async getPlatformChanges(platform, previousPlatformView, currentPlatformView) {
        await this.sendPlatformJsonChanges(previousPlatformView, currentPlatformView, platform);
        for(let key in previousPlatformView) {
            if(!previousPlatformView.hasOwnProperty(key)) {
                continue;
            }
            await this.sendViewJsonChanges(previousPlatformView[key], currentPlatformView[key], key, platform);
        }
    };

    private async sendPlatformJsonChanges(previousPlatformView, currentPlatformView, platform) {
        if(currentPlatformView.base && !previousPlatformView.base) {
            await this.makePlatforms(platform);
        }
    }

    private async sendViewJsonChanges(previousJson, currentJson, key, platform) {
        const previousBaseChild = previousJson && previousJson[Object.keys(previousJson)[0]];
        const currentBaseChild = currentJson && currentJson[Object.keys(currentJson)[0]];
        if(currentBaseChild && currentBaseChild["base"] && previousBaseChild && !previousBaseChild["base"]) {
            this.applyStartingLogs(key);
            await this.makeViews(key, platform);
            this.applyEndingLogs(key);
            return;
        }

        for (let keyC in currentBaseChild) {
            if(currentBaseChild.hasOwnProperty(keyC)) {
                if(!previousBaseChild[keyC]) {
                    await this.sendAdditionRequest(Object.keys(previousJson)[0], currentBaseChild[keyC], keyC,  platform);
                }
            }
        }
    }

    private async sendAdditionRequest(baseKey, currentObj, key, platform) {
        await this.photoshopFactory.makeStruct({[key]: currentObj}, this.getParentId(baseKey, platform), baseKey, platform);
    }

    private getParentId(baseKey, platform) {
        const elementalMap = this.modelFactory.getPhotoshopModel().viewElementalMap;
        const view = elementalMap[platform][baseKey];
        return view.base.id;
    }

    private applyStartingLogs(keys) {
        this.docEmitter.emit(pc.logger.logStatus, `Started making ${keys}`);
    }

    private applyEndingLogs(keys) {
        this.docEmitter.emit(pc.logger.logStatus, `${keys} done`);
    }

    private onDestroy() {
        this.socket.emit(pc.logger.destroy);
    }

    private onNewDocument() {
        this.socket.emit(pc.socket.disablePage);
    }

    private onCurrentDocument() {
        this.socket.emit(pc.socket.enablePage);
    }

}