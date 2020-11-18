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
var ModelFactory_1 = require("../../models/ModelFactory");
var QuestHelpers_1 = require("./QuestHelpers");
/**
 * class reads the quest json file and check for rename, edit, delete and newly added elements
 */
var CreateImport = /** @class */ (function () {
    function CreateImport(psParser, pFactory, modelFactory) {
        this.deletedViews = [];
        this.pFactory = pFactory;
        this.pParser = psParser;
        this.modelFactory = modelFactory;
        this.result = __assign({}, result_1.result);
    }
    CreateImport.prototype.execute = function (params) {
        this.generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.docEmitter = params.docEmitter;
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
            var enObj = this.qObj[platform]["en"];
            this.checkIfViewsDeleted(enObj, platform);
            this.compareViews(enObj, platform);
        }
    };
    CreateImport.prototype.checkIfViewsDeleted = function (enObj, platform) {
        var questViewsArr = [];
        for (var view in enObj) {
            questViewsArr.push(view);
        }
        /**function will return deleted views */
        var photoShopViewsObj = this.pParser.compareWithPhotoShopViews(questViewsArr, platform);
        var diff;
        diff = photoShopViewsObj.filter(function (x) { return !questViewsArr.includes(x.name); });
        for (var i in diff) {
            this.deletedViews.push(diff[i].name);
        }
        this.findAndHandleDeletedElements(enObj, photoShopViewsObj, diff, platform);
    };
    /**
     * function compare views
     * @param enObj - language(english) object
     * @param platform - plateform (desktop, landscape, portrait etc)
     */
    CreateImport.prototype.compareViews = function (enObj, platform) {
        var _a;
        for (var view in enObj) {
            if (!enObj.hasOwnProperty(view)) {
                continue;
            }
            var pView = this.pParser.getPView(view, platform);
            if (!pView) {
                enObj[view].base = true;
                this.result.create.views.push((_a = {},
                    _a[view] = enObj[view],
                    _a.platform = platform,
                    _a));
            }
            this.compareComponents(enObj[view], view, platform);
            /**if view is newly added then dont check for edit, delete or rename */
            if (!this.deletedViews.includes(view)) {
                this.isDelete(enObj, enObj[view], view, platform);
            }
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
            var compObj = viewObj[comp];
            if (this.isNew(compObj.layerID[0])) {
                var type = this.getType(compObj);
                var parentId = this.getParentId(view, platform);
                compObj["parentX"] = compObj.parent && viewObj[compObj.parent].x || 0;
                compObj["parentY"] = compObj.parent && viewObj[compObj.parent].y || 0;
                this.pushToResult({
                    key: compObj,
                    viewId: parentId,
                    view: view,
                    platform: platform
                }, "create", type);
            }
            else {
                console.log(viewObj);
                this.isMove(compObj, viewObj, view, platform);
                this.isRename(compObj, viewObj, view, platform);
                this.isEdit(compObj, view, viewObj, platform);
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
        if (compObj.parent && typeof (compObj.layerID[0]) == "number") {
            var res = this.pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, compObj.parent, null, null, "move");
            if (res) {
                this.handleMove(res, compObj.id, compObj.layerID[0], compObj.parent, viewObj[compObj.parent].layerID[0], this.getType(compObj), view, platform);
                return;
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
    CreateImport.prototype.isEdit = function (compObj, view, viewObj, platform) {
        if (compObj instanceof Object) {
            if (typeof compObj.layerID[0] == 'number' && compObj.type !== "container") {
                var editFunc = QuestHelpers_1.editObj[compObj.type];
                if (editFunc) {
                    editFunc(compObj, this.pParser, viewObj, view, platform, this.result);
                }
                else {
                    QuestHelpers_1.edit(compObj, this.pParser, viewObj, view, platform, this.result);
                }
            }
        }
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
    CreateImport.prototype.isDelete = function (enObj, viewObj, view, platform) {
        var psObjArray = this.pParser.getPSObjects(view, platform);
        var qObjArray = this.getQuestObjects(viewObj);
        var diff;
        diff = psObjArray.filter(function (x) { return !qObjArray.includes(x.id); });
        this.findAndHandleDeletedElements(enObj, psObjArray, diff, platform);
    };
    CreateImport.prototype.findAndHandleDeletedElements = function (enObj, psObjArray, diff, platform) {
        var e_1, _a, e_2, _b;
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
    CreateImport.prototype.isNew = function (layerID) {
        return (typeof (layerID) == "string");
    };
    /**
     * function to get type of a view component
     * @param compObj - curent view component object
     */
    CreateImport.prototype.getType = function (compObj) {
        return compObj.type;
    };
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
        this.pushToResult({
            renamed: renamed,
            view: view,
            platform: platform
        }, "rename", type);
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
        this.pushToResult({
            moveObj: moveObj,
            view: view,
            platform: platform
        }, "move", type);
    };
    CreateImport.prototype.pushToResult = function (item, action, type) {
        utils_1.utlis.addArrayKeyToObject(this.result[action], type);
        this.result[action][type].push(item);
    };
    CreateImport.prototype.getParentId = function (view, platform) {
        var _a;
        var elementalMap = this.modelFactory.getPhotoshopModel().viewElementalMap;
        var currentView = elementalMap[platform][view];
        return (_a = currentView === null || currentView === void 0 ? void 0 : currentView.base) === null || _a === void 0 ? void 0 : _a.id;
    };
    CreateImport.prototype.startCreation = function () {
        var creationObj = FactoryClass_1.inject({ ref: Creation_1.Creation, dep: [ModelFactory_1.ModelFactory] });
        FactoryClass_1.execute(creationObj, { storage: {
                result: this.result,
                pFactory: this.pFactory,
                qAssets: this.qAssetsPath
            }, generator: this.generator, activeDocument: this.activeDocument, docEmitter: this.docEmitter });
    };
    return CreateImport;
}());
exports.CreateImport = CreateImport;
//# sourceMappingURL=CreateImport.js.map