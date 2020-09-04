"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../../utils/utils");
var PhotoshopParser = /** @class */ (function () {
    function PhotoshopParser() {
    }
    PhotoshopParser.prototype.execute = function (params) {
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
    PhotoshopParser.prototype.recursionCallInitiator = function (qLayerID, qId, qParentOrPath, x, y, width, height, qImg, operation) {
        var psObj = this.pObj;
        switch (operation) {
            case 'move':
                return this.findChildUnderParent(psObj, '', qParentOrPath, qLayerID, qId);
                break;
            case 'editElement':
                return this.checkForEditedElement(psObj, qLayerID, qId, x, y, width, height);
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
                        //return "moved";
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
    PhotoshopParser.prototype.getPSObjects = function () {
        var psObj = this.pObj;
        var psObjArray = [];
        return this.getDeletedArray(psObj, psObjArray);
    };
    PhotoshopParser.prototype.getDeletedArray = function (psObj, psObjArray) {
        if (psObj.hasOwnProperty('layers')) {
            /**Iterate over every component of current layer */
            for (var i in psObj['layers']) {
                psObjArray.push(psObj['layers'][i].id);
                this.getDeletedArray(psObj['layers'][i], psObjArray);
            }
        }
        return psObjArray;
    };
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
                        return "same";
                    }
                    else {
                        return psParent;
                        //return "moved";
                    }
                }
                else {
                    var layerParent = obj['layers'][i].name;
                    res = this.findChildUnderParent(obj['layers'][i], layerParent, qParent, qLayerID, qId);
                }
            }
            return res;
        }
        return "notFound";
    };
    PhotoshopParser.prototype.checkForEditedElement = function (obj, qLayerID, qId, x, y, width, height) {
        var res;
        if (obj.hasOwnProperty('layers')) {
            for (var i in obj['layers']) {
                var currentEle = obj['layers'][i];
                if (currentEle.name == qId) {
                    /**if width or height of the element get changed */
                    if ((width !== (currentEle.bounds.right - currentEle.bounds.left)) ||
                        (height !== (currentEle.bounds.bottom - currentEle.bounds.top)) ||
                        (x !== currentEle.bounds.left) || y !== currentEle.bounds.top) {
                        return currentEle.bounds;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    res = this.checkForEditedElement(currentEle, qLayerID, qId, x, y, width, height);
                }
            }
            return res;
        }
        return false;
    };
    PhotoshopParser.prototype.checkIfImageChanged = function (obj, qLayerID, qId, path, qImg) {
        var res;
        if (obj.hasOwnProperty('layers')) {
            for (var i in obj['layers']) {
                var currentEle = obj['layers'][i];
                if (currentEle.name == qId && (currentEle.hasOwnProperty('type') && currentEle.type == 'layer')) {
                    return this.checkImages(qImg, JSON.parse(currentEle.generatorSettings.PanelScriptsImage.json).image, path);
                }
                else {
                    res = this.checkIfImageChanged(currentEle, qLayerID, qId, path, qImg);
                }
            }
            return res;
        }
        return false;
    };
    PhotoshopParser.prototype.checkImages = function (qImg, psImg, path) {
        return __awaiter(this, void 0, void 0, function () {
            var array, len, img1, img2Path, img2, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        array = path.split("/");
                        len = array.length;
                        img1 = utils_1.utlis.readImages(path);
                        img2Path = this.pAssetsPath + "/" + array[len - 4] + "/common/" + array[len - 2] + "/" + psImg + ".png";
                        img2 = utils_1.utlis.readImages(img2Path);
                        return [4 /*yield*/, img1];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, img2];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, (img1 == img2) ? false : { 'image': psImg, 'path': img2Path }];
                    case 3:
                        error_1 = _a.sent();
                        // console.log(error);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return PhotoshopParser;
}());
exports.PhotoshopParser = PhotoshopParser;
//# sourceMappingURL=PhotoshopParser.js.map