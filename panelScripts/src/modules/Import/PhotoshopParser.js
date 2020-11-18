"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoshopParser = void 0;
var utils_1 = require("../../utils/utils");
var fs = require('fs');
var packageJson = require("../../../package.json");
var PhotoshopParser = /** @class */ (function () {
    function PhotoshopParser() {
    }
    PhotoshopParser.prototype.execute = function (params) {
        this.activeDocument = params.activeDocument;
        this.generator = params.generator;
        this._pluginId = packageJson.name;
        this.psCache = [];
        this.getAssetsAndJson();
    };
    /**
     * Function to read the photoshop json file.
     */
    PhotoshopParser.prototype.getAssetsAndJson = function () {
        var stats = utils_1.utlis.getAssetsAndJson("Photoshop", this.activeDocument);
        this.pAssetsPath = stats.qAssetsPath;
        this.pObj = stats.qObj;
    };
    PhotoshopParser.prototype.compareWithPhotoShopViews = function (questViews, platform) {
        var platformLayer = this.getCurrentLayerType(this.pObj, platform);
        var commonLayer = this.getCurrentLayerType(platformLayer, 'common');
        var photoshopViews = [];
        if (commonLayer.hasOwnProperty('layers')) {
            for (var viewLayer in commonLayer['layers']) {
                photoshopViews.push({
                    name: commonLayer['layers'][viewLayer].name, id: commonLayer['layers'][viewLayer].id, type: "view"
                });
            }
        }
        return photoshopViews;
    };
    PhotoshopParser.prototype.getPView = function (view, platform) {
        return this.checkViews(this.pObj, view, platform);
    };
    PhotoshopParser.prototype.checkIfView = function (viewLayersObj) {
        return viewLayersObj.hasOwnProperty('generatorSettings') ? (viewLayersObj.generatorSettings.hasOwnProperty('PanelScripts') ? JSON.parse(viewLayersObj.generatorSettings.PanelScripts.json) : false) : false;
    };
    PhotoshopParser.prototype.checkViews = function (pObj, view, platform) {
        var res;
        if (pObj.hasOwnProperty('layers')) {
            var viewLayersObj = pObj['layers'];
            for (var i in viewLayersObj) {
                if (viewLayersObj[i].name == view) {
                    var isView = this.checkIfView(viewLayersObj[i]);
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
    };
    PhotoshopParser.prototype.recursionCallInitiator = function (qLayerID, qId, qParentOrPath, childDimension, qImg, operation) {
        var psObj = this.pObj;
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
    };
    /**
     * function checks if a component is renamed
     * @param psObj photoshop json object
     * @param qLayerID quest componenet layerId
     * @param qId name of the quest component
     */
    PhotoshopParser.prototype.checkIfRenamed = function (psObj, qLayerID, qId) {
        var layerRef = utils_1.utlis.isIDExistsRec(qLayerID, psObj.layers);
        return layerRef && layerRef.name !== qId ? layerRef.name : false;
    };
    PhotoshopParser.prototype.getCurrentLayerType = function (psObj, layerType) {
        var res;
        if (psObj.hasOwnProperty('layers')) {
            for (var i in psObj['layers']) {
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
    };
    /**driver function to get deleted object array */
    PhotoshopParser.prototype.getPSObjects = function (view, platform) {
        var psObj = this.pObj;
        var psObjArray = [];
        var currentPlatform = this.getCurrentLayerType(psObj, platform);
        var curentView = this.getCurrentLayerType(currentPlatform, view);
        return this.getDeletedArray(curentView, psObjArray, platform);
    };
    /**get the quest deleted objects */
    PhotoshopParser.prototype.getDeletedArray = function (psObj, psObjArray, platform) {
        if (psObj && psObj.hasOwnProperty('layers')) {
            /**Iterate over every component of current layer */
            for (var i in psObj['layers']) {
                var delImg = {};
                delImg['id'] = psObj['layers'][i].id;
                delImg['name'] = psObj['layers'][i].name;
                delImg['type'] = psObj['layers'][i].type;
                var view = psObj['layers'][i].generatorSettings && psObj['layers'][i].generatorSettings[this._pluginId];
                if (view) {
                    delImg["isView"] = true;
                }
                psObjArray.push(delImg);
                this.getDeletedArray(psObj['layers'][i], psObjArray, platform);
            }
        }
        return psObjArray;
    };
    /**
     *
     * @param obj function to check if a object is moved from its parent to under other parent
     * @param psParent
     * @param qParent
     * @param qLayerID
     * @param qId
     */
    PhotoshopParser.prototype.findChildUnderParent = function (obj, psParent, qParent, qLayerID, qId) {
        var layerRef = utils_1.utlis.isIDExistsRec(qLayerID, obj.layers);
        return layerRef && layerRef.group.name !== qParent ? layerRef.group.name : false;
    };
    PhotoshopParser.prototype.checkForEditedElement = function (obj, qLayerID, qId, parCordinates, childDimensions) {
        var layerRef = utils_1.utlis.isIDExistsRec(qLayerID, obj.layers);
        if (layerRef) {
            if ((childDimensions.width !== (layerRef.bounds.right - layerRef.bounds.left)) ||
                (childDimensions.height !== (layerRef.bounds.bottom - layerRef.bounds.top)) ||
                (childDimensions.x !== (parCordinates.x - layerRef.bounds.left)) || childDimensions.y !== (parCordinates.y - layerRef.bounds.top)) {
                return layerRef.bounds;
            }
        }
        return false;
    };
    /**
     * driver recursion function to check if images are chnaged
     * @param obj
     * @param qLayerID
     * @param qId
     * @param path
     * @param qImg
     */
    PhotoshopParser.prototype.checkIfImageChanged = function (obj, qLayerID, qId, path, qImg) {
        var layerRef = utils_1.utlis.isIDExistsRec(qLayerID, obj.layers);
        if (layerRef && layerRef.type === "layer") {
            var resp = this.checkImages(qImg, JSON.parse(layerRef.generatorSettings.PanelScriptsImage.json).image, path);
            console.log(typeof (resp), resp);
            return resp;
        }
        return false;
    };
    /**
     * function will check if images are changed, we have extract path of
     * ps images from quest images because inside folder structure is same
     * @param qImg quest image
     * @param psImg ps images
     * @param path path of quest images
     */
    PhotoshopParser.prototype.checkImages = function (qImg, psImg, path) {
        try {
            var array = path.split("/");
            var len = array.length;
            var img1 = this.readImages(path);
            var img2Path = utils_1.utlis.recurFiles("" + psImg, this.pAssetsPath);
            var img2 = this.readImages(img2Path);
            return img1 === img2;
        }
        catch (error) {
            return false;
        }
    };
    PhotoshopParser.prototype.readImages = function (path) {
        return fs.readFileSync(path, "base64");
    };
    return PhotoshopParser;
}());
exports.PhotoshopParser = PhotoshopParser;
//# sourceMappingURL=PhotoshopParser.js.map