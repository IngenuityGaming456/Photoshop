import {IFactory, IParams} from "../interfaces/IJsxParam";
import {ModelFactory} from "../models/ModelFactory";
import {utlis} from "../utils/utils";

export class ContainerPanelResponse implements IFactory {
    private modelFactory: ModelFactory;
    private generator;

    public constructor(modelFactory: ModelFactory) {
        this.modelFactory = modelFactory;
    }

    public execute(params: IParams)
    {
        this.generator = params.generator;
        this.subscribeListeners();
        this.getDataForChanges();
    }

    private subscribeListeners() {
        this.generator.on("layersDeleted", (eventLayers) => this.onLayersDeleted(eventLayers));
    }

    private async onLayersDeleted(eventLayers) {
        const baseId = this.modelFactory.getPhotoshopModel().menuIds;
        const childId = this.modelFactory.getPhotoshopModel().childIds;
        const concatId = baseId.concat(childId);
        eventLayers.forEach(item => {
            const element = utlis.isIDExists(item.id, concatId);
            this.generator.emit("UncheckFromContainerPanel", element.name);
        });

    }

    private getDataForChanges() {
        const previousResponse = this.modelFactory.getPhotoshopModel().previousContainerResponse;
        const currentResponse = this.modelFactory.getPhotoshopModel().currentContainerResponse;
        const viewMap = this.modelFactory.getMappingModel().getViewMap();
        const clickedMenus = this.modelFactory.getPhotoshopModel().clickedMenuNames;
        this.getChanges(previousResponse, currentResponse, viewMap, clickedMenus);
    }

    private getChanges(previousResponseMap, responseMap, viewsMap, clickedMenus) {
        clickedMenus.forEach(item => {
            const viewObj = viewsMap.get(item);
            const viewKeys = Object.keys(viewObj);
           this.handleViewKeys(viewKeys, previousResponseMap, responseMap);
        });
    }

    private handleViewKeys(viewKeys, previousResponseMap, responseMap) {
        viewKeys.forEach(item => {
            this.sendJsonChanges(previousResponseMap.get(item), responseMap.get(item));
        });
    }

    private sendJsonChanges(previousJson, currentJson) {
        const previousBaseChild = previousJson[Object.keys(previousJson)[0]];
        const currentBaseChild = currentJson[Object.keys(currentJson)[0]];

        for (let key in currentBaseChild) {
            if(currentBaseChild.hasOwnProperty(key)) {
                if(!previousBaseChild[key]) {
                    this.sendAdditionRequest(Object.keys(previousJson)[0], currentBaseChild[key]);
                }
            }
        }

        for(let key in previousBaseChild) {
            if(previousBaseChild.hasOwnProperty(key)) {
                if(!currentBaseChild[key]) {
                    this.sendDeletionRequest(Object.keys(previousJson)[0], previousBaseChild[key]);
                }
            }
        }
    }

    private sendAdditionRequest(baseKey: string, currentObj) {
        this.generator.emit("drawAddedStruct", this.getParentId(baseKey), currentObj);
    }

    private sendDeletionRequest(baseKey: string, previousObj) {
        this.generator.emit("deleteStruct", this.getChildId(previousObj));
    }

    private getChildId(previousObj) {
        const childId = this.modelFactory.getPhotoshopModel().childIds;
        const child = childId.find(item => {
            if(item.id === previousObj.id) {
                return true;
            }
        });
        return child.id;
    }

    private getParentId(baseKey) {
        const baseId = this.modelFactory.getPhotoshopModel().menuIds;
        const parent = baseId.find(item => {
            if(item.name === baseKey) {
                return true;
            }
        });
        return parent.id;
    }

}