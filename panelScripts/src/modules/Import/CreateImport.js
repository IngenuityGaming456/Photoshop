"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateImport = void 0;
const utils_1 = require("../../utils/utils");
const result_1 = require("./result");
const FactoryClass_1 = require("../FactoryClass");
const Creation_1 = require("./Creation");
const ModelFactory_1 = require("../../models/ModelFactory");
const QuestHelpers_1 = require("./QuestHelpers");
/**
 * class reads the quest json file and check for rename, edit, delete and newly added elements
 */
class CreateImport {
    constructor(psParser, pFactory, modelFactory) {
        this.deletedViews = [];
        this.pFactory = pFactory;
        this.pParser = psParser;
        this.modelFactory = modelFactory;
        this.result = Object.assign({}, result_1.result);
    }
    execute(params) {
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
    }
    /**
     * Function to read the quest json file.
     */
    getAssetsAndJson() {
        const stats = utils_1.utlis.getAssetsAndJson("Quest", this.activeDocument);
        this.qAssetsPath = stats.qAssetsPath;
        this.qObj = stats.qObj;
    }
    /**
     * comparison starts from here, it forwards the platform along with language object
     */
    compareJson() {
        for (let platform in this.qObj) {
            if (!this.qObj.hasOwnProperty(platform)) {
                continue;
            }
            let abject = this.qObj[platform];
            const enObj = this.qObj[platform]["en"];
            this.checkIfViewsDeleted(enObj, platform);
            this.compareViews(enObj, platform);
        }
    }
    checkIfViewsDeleted(enObj, platform) {
        let questViewsArr = [];
        for (const view in enObj) {
            questViewsArr.push(view);
        }
        /**function will return deleted views */
        let photoShopViewsObj = this.pParser.compareWithPhotoShopViews(questViewsArr, platform);
        let diff;
        diff = photoShopViewsObj.filter((x) => !questViewsArr.includes(x.name));
        for (const i in diff) {
            this.deletedViews.push(diff[i].name);
        }
        this.findAndHandleDeletedElements(enObj, photoShopViewsObj, diff, platform);
    }
    /**
     * function compare views
     * @param enObj - language(english) object
     * @param platform - plateform (desktop, landscape, portrait etc)
     */
    compareViews(enObj, platform) {
        for (let view in enObj) {
            if (!enObj.hasOwnProperty(view)) {
                continue;
            }
            const pView = this.pParser.getPView(view, platform);
            if (!pView) {
                enObj[view].base = true;
                this.result.create.views.push({
                    [view]: enObj[view],
                    platform,
                });
            }
            this.compareComponents(enObj[view], view, platform);
            /**if view is newly added then dont check for edit, delete or rename */
            if (!this.deletedViews.includes(view)) {
                this.isDelete(enObj, enObj[view], view, platform);
            }
        }
    }
    /**function compare view components one by one with psParser
     * @param viewObj - view object
     * @param view - view ie. bigwin, intro outro etc
     * @param platform - platform i.e. desktop, landscape, portrait etc.
     */
    compareComponents(viewObj, view, platform) {
        for (let comp in viewObj) {
            if (!viewObj.hasOwnProperty(comp) || !(viewObj[comp] instanceof Object)) {
                continue;
            }
            const compObj = viewObj[comp];
            if (this.isNew(compObj.layerID[0])) {
                const type = this.getType(compObj);
                const parentId = this.getParentId(view, platform);
                compObj["parentX"] = compObj.parent && viewObj[compObj.parent].x || 0;
                compObj["parentY"] = compObj.parent && viewObj[compObj.parent].y || 0;
                this.pushToResult({
                    key: compObj,
                    viewId: parentId,
                    view,
                    platform
                }, "create", type);
            }
            else {
                console.log(viewObj);
                this.isMove(compObj, viewObj, view, platform);
                this.isRename(compObj, viewObj, view, platform);
                this.isEdit(compObj, view, viewObj, platform);
            }
        }
    }
    /**
     * This function will check if a component is moved or not
     * @param compObj components of a view (bigWin, intro outro etc) bigwin , bigwincontainer etc
     * @param viewObj object of view Bigwin view, intro view etc
     * @param view view Bigwin view, intro view etc
     * @param platform desktop, landscape, portrait etc
     */
    isMove(compObj, viewObj, view, platform) {
        if (compObj.parent && typeof (compObj.layerID[0]) == "number") {
            let res = this.pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, compObj.parent, null, null, "move");
            if (res) {
                this.handleMove(res, compObj.id, compObj.layerID[0], compObj.parent, viewObj[compObj.parent].layerID[0], this.getType(compObj), view, platform);
                return;
            }
        }
    }
    /**
     * function to check if a view component is renamed or not ?
     * @param compObj - individual view component
     * @param viewObj - view object
     * @param view - current view
     * @param platform - current platfrom
     */
    isRename(compObj, viewObj, view, platform) {
        if (typeof compObj.layerID[0] == 'number') {
            let res = this.pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, null, null, null, "rename");
            if (res) {
                this.handleRename(res, compObj.id, compObj.layerID[0], this.getType(compObj), view, platform);
            }
        }
    }
    isEdit(compObj, view, viewObj, platform) {
        if (compObj instanceof Object) {
            if (typeof compObj.layerID[0] == 'number' && compObj.type !== "container") {
                const editFunc = QuestHelpers_1.editObj[compObj.type];
                if (editFunc) {
                    editFunc(compObj, this.pParser, viewObj, view, platform, this.result);
                }
                else {
                    QuestHelpers_1.edit(compObj, this.pParser, viewObj, view, platform, this.result);
                }
            }
        }
    }
    /**
     * function to get all the quest component object which has numerical ids
     * because psjson has numerical ids
     * @param viewObj - current view object
     */
    getQuestObjects(viewObj) {
        let qArray = [];
        for (let i in viewObj) {
            if (!viewObj.hasOwnProperty(i)) {
                continue;
            }
            let comp = viewObj[i];
            if (comp instanceof Object && typeof comp.layerID[0] == 'number')
                qArray.push(comp.layerID[0]);
        }
        return qArray;
    }
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
    isDelete(enObj, viewObj, view, platform) {
        let psObjArray = this.pParser.getPSObjects(view, platform);
        let qObjArray = this.getQuestObjects(viewObj);
        let diff;
        diff = psObjArray.filter((x) => !qObjArray.includes(x.id));
        this.findAndHandleDeletedElements(enObj, psObjArray, diff, platform);
    }
    findAndHandleDeletedElements(enObj, psObjArray, diff, platform) {
        if (diff.length > 0) {
            const delItems = [];
            for (const psObj of psObjArray) {
                if (psObj.isView) {
                    if (this.isInQuestView(psObj.name, enObj, platform)) {
                        delItems.push(psObj);
                    }
                }
            }
            for (const item of delItems) {
                const index = psObjArray.indexOf(item);
                diff.splice(index, 1);
            }
            this.handleDeletdElements(diff);
        }
    }
    isInQuestView(viewName, enObj, platform) {
        const views = Object.keys(enObj);
        return views.includes(viewName);
    }
    isNew(layerID) {
        return (typeof (layerID) == "string");
    }
    /**
     * function to get type of a view component
     * @param compObj - curent view component object
     */
    getType(compObj) {
        return compObj.type;
    }
    handleDeletdElements(diff) {
        for (let i in diff) {
            this.result.delete['components'].push({
                "id": diff[i].id,
                "name": diff[i].name,
                "type": diff[i].type
            });
        }
    }
    /**
     * function adds the renamed elements in the result object
     * @param newName new name of the component
     * @param oldName old name of the component
     * @param type type of the component
     * @param view current view
     * @param platform current platform
     */
    handleRename(newName, oldName, elementId, type, view, platform) {
        let renamed = {};
        renamed['newName'] = newName;
        renamed['oldName'] = oldName;
        renamed['elementId'] = elementId;
        renamed = JSON.stringify(renamed);
        this.pushToResult({
            renamed,
            view,
            platform
        }, "rename", type);
    }
    /**
     * function adds the moved elements in the result object
     * @param newParent new parent of the moved component
     * @param child component moved
     * @param parent old parent of the moved component
     * @param type type of the component
     * @param view current view
     * @param platform current platform
     */
    handleMove(parent, child, childId, newParent, newParentId, type, view, platform) {
        let moveObj = {};
        moveObj["child"] = child;
        moveObj["childId"] = childId;
        moveObj["parent"] = parent;
        moveObj["newparent"] = newParent;
        moveObj["newparentId"] = newParentId;
        moveObj = JSON.stringify(moveObj);
        this.pushToResult({
            moveObj,
            view,
            platform
        }, "move", type);
    }
    pushToResult(item, action, type) {
        utils_1.utlis.addArrayKeyToObject(this.result[action], type);
        this.result[action][type].push(item);
    }
    getParentId(view, platform) {
        var _a;
        const elementalMap = this.modelFactory.getPhotoshopModel().viewElementalMap;
        const currentView = elementalMap[platform][view];
        return (_a = currentView === null || currentView === void 0 ? void 0 : currentView.base) === null || _a === void 0 ? void 0 : _a.id;
    }
    startCreation() {
        const creationObj = FactoryClass_1.inject({ ref: Creation_1.Creation, dep: [ModelFactory_1.ModelFactory] });
        FactoryClass_1.execute(creationObj, { storage: {
                result: this.result,
                pFactory: this.pFactory,
                qAssets: this.qAssetsPath
            }, generator: this.generator, activeDocument: this.activeDocument, docEmitter: this.docEmitter });
    }
}
exports.CreateImport = CreateImport;
//# sourceMappingURL=CreateImport.js.map