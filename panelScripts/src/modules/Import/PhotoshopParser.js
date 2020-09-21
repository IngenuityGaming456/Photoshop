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
    PhotoshopParser.prototype.getPView = function (view, platform) {
        return this.checkViews(this.pObj, view, platform);
    };
    PhotoshopParser.prototype.checkViews = function (pObj, view, platform) {
        var res;
        if (pObj.hasOwnProperty('layers')) {
            var viewLayersObj = pObj['layers'];
            for (var i in viewLayersObj) {
                if (viewLayersObj[i].name == view) {
                    var isView = viewLayersObj[i].hasOwnProperty('generatorSettings') ? (viewLayersObj[i].generatorSettings.hasOwnProperty('PanelScripts') ? JSON.parse(viewLayersObj[i].generatorSettings.PanelScripts.json) : false) : false;
                    if (isView == "view")
                        return true;
                }
                else {
                    res = this.checkViews(viewLayersObj[i], view, platform);
                }
            }
            return res;
        }
        return false;
    };
    /**
     * function will handle all the recursion calls and return the response mainly a object
     * of moved, edited, renamed or deleted object from quest json file
     * @param qLayerID
     * @param qId
     * @param qParentOrPath parent of qId element or path of image for imageEdit check
     * @param x
     * @param y
     * @param width
     * @param height
     * @param qImg
     * @param operation
     */
    PhotoshopParser.prototype.recursionCallInitiator = function (qLayerID, qId, qParentOrPath, childDimension, qImg, operation) {
        var psObj = this.pObj;
        switch (operation) {
            case 'move':
                return this.findChildUnderParent(psObj, '', qParentOrPath, qLayerID, qId);
                break;
            case 'editElement':
                return this.checkForEditedElement(psObj, qLayerID, qId, qParentOrPath, childDimension.x, childDimension.y, childDimension.width, childDimension.height);
                break;
            case 'editImage':
                return this.checkIfImageChanged(psObj, qLayerID, qId, qParentOrPath, qImg);
                break;
            case 'rename':
                return this.checkIfRenamed(psObj, qLayerID, qId);
                break;
            default:
                return false;
                break;
        }
    };
    /**
     * function checks if a component is renamed
     * @param psObj photoshop json object
     * @param qLayerID quest componenet layerId
     * @param qId name of the quest component
     */
    PhotoshopParser.prototype.checkIfRenamed = function (psObj, qLayerID, qId) {
        var res;
        /**Check if curent object has any layer property */
        if (psObj.hasOwnProperty('layers')) {
            /**Iterate over every component of current layer */
            for (var i in psObj['layers']) {
                /**If current layer child's id is equal to quest child id */
                if (psObj['layers'][i].id == qLayerID) {
                    /**If parent is also equal the component is not moved return false else return the parent to which it is moved */
                    if (psObj['layers'][i].name !== qId) {
                        return psObj['layers'][i].name;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    res = this.checkIfRenamed(psObj['layers'][i], qLayerID, qId);
                }
            }
            return res;
        }
        return false;
    };
    /**driver function to get deleted object array */
    PhotoshopParser.prototype.getPSObjects = function (platform) {
        var psObj = this.pObj;
        var psObjArray = [];
        return this.getDeletedArray(psObj, psObjArray, platform);
    };
    /**get the quest deleted objects */
    PhotoshopParser.prototype.getDeletedArray = function (psObj, psObjArray, platform) {
        if (psObj.hasOwnProperty('layers')) {
            /**Iterate over every component of current layer */
            for (var i in psObj['layers']) {
                if ((psObj['layers'][i].name !== platform) && (psObj['layers'][i].name !== "languages") && (psObj['layers'][i].name !== "common") && (psObj['layers'][i].name !== "download")) {
                    var delImg = {};
                    delImg['id'] = psObj['layers'][i].id;
                    delImg['name'] = psObj['layers'][i].name;
                    delImg['type'] = psObj['layers'][i].type;
                    var view = psObj['layers'][i].generatorSettings && psObj['layers'][i].generatorSettings[this._pluginId];
                    if (view) {
                        delImg["isView"] = true;
                    }
                    psObjArray.push(delImg);
                }
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
        var res;
        /**Check if curent object has any layer property */
        if (obj.hasOwnProperty('layers')) {
            /**Iterate over every component of current layer */
            for (var i in obj['layers']) {
                /**If current layer child's id is equal to quest child id */
                if (obj['layers'][i].id == qLayerID) {
                    /**If parent is also equal the component is not moved return false else return the parent to which it is moved */
                    if (psParent == qParent) {
                        return false;
                    }
                    else {
                        return psParent;
                    }
                }
                else {
                    psParent = obj['layers'][i].name;
                    res = this.findChildUnderParent(obj['layers'][i], psParent, qParent, qLayerID, qId);
                    if (res) {
                        return res;
                    }
                }
            }
        }
        return false;
    };
    /**
     * function will check if elements are edited
     * @param obj
     * @param qLayerID
     * @param qId
     * @param x
     * @param y
     * @param width
     * @param height
     */
    PhotoshopParser.prototype.checkForEditedElement = function (obj, qLayerID, qId, parCordinates, x, y, width, height) {
        var res;
        if (obj.hasOwnProperty('layers')) {
            for (var i in obj['layers']) {
                var currentEle = obj['layers'][i];
                if (currentEle.name == qId) {
                    /**if width or height of the element get changed */
                    if ((width !== (currentEle.bounds.right - currentEle.bounds.left)) ||
                        (height !== (currentEle.bounds.bottom - currentEle.bounds.top)) ||
                        (x !== (parCordinates.x - currentEle.bounds.left)) || y !== (parCordinates.y - currentEle.bounds.top)) {
                        return currentEle.bounds;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    res = this.checkForEditedElement(currentEle, qLayerID, qId, parCordinates, x, y, width, height);
                    if (res) {
                        return res;
                    }
                }
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
        var res;
        if (obj.hasOwnProperty('layers')) {
            for (var i in obj['layers']) {
                var currentEle = obj['layers'][i];
                if (currentEle.name == qId && (currentEle.hasOwnProperty('type') && currentEle.type == 'layer')) {
                    var resp = this.checkImages(qImg, JSON.parse(currentEle.generatorSettings.PanelScriptsImage.json).image, path);
                    console.log(typeof (resp), resp);
                    return resp;
                }
                else {
                    res = this.checkIfImageChanged(currentEle, qLayerID, qId, path, qImg);
                    if (res) {
                        return res;
                    }
                }
            }
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
            return (img1 == img2) ? false : true;
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