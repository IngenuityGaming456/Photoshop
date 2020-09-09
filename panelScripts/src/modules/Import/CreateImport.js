"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateImport = void 0;
var utils_1 = require("../../utils/utils");
var result_1 = require("./result");
var FactoryClass_1 = require("../FactoryClass");
var Creation_1 = require("./Creation");
/**
 * class reads the quest json file and check for rename, edit, delete and newly added elements
 */
var CreateImport = /** @class */ (function () {
    function CreateImport(psParser, pFactory, modelFactory) {
        this.pFactory = pFactory;
        this.pParser = psParser;
        this.modelFactory = modelFactory;
        this.result = __assign({}, result_1.result);
    }
    CreateImport.prototype.execute = function (params) {
        this.generator = params.generator;
        this.activeDocument = params.activeDocument;
        FactoryClass_1.execute(this.pParser, {
            generator: this.generator,
            activeDocument: this.activeDocument
        });
        this.pParser.execute(params);
        this.getAssetsAndJson();
        this.compareJson();
        this.startCreation();
    };
    /**
     * Function to read the quest json file.
     */
    CreateImport.prototype.getAssetsAndJson = function () {
        var stats = utils_1.utlis.getAssetsAndJson("Quest", this.activeDocument);
        this.qAssetsPath = stats.qAssetsPath;
        this.qObj = stats.qObj;
    };
    /**
     * comparison starts from here, it forwards the platform along with language object
     */
    CreateImport.prototype.compareJson = function () {
        for (var platform in this.qObj) {
            if (!this.qObj.hasOwnProperty(platform)) {
                continue;
            }
            var abject = this.qObj[platform];
            console.log(abject);
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
        for (var view in enObj) {
            if (!enObj.hasOwnProperty(view)) {
                continue;
            }
            var pView = this.pParser.getPView(view, platform);
            if (!pView) {
                this.result.create.views.push({
                    view: enObj[view],
                    platform: platform
                });
            }
            else {
                this.compareComponents(enObj[view], view, platform);
            }
            this.isDelete(enObj, enObj[view], platform);
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
                var parentId = this.getParentId(view, platform);
                compObj["parentX"] = compObj.parent && viewObj[compObj.parent].x || 0;
                compObj["parentY"] = compObj.parent && viewObj[compObj.parent].y || 0;
                this.result.create[type].push({
                    key: compObj,
                    viewId: parentId,
                    view: view,
                    platform: platform
                });
                //console.log(this.result)
            }
            else {
                this.isMove(compObj, viewObj, view, platform);
                this.isRename(compObj, viewObj, view, platform);
                this.isEdit(compObj, view, viewObj, platform);
                this.isImageEdit(compObj, view, platform);
            }
        }
    };
    /**
     * This function will check if a component is moved or not
     * @param compObj components of a view (bigWin, intro outro etc) bigwin , bigwincontainer etc
     * @param viewObj object of view Bigwin view, intro view etc
     * @param view view Bigwin view, intro view etc
     * @param platform desktop, landscape, portrait etc
     */
    CreateImport.prototype.isMove = function (compObj, viewObj, view, platform) {
        if (compObj.parent != "" && typeof compObj.layerID[0] == 'number') {
            var res = this.pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, compObj.parent, null, null, "move");
            if (res) {
                this.handleMove(res, compObj.id, compObj.layerID[0], compObj.parent, viewObj[compObj.parent]['layerID'][0], this.getType(compObj), view, platform);
            }
        }
    };
    /**
     * function to check if a view component is renamed or not ?
     * @param compObj - individual view component
     * @param viewObj - view object
     * @param view - current view
     * @param platform - current platfrom
     */
    CreateImport.prototype.isRename = function (compObj, viewObj, view, platform) {
        if (typeof compObj.layerID[0] == 'number') {
            var res = this.pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, null, null, null, "rename");
            if (res) {
                this.handleRename(res, compObj.id, compObj.layerID[0], this.getType(compObj), view, platform);
            }
        }
    };
    /**
     * function to check if a view component is edited or not
     * @param compObj - current view component
     * @param viewObj - current view object
     * @param view - current view
     * @param platform - current platform
     */
    CreateImport.prototype.isEdit = function (compObj, view, viewObj, platform) {
        var tempParent = {};
        var tempChild = {};
        tempParent["x"] = 0;
        tempParent["y"] = 0;
        /**check if obj is an instance of an object */
        if (compObj instanceof Object) {
            /**chck only for the elements which were created by PS as they have integer layerid */
            if (typeof compObj.layerID[0] == 'number') {
                var height = compObj.h || compObj.height;
                var width = compObj.w || compObj.width;
                var parent_1 = compObj.parent ? compObj.parent : "";
                if (viewObj.hasOwnProperty(parent_1)) {
                    var tempParent_1 = viewObj[parent_1];
                    tempParent_1["x"] = tempParent_1.x;
                    tempParent_1["y"] = tempParent_1.y;
                }
                tempChild["x"] = compObj.x;
                tempChild["y"] = compObj.y;
                tempChild["width"] = width;
                tempChild["height"] = height;
                var res = this.pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, tempParent, tempChild, null, "editElement");
                if (res) {
                    var oldDimensions = {
                        'x': compObj.x,
                        'y': compObj.y,
                        'width': width,
                        'height': height
                    };
                    this.handleEditElement(res, oldDimensions, this.getType(compObj), compObj.layerID[0], compObj.id, view, platform);
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
                        return [4 /*yield*/, this.pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, path, null, compObj.image, "editImage")];
                    case 1:
                        res = _a.sent();
                        if (res) {
                            this.handleEditImage(compObj, this.getType(compObj), view, platform);
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
    CreateImport.prototype.isDelete = function (enObj, viewObj, platform) {
        var e_1, _a, e_2, _b;
        var psObjArray = this.pParser.getPSObjects(platform);
        var qObjArray = this.getQuestObjects(viewObj);
        var diff;
        diff = psObjArray.filter(function (x) { return !qObjArray.includes(x.id); });
        if (diff.length > 0) {
            var delItems = [];
            try {
                for (var psObjArray_1 = __values(psObjArray), psObjArray_1_1 = psObjArray_1.next(); !psObjArray_1_1.done; psObjArray_1_1 = psObjArray_1.next()) {
                    var psObj = psObjArray_1_1.value;
                    if (psObj.isView) {
                        if (this.isInQuestView(psObj.name, enObj, platform)) {
                            delItems.push(psObj);
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (psObjArray_1_1 && !psObjArray_1_1.done && (_a = psObjArray_1.return)) _a.call(psObjArray_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            try {
                for (var delItems_1 = __values(delItems), delItems_1_1 = delItems_1.next(); !delItems_1_1.done; delItems_1_1 = delItems_1.next()) {
                    var item = delItems_1_1.value;
                    var index = psObjArray.indexOf(item);
                    diff.splice(index, 1);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (delItems_1_1 && !delItems_1_1.done && (_b = delItems_1.return)) _b.call(delItems_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            this.handleDeletdElements(diff);
        }
    };
    CreateImport.prototype.isInQuestView = function (viewName, enObj, platform) {
        var views = Object.keys(enObj);
        return views.includes(viewName);
    };
    /**
     * function checks if a component is newly added, as newly added components has string ids
     * @param compObj - current view component object
     */
    CreateImport.prototype.isNew = function (layerID) {
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
    CreateImport.prototype.handleDeletdElements = function (diff) {
        for (var i in diff) {
            this.result.delete['components'].push({
                "id": diff[i].id,
                "name": diff[i].name,
                "type": diff[i].type
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
    CreateImport.prototype.handleRename = function (newName, oldName, elementId, type, view, platform) {
        var renamed = {};
        renamed['newName'] = newName;
        renamed['oldName'] = oldName;
        renamed['elementId'] = elementId;
        renamed = JSON.stringify(renamed);
        this.result.rename[type].push({
            renamed: renamed,
            view: view,
            platform: platform
        });
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
    CreateImport.prototype.handleEditElement = function (bounds, oldDimensions, type, compId, qId, view, platform) {
        var newDimensions = {};
        newDimensions["x"] = bounds.left;
        newDimensions["y"] = bounds.top;
        newDimensions["width"] = bounds.right - bounds.left;
        newDimensions["height"] = bounds.bottom - bounds.top;
        this.result.edit.layout[type].push({
            newDimensions: newDimensions,
            oldDimensions: oldDimensions,
            "name": qId,
            compId: compId,
            view: view,
            platform: platform
        });
    };
    /**
     * function adds the edited image in the result object
     * @param newImg new image object contains name and path
     * @param oldImg old image name
     * @param path old image path
     * @param type type of the component i.e. image
     */
    CreateImport.prototype.handleEditImage = function (compObj, type, view, platform) {
        this.result.edit.asset[type].push({
            "imageObj": compObj,
            view: view,
            platform: platform
        });
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
    CreateImport.prototype.handleMove = function (parent, child, childId, newParent, newParentId, type, view, platform) {
        var moveObj = {};
        moveObj["child"] = child;
        moveObj["childId"] = childId;
        moveObj["parent"] = parent;
        moveObj["newparent"] = newParent;
        moveObj["newparentId"] = newParentId;
        moveObj = JSON.stringify(moveObj);
        this.result.move[type].push({
            moveObj: moveObj,
            view: view,
            platform: platform
        });
        console.log(this.result.move);
    };
    CreateImport.prototype.getParentId = function (view, platform) {
        var elementalMap = this.modelFactory.getPhotoshopModel().viewElementalMap;
        var currentView = elementalMap[platform][view];
        return currentView.base.id;
    };
    CreateImport.prototype.startCreation = function () {
        var creationObj = FactoryClass_1.inject({ ref: Creation_1.Creation, dep: [] });
        // execute(creationObj, {storage: {result : this.result}, generator: this.generator});
        FactoryClass_1.execute(creationObj, { storage: {
                result: this.result,
                pFactory: this.pFactory,
                qAssets: this.qAssetsPath
            }, generator: this.generator, activeDocument: this.activeDocument });
    };
    return CreateImport;
}());
exports.CreateImport = CreateImport;
//# sourceMappingURL=CreateImport.js.map