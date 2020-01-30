import {PhotoshopModel} from "../../../src/models/PhotoshopModels/PhotoshopModel";
import {IParams} from "../../../src/interfaces/IJsxParam";
import * as path from "path";

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
        this.generator.on("select", () => this.storeSelectedName());
        this.generator.on("select", () => this.storeSelectedIds())
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