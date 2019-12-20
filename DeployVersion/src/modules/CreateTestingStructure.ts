import {IFactory, IParams} from "../interfaces/IJsxParam";
import {CreateLayoutStructure} from "./LayoutStructure/CreateLayoutStructure";
import * as path from "path";
import {ModelFactory} from "../models/ModelFactory";

export class CreateTestingStructure implements IFactory {
    private modifiedIds = [];

    public constructor(modelFactory: ModelFactory) {
        this.modifiedIds = modelFactory.getPhotoshopModel().allModifiedIds;
    }
    public async execute(params: IParams) {
        //params.generator.onPhotoshopEvent("imageChanged", CreateLayoutStructure.listenerFn);
        const modifiedIdsCount = this.modifiedIds.length;
        for(let i=0;i<modifiedIdsCount;i++) {
            await params.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/addPath.jsx"),
                {id: this.modifiedIds[i],
                        remove: true
                });
        }
        this.modifiedIds.length = 0;
    }
}