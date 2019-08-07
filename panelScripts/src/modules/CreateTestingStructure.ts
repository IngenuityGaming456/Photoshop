import {IFactory} from "../interfaces/IJsxParam";
import {CreateLayoutStructure} from "./CreateLayoutStructure";
import * as path from "path";

export class CreateTestingStructure implements IFactory {
    public async execute(generator, menuName: string, factoryMap, activeDocument) {
        generator.onPhotoshopEvent("imageChanged", CreateLayoutStructure.listenerFn);
        const modifiedIdsCount = CreateLayoutStructure.modifiedIds.length;
        for(let i=0;i<modifiedIdsCount;i++) {
            await generator.evaluateJSXFile(path.join(__dirname, "../../jsx/addPath.jsx"),
                {id: CreateLayoutStructure.modifiedIds[i],
                        remove: true
                });
        }
        CreateLayoutStructure.modifiedIds = [];
    }
}