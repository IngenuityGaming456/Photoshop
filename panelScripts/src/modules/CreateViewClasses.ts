import {IViewStructure} from "../interfaces/IJsxParam";
import * as path from "path";

export class CreateView implements IViewStructure {

    public async shouldDrawStruct(generator): Promise<string> {
        let selectedLayers = await generator.evaluateJSXFile(path.join(__dirname, "../../jsx/SelectedLayers.jsx"));
        let selectedLayerId = await generator.evaluateJSXFile(path.join(__dirname, "../../jsx/SelectedLayersIds.jsx"));
        let selectedLayersArray = selectedLayers.split(",");
        let selectedLayersIdArray = selectedLayerId.toString().split(",");
        if(~selectedLayersArray.indexOf("common") && selectedLayersArray.length === 1) {
            return Promise.resolve(selectedLayersIdArray[0]);
        }
        return Promise.reject("invalid");
    }
}

export class CreatePlatform implements IViewStructure {

    public async shouldDrawStruct(generator): Promise<string> {
        let jsxPath = path.join(__dirname, "../../jsx/SelectedLayers.jsx");
        let selectedLayers = await generator.evaluateJSXFile(jsxPath);
        if(!selectedLayers.length) {
            return Promise.resolve(null);
        }
        return Promise.reject("invalid");
    }
}