import {PhotoshopModel} from "../../../src/models/PhotoshopModels/PhotoshopModel";
import {IParams} from "../../../src/interfaces/IJsxParam";

export class PhotoshopModelApp extends PhotoshopModel {

    private sessionHandler = [];
    private modifiedIds = [];
    private recordedResponse = [];
    private isFromLayout = false;
    private selectedLayers = [];
    private renamedFromLayout = false;
    private isRemovalOn = false;
    private lastId = null;

    execute(params: IParams) {
        super.execute(params);
    }

    protected subscribeListeners() {
        super.subscribeListeners();
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

}