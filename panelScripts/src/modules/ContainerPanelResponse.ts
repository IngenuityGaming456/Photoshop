import {IFactory, IParams} from "../interfaces/IJsxParam";
import {ModelFactory} from "../models/ModelFactory";
import {utlis} from "../utils/utils";
import {PhotoshopModelApp} from "../../srcExtension/models/PhotoshopModels/PhotoshopModelApp";
import {photoshopConstants as pc} from "../constants";
const cloneDeep = require('lodash/cloneDeep.js');

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
        this.docEmitter.on(pc.emitter.handleSocketResponse, (type) => this.getDataForChanges(type));
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
        const activeDocumentCopy = cloneDeep(this.activeDocument);
        if((this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).isDeletedFromLayout) {
            (this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).isDeletedFromLayout = false;
            return;
        }
        const questArray = this.modelFactory.getPhotoshopModel().allDrawnQuestItems;
        for(let item of eventLayers) {
            if(item.removed) {
                const element = utlis.isIDExists(item.id, questArray);
                if(element) {
                    const elementView = utlis.getElementView(element, activeDocumentCopy._layers);
                    const elementPlatform = utlis.getElementPlatform(element, activeDocumentCopy._layers);
                    await utlis.sendResponseToPanel(elementView, elementPlatform, element.name, pc.socket.uncheckFromContainerPanel, "uncheckFinished", this.socket);
                }
            }
        }
        utlis.handleModelData(eventLayers, questArray, this.modelFactory.getPhotoshopModel().viewElementalMap,
                              this.modelFactory.getPhotoshopModel().getQuestViews, this.deletionHandler, this.generator);
    }

    private async getDataForChanges(type) {
        this.activeDocument = await this.documentManager.getDocument(this.activeDocument.id);
        this.setAutomationToYes();
        const previousResponse = this.modelFactory.getPhotoshopModel().previousContainerResponse(type);
        const currentResponse = this.modelFactory.getPhotoshopModel().currentContainerResponse(type);
        if(previousResponse) {
            await this.getChanges(previousResponse, currentResponse, type);
        } else {
            await this.construct(currentResponse, type);
        }
        this.setAutomationToNo();
    }

    private async construct(currentResponse, type) {
        for(let platform of this.platformArray) {
            if (currentResponse[platform]["base"]) {
                await this.makePlatforms(platform, type);
            }
            const viewObj = currentResponse[platform];
            for (let view in viewObj) {
                if (!viewObj.hasOwnProperty(view)) {
                    continue;
                }
                if (viewObj[view][view] && viewObj[view][view]["base"]) {
                    this.applyStartingLogs(view);
                    await this.makeViews(view, platform, type);
                    this.applyEndingLogs(view);
                }
            }
        }
    }

    private async makePlatforms(platform, type) {
        const platformMap = this.modelFactory.getMappingModel().getPlatformMap();
        const platformJson = platformMap.get(platform);
        await this.photoshopFactory.makeStruct(platformJson, null, null, null, type);
    }

    private async makeViews(view, platform, type, currentJson?) {
        const viewMap = this.modelFactory.getMappingModel().getViewPlatformMap(platform);
        let viewJson = viewMap.get(view);
        if(!viewJson && currentJson) {
            viewJson = {
                [view]: currentJson[view]
            }
        }
        const platformRef = utlis.getPlatformRef(platform, this.activeDocument);
        const commonId = utlis.getCommonId(platformRef);
        await this.photoshopFactory.makeStruct(viewJson, commonId, null, platform, type);
    }

    private async getChanges(previousResponseMap, responseMap, type) {
        for(let platform of this.platformArray) {
            await this.getPlatformChanges(platform, previousResponseMap[platform], responseMap[platform], type);
        }
    }

    private async getPlatformChanges(platform, previousPlatformView, currentPlatformView, type) {
        await this.sendPlatformJsonChanges(previousPlatformView, currentPlatformView, platform, type);
        for(let key in previousPlatformView) {
            if(!previousPlatformView.hasOwnProperty(key)) {
                continue;
            }
            await this.sendViewJsonChanges(previousPlatformView[key], currentPlatformView[key], key, platform, type);
        }
    };

    private async sendPlatformJsonChanges(previousPlatformView, currentPlatformView, platform, type) {
        if(currentPlatformView.base && !previousPlatformView.base) {
            await this.makePlatforms(platform, type);
        }
    }

    private async sendViewJsonChanges(previousJson, currentJson, key, platform, type) {
        const previousBaseChild = previousJson && previousJson[Object.keys(previousJson)[0]];
        const currentBaseChild = currentJson && currentJson[Object.keys(currentJson)[0]];
        if(currentBaseChild && currentBaseChild["base"] && previousBaseChild && !previousBaseChild["base"]) {
            this.applyStartingLogs(key);
            await this.makeViews(key, platform, type, currentJson);
            this.applyEndingLogs(key);
            return;
        }

        for (let keyC in currentBaseChild) {
            if(currentBaseChild.hasOwnProperty(keyC)) {
                if(!previousBaseChild[keyC]) {
                    await this.sendAdditionRequest(Object.keys(previousJson)[0], currentBaseChild[keyC], keyC,  platform, type);
                }
            }
        }
    }

    private async sendAdditionRequest(baseKey, currentObj, key, platform, type) {
        await this.photoshopFactory.makeStruct({[key]: currentObj}, this.getParentId(baseKey, platform), baseKey, platform, type);
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

    private setAutomationToYes() {
        this.modelFactory.getPhotoshopModel().setAutomation = true;
    }

    private setAutomationToNo() {
        setTimeout(() => {
            this.modelFactory.getPhotoshopModel().setAutomation = false;
        }, 2000)
    }

}