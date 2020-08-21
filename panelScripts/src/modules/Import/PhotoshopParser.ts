import {IFactory, IParams} from "../../interfaces/IJsxParam";
import {utlis} from "../../utils/utils";

export class PhotoshopParser implements IFactory {
    private generator;
    private activeDocument;
    private pAssetsPath;
    private pObj;
    execute(params: IParams) {
        this.getAssetsAndJson();
    }

    private getAssetsAndJson() {
        const stats = utlis.getAssetsAndJson("Quest", this.activeDocument);
        this.pAssetsPath = stats.qAssetsPath;
        this.pObj = stats.qObj;
    }



}