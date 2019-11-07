import {PhotoshopModel} from "./PhotoshopModel";
import {IModel, IParams} from "../../interfaces/IJsxParam";

export class PhotoshopChildModel extends PhotoshopModel{

    private sessionHandler = [];
    private modifiedIds = [];
    private recordedResponse = [];
    private isFromLayout = false;

    execute(params: IParams) {
        super.execute(params);
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

}