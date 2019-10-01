import {IDataSubModel, IParams} from "../../interfaces/IJsxParam";
import {utlis} from "../../utils/utils";

export class DataPhotoshopModel implements IDataSubModel{
    private openDocumentData;

    createElementData() {
        return utlis.objectToMap(this.openDocumentData.elementalMap);
    }

    execute(params: IParams) {
        this.openDocumentData = params.storage.openDocumentData;
    }
}