import {PhotoshopModel} from "../../../src/models/PhotoshopModels/PhotoshopModel";
import {IParams} from "../../../src/interfaces/IJsxParam";
import * as path from "path";

export class PhotoshopModelApp extends PhotoshopModel {

    private sessionHandler = [];
    private modifiedIds = [];
    private recordedResponse = [];
    private isFromLayout = false;
    private selectedLayers = [];
    private renamedFromLayout = false;

    execute(params: IParams) {
        super.execute(params);
    }

    protected subscribeListeners() {
        super.subscribeListeners();
        this.generator.on("select", () => this.getSelectedLayers());
    }

    private async getSelectedLayers() {
        let selectedLayersString = await this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/SelectedLayersIds.jsx"));
        this.selectedLayers = selectedLayersString.toString().split(",");
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

    get allSelectedLayers() {
        return this.selectedLayers;
    }

    set isRenamedFromLayout(value) {
        this.renamedFromLayout = value;
    }

    get isRenamedFromLayout(): boolean {
        return this.renamedFromLayout;
    }

}