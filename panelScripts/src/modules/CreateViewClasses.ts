import {IViewStructure} from "../interfaces/IJsxParam";
import * as path from "path";

export class CreateView implements IViewStructure {
    private platform;

    public async shouldDrawStruct(generator, getPlatform, viewDeletionObj, menuName) {
        let selectedLayers = await generator.evaluateJSXFile(path.join(__dirname, "../../jsx/SelectedLayers.jsx"));
        let selectedLayerId = await generator.evaluateJSXFile(path.join(__dirname, "../../jsx/SelectedLayersIds.jsx"));
        let selectedLayersArray = selectedLayers.split(",");
        let selectedLayersIdArray = selectedLayerId.toString().split(",");
        if(~selectedLayersArray.indexOf("common") && selectedLayersArray.length === 1
            && this.isAlreadyMade(selectedLayersIdArray[0], getPlatform, menuName, viewDeletionObj)) {
            return Promise.resolve({insertId: selectedLayersIdArray[0], platform: this.platform});
        }
        return Promise.reject("invalid");
    }

    private isAlreadyMade(selectedLayerId, getPlatform, menuName, viewDeletionObj) {
        const platform = getPlatform(Number(selectedLayerId));
        if(viewDeletionObj[platform][menuName] === null || viewDeletionObj[platform][menuName]) {
            this.platform = platform;
            return true;
        }
        return false;
    }


}

export class CreatePlatform implements IViewStructure {

    public async shouldDrawStruct(generator) {
        let jsxPath = path.join(__dirname, "../../jsx/SelectedLayers.jsx");
        let selectedLayers = await generator.evaluateJSXFile(jsxPath);
        if(!selectedLayers.length) {
            return Promise.resolve({insertId: null, platform: null});
        }
        return Promise.reject("invalid");
    }
}