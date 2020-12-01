import {IViewStructure} from "../interfaces/IJsxParam";
import {photoshopConstants as pc} from "../constants";
import * as path from "path";

export class CreateView implements IViewStructure {
    private platform;

    public async shouldDrawStruct(generator, docEmitter, getPlatform, viewDeletionObj, menuName) {
        let selectedLayers = await generator.evaluateJSXFile(path.join(__dirname, "../../jsx/SelectedLayers.jsx"));
        let selectedLayerId = await generator.evaluateJSXFile(path.join(__dirname, "../../jsx/SelectedLayersIds.jsx"));
        let selectedLayersArray = selectedLayers.split(",");
        let selectedLayersIdArray = selectedLayerId.toString().split(",");
        if(~selectedLayersArray.indexOf(pc.common) && selectedLayersArray.length === 1
            && (!this.isAlreadyMade(selectedLayersIdArray[0], getPlatform, menuName, viewDeletionObj))) {
            return Promise.resolve({insertId: selectedLayersIdArray[0], platform: this.platform});
        }
        docEmitter.emit(pc.logger.logWarning, `Need to select only common to make ${menuName}`);
        return Promise.reject("invalid");
    }

    private isAlreadyMade(selectedLayerId, getPlatform, menuName, viewDeletionObj) {
        const platform = getPlatform(Number(selectedLayerId));
        this.platform = platform;
        if(menuName === pc.views.genericView) {
            return false;
        }
        return !(viewDeletionObj[platform][menuName] === null || viewDeletionObj[platform][menuName]);
    }

}

export class CreatePlatform implements IViewStructure {

    public async shouldDrawStruct(generator, docEmitter) {
        let jsxPath = path.join(__dirname, "../../jsx/SelectedLayers.jsx");
        let selectedLayers = await generator.evaluateJSXFile(jsxPath);
        if(!selectedLayers.length) {
            return Promise.resolve({insertId: null, platform: null});
        }
        docEmitter.emit(pc.logger.logWarning, "No layer should be selected in order to make a platform");
        return Promise.reject("invalid");
    }
}