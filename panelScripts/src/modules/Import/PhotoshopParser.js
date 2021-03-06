"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoshopParser = void 0;
const utils_1 = require("../../utils/utils");
const fs = require('fs');
let packageJson = require("../../../package.json");
class PhotoshopParser {
    execute(params) {
        this.activeDocument = params.activeDocument;
        this.generator = params.generator;
        this._pluginId = packageJson.name;
        this.psCache = [];
        this.getAssetsAndJson();
    }
    /**
     * Function to read the photoshop json file.
     */
    getAssetsAndJson() {
        const stats = utils_1.utlis.getAssetsAndJson("Photoshop", this.activeDocument);
        this.pAssetsPath = stats.qAssetsPath;
        this.pObj = stats.qObj;
    }
    compareWithPhotoShopViews(questViews, platform) {
        let platformLayer = this.getCurrentLayerType(this.pObj, platform);
        let commonLayer = this.getCurrentLayerType(platformLayer, 'common');
        let photoshopViews = [];
        if (commonLayer.hasOwnProperty('layers')) {
            for (const viewLayer in commonLayer['layers']) {
                photoshopViews.push({
                    name: commonLayer['layers'][viewLayer].name, id: commonLayer['layers'][viewLayer].id, type: "view"
                });
            }
        }
        return photoshopViews;
    }
    getPView(view, platform) {
        return this.checkViews(this.pObj, view, platform);
    }
    checkIfView(viewLayersObj) {
        return viewLayersObj.hasOwnProperty('generatorSettings') ? (viewLayersObj.generatorSettings.hasOwnProperty('PanelScripts') ? JSON.parse(viewLayersObj.generatorSettings.PanelScripts.json) : false) : false;
    }
    checkViews(pObj, view, platform) {
        let res;
        if (pObj.hasOwnProperty('layers')) {
            let viewLayersObj = pObj['layers'];
            for (let i in viewLayersObj) {
                if (viewLayersObj[i].name == view) {
                    let isView = this.checkIfView(viewLayersObj[i]);
                    if (isView == "view")
                        return true;
                }
                else {
                    res = this.checkViews(viewLayersObj[i], view, platform);
                    if (res)
                        return res;
                }
            }
        }
        return false;
    }
    recursionCallInitiator(qLayerID, qId, qParentOrPath, childDimension, qImg, operation) {
        let psObj = this.pObj;
        if (operation === "move") {
            return this.findChildUnderParent(psObj, '', qParentOrPath, qLayerID, qId);
        }
        if (operation === "editElement") {
            return this.checkForEditedElement(psObj, qLayerID, qId, qParentOrPath, childDimension);
        }
        if (operation === "editImage") {
            return this.checkIfImageChanged(psObj, qLayerID, qId, qParentOrPath, qImg);
        }
        if (operation === "rename") {
            return this.checkIfRenamed(psObj, qLayerID, qId);
        }
    }
    /**
     * function checks if a component is renamed
     * @param psObj photoshop json object
     * @param qLayerID quest componenet layerId
     * @param qId name of the quest component
     */
    checkIfRenamed(psObj, qLayerID, qId) {
        const layerRef = utils_1.utlis.isIDExistsRec(qLayerID, psObj.layers);
        return layerRef && layerRef.name !== qId ? layerRef.name : false;
    }
    getCurrentLayerType(psObj, layerType) {
        let res;
        if (psObj.hasOwnProperty('layers')) {
            for (let i in psObj['layers']) {
                if (psObj['layers'][i].name === layerType) {
                    return psObj['layers'][i];
                }
                else {
                    res = this.getCurrentLayerType(psObj['layers'][i], layerType);
                    if (res)
                        return res;
                }
            }
        }
    }
    /**driver function to get deleted object array */
    getPSObjects(view, platform) {
        let psObj = this.pObj;
        let psObjArray = [];
        let currentPlatform = this.getCurrentLayerType(psObj, platform);
        let curentView = this.getCurrentLayerType(currentPlatform, view);
        return this.getDeletedArray(curentView, psObjArray, platform);
    }
    /**get the quest deleted objects */
    getDeletedArray(psObj, psObjArray, platform) {
        if (psObj && psObj.hasOwnProperty('layers')) {
            /**Iterate over every component of current layer */
            for (let i in psObj['layers']) {
                let delImg = {};
                delImg['id'] = psObj['layers'][i].id;
                delImg['name'] = psObj['layers'][i].name;
                delImg['type'] = psObj['layers'][i].type;
                const view = psObj['layers'][i].generatorSettings && psObj['layers'][i].generatorSettings[this._pluginId];
                if (view) {
                    delImg["isView"] = true;
                }
                psObjArray.push(delImg);
                this.getDeletedArray(psObj['layers'][i], psObjArray, platform);
            }
        }
        return psObjArray;
    }
    /**
     *
     * @param obj function to check if a object is moved from its parent to under other parent
     * @param psParent
     * @param qParent
     * @param qLayerID
     * @param qId
     */
    findChildUnderParent(obj, psParent, qParent, qLayerID, qId) {
        const layerRef = utils_1.utlis.isIDExistsRec(qLayerID, obj.layers);
        return layerRef && layerRef.group.name !== qParent ? layerRef.group.name : false;
    }
    checkForEditedElement(obj, qLayerID, qId, parCordinates, childDimensions) {
        const layerRef = utils_1.utlis.isIDExistsRec(qLayerID, obj.layers);
        if (layerRef) {
            if ((childDimensions.width !== (layerRef.bounds.right - layerRef.bounds.left)) ||
                (childDimensions.height !== (layerRef.bounds.bottom - layerRef.bounds.top)) ||
                (childDimensions.x !== (parCordinates.x - layerRef.bounds.left)) || childDimensions.y !== (parCordinates.y - layerRef.bounds.top)) {
                return layerRef.bounds;
            }
        }
        return false;
    }
    /**
     * driver recursion function to check if images are chnaged
     * @param obj
     * @param qLayerID
     * @param qId
     * @param path
     * @param qImg
     */
    checkIfImageChanged(obj, qLayerID, qId, path, qImg) {
        const layerRef = utils_1.utlis.isIDExistsRec(qLayerID, obj.layers);
        if (layerRef && layerRef.type === "layer") {
            let resp = this.checkImages(qImg, JSON.parse(layerRef.generatorSettings.PanelScriptsImage.json).image, path);
            console.log(typeof (resp), resp);
            return resp;
        }
        return false;
    }
    /**
     * function will check if images are changed, we have extract path of
     * ps images from quest images because inside folder structure is same
     * @param qImg quest image
     * @param psImg ps images
     * @param path path of quest images
     */
    checkImages(qImg, psImg, path) {
        try {
            let array = path.split("/");
            let len = array.length;
            const img1 = this.readImages(path);
            let img2Path = utils_1.utlis.recurFiles(`${psImg}`, this.pAssetsPath);
            const img2 = this.readImages(img2Path);
            return img1 === img2;
        }
        catch (error) {
            return false;
        }
    }
    readImages(path) {
        return fs.readFileSync(path, "base64");
    }
}
exports.PhotoshopParser = PhotoshopParser;
//# sourceMappingURL=PhotoshopParser.js.map