"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
var fs = require("fs");
// import {utlis} from "../../utils/utils";
var PhotoshopParser_1 = require("./PhotoshopParser");
var result_1 = require("./result");
/**
 * class reads the quest json file and check for rename, edit, delete and newly added elements
 */
var CreateImport = /** @class */ (function () {
    function CreateImport() {
        this.pParser = new PhotoshopParser_1.PhotoshopParser();
        this.pParser.execute();
        this.result = __assign({}, result_1.result);
    }
    CreateImport.prototype.execute = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // this.generator = params.generator;
                    // this.activeDocument = params.activeDocument;
                    return [4 /*yield*/, this.getAssetsAndJson()];
                    case 1:
                        // this.generator = params.generator;
                        // this.activeDocument = params.activeDocument;
                        _a.sent();
                        return [4 /*yield*/, this.compareJson()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Function to read the quest json file.
     */
    CreateImport.prototype.getAssetsAndJson = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stats;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stats = this.pParser.getAssetsAndJsons("quest", "BigWin", "quest");
                        return [4 /*yield*/, stats];
                    case 1:
                        _a.sent();
                        this.qAssetsPath = stats.qAssetsPath;
                        this.qObj = stats.qObj;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * comparison starts from here, it forwards the plateform along with language object
     */
    CreateImport.prototype.compareJson = function () {
        // console.log("compare json", this.qObj);
        for (var platform in this.qObj) {
            // console.log(platform, this.qObj);
            if (!this.qObj.hasOwnProperty(platform)) {
                continue;
            }
            var enObj = this.qObj[platform]["en"];
            this.compareViews(enObj, platform);
        }
    };
    /**
     * function compare views
     * @param enObj - language(english) object
     * @param platform - plateform (desktop, landscape, portrait etc)
     */
    CreateImport.prototype.compareViews = function (enObj, platform) {
        // console.log("compare views", enObj)
        for (var view in enObj) {
            //console.log("dfghjk",view)
            if (!enObj.hasOwnProperty(view)) {
                continue;
            }
            var pView = this.pParser.getPView(view, platform);
            if (!pView) {
                this.result.create.views.push({
                    view: view,
                    platform: platform
                });
            }
            else {
                this.compareComponents(enObj[view], view, platform);
            }
            //console.log("jhfvsdvfjdsvfgvfvfshgv",this.result);
        }
    };
    /**function compare view components one by one with psParser
     * @param viewObj - view object
     * @param view - view ie. bigwin, intro outro etc
     * @param platform - platform i.e. desktop, landscape, portrait etc.
     */
    CreateImport.prototype.compareComponents = function (viewObj, view, platform) {
        for (var comp in viewObj) {
            if (!viewObj.hasOwnProperty(comp) || !(viewObj[comp] instanceof Object)) {
                continue;
            }
            // console.log("compare component  ",comp);
            var compObj = viewObj[comp];
            if (this.isNew(compObj.layerID[0])) {
                var type = this.getType(compObj);
                this.result.create[type].push(compObj);
                //console.log(this.result)
            }
            else {
                this.isMove(compObj, view, platform);
                this.isRename(compObj, viewObj, view, platform);
                this.isEdit(compObj, view, platform);
                this.isImageEdit(compObj, view, platform);
            }
        }
        this.isDelete(viewObj, view, platform);
        var data = JSON.stringify(this.result);
        fs.writeFileSync('modified.json', data);
    };
    /**
     * This function will check if a component is moved or not
     * @param compObj components of a view (bigWin, intro outro etc) bigwin , bigwincontainer etc
     * @param viewObj object of view Bigwin view, intro view etc
     * @param view view Bigwin view, intro view etc
     * @param platform desktop, landscape, portrait etc
     */
    CreateImport.prototype.isMove = function (compObj, view, platform) {
        if (compObj.parent != "" && typeof compObj.layerID[0] == 'number') {
            var res = this.pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, compObj.parent, null, null, null, null, null, "move");
            if (res) {
                this.handleMove(res, compObj.id, compObj.parent, this.getType(compObj), view, platform);
            }
        }
    };
    // private isMove(compObj, viewObj, view, platform) {
    //     const moveObj = {};
    //     const parent = compObj.parent;
    //     const parentObj = viewObj[parent];
    //     if(this.isNew(parentObj)) {
    //         this.handleMove(moveObj, compObj, parentObj, this.getType(compObj), view, platform);
    //     }
    //     const isDiff = this.psParser.compareParent(compObj, parentObj, view, platform);
    //     if(isDiff) {
    //         this.handleMove(moveObj, compObj, parentObj, this.getType(compObj), view, platform);
    //     }
    // }
    /**
     * function to check if a view component is renamed or not ?
     * @param compObj - individual view component
     * @param viewObj - view object
     * @param view - current view
     * @param platform - current platfrom
     */
    CreateImport.prototype.isRename = function (compObj, viewObj, view, platform) {
        if (typeof compObj.layerID[0] == 'number') {
            var res = this.pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, null, null, null, null, null, null, "rename");
            if (res) {
                console.log("in res");
                this.handleRename(res, compObj.id, this.getType(compObj), view, platform);
            }
            console.log(res);
        }
    };
    /**
     * function to check if a view component is edited or not
     * @param compObj - current view component
     * @param viewObj - current view object
     * @param view - current view
     * @param platform - current platform
     */
    CreateImport.prototype.isEdit = function (compObj, view, platform) {
        /**check if obj is an instance of an object */
        if (compObj instanceof Object) {
            /**chck only for the elements which were created by PS as they have integer layerid */
            if (typeof compObj.layerID[0] == 'number') {
                var height = compObj.h || compObj.height;
                var width = compObj.w || compObj.width;
                //let img = comp.image?comp.image:"";
                // console.log("image is : ", img)
                var res = this.pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, null, compObj.x, compObj.y, width, height, null, "editElement");
                if (res) {
                    var oldDimensions = {
                        'x': compObj.x,
                        'y': compObj.y,
                        'width': width,
                        'height': height
                    };
                    this.handleEditElement(res, oldDimensions, this.getType(compObj), compObj.id, view, platform);
                }
                console.log(res);
            }
        }
    };
    /**
     *
     * @param compObj function to check if image is edited or not
     * @param viewObj - current view object
     * @param view - current view
     * @param platform - current platform
     */
    CreateImport.prototype.isImageEdit = function (compObj, view, platform) {
        return __awaiter(this, void 0, void 0, function () {
            var path, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(compObj instanceof Object)) return [3 /*break*/, 2];
                        if (!(typeof compObj.layerID[0] == 'number' && compObj.image)) return [3 /*break*/, 2];
                        path = this.qAssetsPath + "/" + platform + "/common/" + view + "/" + compObj.image + ".png";
                        return [4 /*yield*/, this.pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, path, null, null, null, null, compObj.image, "editImage")];
                    case 1:
                        res = _a.sent();
                        console.log(res);
                        if (res) {
                            this.handleEditImage(res, compObj.image, path, this.getType(compObj));
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * function to get all the quest component object which has numerical ids
     * because psjson has numerical ids
     * @param viewObj - current view object
     */
    CreateImport.prototype.getQuestObjects = function (viewObj) {
        var qArray = [];
        for (var i in viewObj) {
            if (!viewObj.hasOwnProperty(i)) {
                continue;
            }
            var comp = viewObj[i];
            if (comp instanceof Object && typeof comp.layerID[0] == 'number')
                qArray.push(comp.layerID[0]);
        }
        return qArray;
    };
    /**
     * function handles the delete functionality
     * first it gathers the view components from photoshop json
     * second it gathers the view components from quest json
     * then it perform questjsonobject - photoshopjsonobject
     * and gets the deleted components
     * @param viewObj - current view object
     * @param view - current view
     * @param platform - current platform
     */
    CreateImport.prototype.isDelete = function (viewObj, view, platform) {
        var psObjArray = this.pParser.getPSObjects(platform);
        var qObjArray = this.getQuestObjects(viewObj);
        var diff;
        if (psObjArray.length > 0 && qObjArray.length > 0) {
            diff = psObjArray.filter(function (x) { return !qObjArray.includes(x.id); });
        }
        if (diff.length > 0)
            this.handleDeletdElements(diff, viewObj, view, platform);
    };
    /**
     * function checks if a component is newly added, as newly added components has string ids
     * @param compObj - current view component object
     */
    CreateImport.prototype.isNew = function (layerID) {
        //console.log(typeof(layerID)=="string" ?true:false)
        return (typeof (layerID) == "string" ? true : false);
    };
    /**
     * function to get type of a view component
     * @param compObj - curent view component object
     */
    CreateImport.prototype.getType = function (compObj) {
        return compObj.type;
    };
    /**
     * function adds the deleted elements in the result object
     * @param diff - deleted components
     * @param viewObj - current view object
     * @param view - current view
     * @param platform - current platform
     */
    CreateImport.prototype.handleDeletdElements = function (diff, viewObj, view, platform) {
        for (var i in diff) {
            this.result.delete['components'].push({
                "id": diff[i].id,
                "name": diff[i].name,
                "type": diff[i].type,
                view: view,
                platform: platform
            });
        }
    };
    /**
     * function adds the renamed elements in the result object
     * @param newName new name of the component
     * @param oldName old name of the component
     * @param type type of the component
     * @param view current view
     * @param platform current platform
     */
    CreateImport.prototype.handleRename = function (newName, oldName, type, view, platform) {
        var renamed = {};
        renamed['newName'] = newName;
        renamed['oldName'] = oldName;
        renamed = JSON.stringify(renamed);
        this.result.rename[type].push({
            renamed: renamed,
            view: view,
            platform: platform
        });
        // console.log(this.result.rename)
    };
    /**
     * function adds the edited elements in the result object
     * @param bounds bounds of the elements (top, bottom, left, right)
     * @param oldDimensions old dimensions of the component
     * @param type type of the component
     * @param qId id (identifying name) of the component
     * @param view current view
     * @param platform current platform
     */
    CreateImport.prototype.handleEditElement = function (bounds, oldDimensions, type, qId, view, platform) {
        var newDimensions = {};
        newDimensions["x"] = bounds.left;
        newDimensions["y"] = bounds.top;
        newDimensions["width"] = bounds.right - bounds.left;
        newDimensions["height"] = bounds.bottom - bounds.top;
        this.result.edit.layout[type].push({
            newDimensions: newDimensions,
            oldDimensions: oldDimensions,
            "name": qId,
            view: view,
            platform: platform
        });
        // console.log(this.result.edit.layout.container);
    };
    /**
     * function adds the edited image in the result object
     * @param newImg new image object contains name and path
     * @param oldImg old image name
     * @param path old image path
     * @param type type of the component i.e. image
     */
    CreateImport.prototype.handleEditImage = function (newImg, oldImg, path, type) {
        this.result.edit.layout[type].push({
            "oldImage": oldImg,
            "newImage": newImg.image
        });
        this.result.edit.asset[type].push({
            "oldPath": path,
            "newOath": newImg.path
        });
        // console.log(this.result.edit.asset)
    };
    /**
     * function adds the moved elements in the result object
     * @param newParent new parent of the moved component
     * @param child component moved
     * @param parent old parent of the moved component
     * @param type type of the component
     * @param view current view
     * @param platform current platform
     */
    CreateImport.prototype.handleMove = function (newParent, child, parent, type, view, platform) {
        var moveObj = {};
        moveObj["child"] = child;
        moveObj["parent"] = parent;
        moveObj["newparent"] = newParent;
        moveObj = JSON.stringify(moveObj);
        this.result.move[type].push({
            moveObj: moveObj,
            view: view,
            platform: platform
        });
        //    console.log(this.result.move);
    };
    return CreateImport;
}());
var obj = new CreateImport();
obj.execute();
//# sourceMappingURL=CreateImport.js.map