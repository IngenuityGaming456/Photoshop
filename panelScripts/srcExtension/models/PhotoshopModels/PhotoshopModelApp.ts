import {PhotoshopModel} from "../../../src/models/PhotoshopModels/PhotoshopModel";
import {IParams} from "../../../src/interfaces/IJsxParam";
import * as path from "path";
import {photoshopConstants as pc} from "../../../src/constants";
import {utlis} from "../../../src/utils/utils";
const languages = require("../../../src/res/languages.json");

export class PhotoshopModelApp extends PhotoshopModel {

    private sessionHandler = [];
    private modifiedIds = [];
    private recordedResponse = [];
    private isFromLayout = false;
    private renamedFromLayout = false;
    private isRemovalOn = false;
    private lastId = null;
    private lastRenameId = null;
    private selectedIdName;
    private selectedId;
    private localisationStruct = null;

    execute(params: IParams) {
        super.execute(params);
    }

    protected subscribeListeners() {
        super.subscribeListeners();
        this.generator.on(pc.generator.layersDeleted, eventLayers => this.onLayersDeleted(eventLayers));
        this.generator.on("select", () => this.storeSelectedName());
        this.generator.on("select", () => this.storeSelectedIds())
    }

    private onLayersDeleted(eventLayers) {
        const activeDocumentNonUpdated  = {...this.activeDocument};
        eventLayers.forEach(deletedLayers => {
            const deletedRef = activeDocumentNonUpdated._layers.findLayer(deletedLayers.id);
            if(!deletedRef) return;
            if(utlis.getElementName(deletedRef, pc.languages)) {
                const platformName = utlis.getElementName(deletedRef, null);
                const platformRef = utlis.getPlatformRef(platformName, this.activeDocument);
                const commonId = utlis.getCommonId(platformRef);
                const commonRef = this.activeDocument.layers.findLayer(commonId);
                const mappedView = utlis.getView(commonRef, deletedRef.layer.name);
                if(mappedView) {
                    this.deleteMappedViewFromLocalisationStruct(mappedView, this.localisationStruct);
                } else if(~languages["languages"].indexOf(deletedRef.layer.name)) {
                    this.deletedMappedLangIdFromLocalisationStruct(deletedRef.layer.name, this.localisationStruct);
                }
            }
        })
    }

    private deleteMappedViewFromLocalisationStruct(mappedView, localisationLayers) {
        for(let item in localisationLayers) {
            if(!localisationLayers.hasOwnProperty(item)) {
                continue;
            }
            const localisedStruct = localisationLayers[item];
            if(localisedStruct.struct) {
                for(let structLayers of localisedStruct.struct) {
                    if(structLayers.id === mappedView) {
                        delete localisationLayers[item];
                        return;
                    }
                }
            }
            this.deleteMappedViewFromLocalisationStruct(mappedView, localisedStruct);
        }
    }

    private deletedMappedLangIdFromLocalisationStruct(deletedLangId, localisationLayers) {
        for(let item in localisationLayers) {
            if(!localisationLayers.hasOwnProperty(item)) {
                continue;
            }
            if(localisationLayers[item].localise) {
                return;
            }
            if(item === deletedLangId) {
                delete localisationLayers[item];
                return;
            }
            this.deletedMappedLangIdFromLocalisationStruct(deletedLangId, localisationLayers[item]);
        }
    }

    protected handleData() {
        super.handleData();
        this.localisationStruct = this.accessDocLocalisationStruct();
    }

    private accessDocLocalisationStruct() {
        return this.subPhotoshopModel.accessDocLocalisationStruct();
    }

    private async storeSelectedName() {
        let selectedLayersString = await this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/SelectedLayers.jsx"));
        this.selectedIdName = selectedLayersString.toString().split(",")[0];
    }

    private async storeSelectedIds() {
        let selectedLayersString = await this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/SelectedLayersIds.jsx"));
        this.selectedId = selectedLayersString.toString().split(",")[0];
    }

    protected getWriteData() {
        super.getWriteData();
        this.writeData["docLocalisationStruct"] = this.localisationStruct;
    }

    get selectedName() {
        return this.selectedIdName;
    }

    get selectedNameId() {
        return this.selectedId;
    }

    get allSessionHandler() {
        return this.sessionHandler;
    }

    get allModifiedIds() {
        return this.modifiedIds;
    }

    get allRecordedResponse() {
        return this.recordedResponse;
    }

    get isDeletedFromLayout() {
        return this.isFromLayout;
    }

    set isDeletedFromLayout(value) {
        this.isFromLayout = value;
    }

    set isRenamedFromLayout(value) {
        this.renamedFromLayout = value;
    }

    get isRenamedFromLayout(): boolean {
        return this.renamedFromLayout;
    }

    set isRemoval(value: boolean) {
        this.isRemovalOn = value;
    }

    get isRemoval(): boolean {
        return this.isRemovalOn;
    }

    set lastRemovalId(value: number) {
        this.lastId = value;
    }

    get lastRemovalId() {
        return this.lastId;
    }

    set lastRename(value: number) {
        this.lastRenameId = value;
    }

    get lastRename() {
        return this.lastRenameId;
    }

    set docLocalisationStruct(value) {
        this.localisationStruct = value;
    }

    get docLocalisationStruct() {
        return this.localisationStruct;
    }

}