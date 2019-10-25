import {PhotoshopModel} from "./PhotoshopModel";
import {IModel, IParams} from "../../interfaces/IJsxParam";

export class PhotoshopChildModel extends PhotoshopModel{

    private sessionHandler = [];
    private modifiedIds = [];

    execute(params: IParams) {
        super.execute(params);
    }

    get allSessionHandler() {
        return this.sessionHandler;
    }

    get allModifiedIds() {
        return this.modifiedIds;
    }

}