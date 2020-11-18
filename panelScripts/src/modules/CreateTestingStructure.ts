import {IFactory, IParams} from "../interfaces/IJsxParam";
import * as path from "path";
import {ModelFactory} from "../models/ModelFactory";
import {PhotoshopModelApp} from "../../srcExtension/models/PhotoshopModels/PhotoshopModelApp";

export class CreateTestingStructure implements IFactory {
    private readonly modifiedIds = [];
    private modelFactory;

    public constructor(modelFactory: ModelFactory) {
        this.modifiedIds = (modelFactory.getPhotoshopModel() as PhotoshopModelApp).allModifiedIds || [];
        this.modelFactory = modelFactory;
    }
    public async execute(params: IParams) {
        const modifiedIdsCount = this.modifiedIds.length;
        (this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).lastRemovalId = Number(this.modifiedIds[modifiedIdsCount - 1]);
        (this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).isRemoval = true;
        for(let i=0;i<modifiedIdsCount;i++) {
            await params.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/addPath.jsx"),
                {id: this.modifiedIds[i],
                        remove: true
                });
        }
        this.modifiedIds.length = 0;
    }
}