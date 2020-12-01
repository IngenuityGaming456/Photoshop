"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editObj = exports.edit = exports.meterEdit = exports.imageEdit = exports.buttonEdit = void 0;
const utils_1 = require("../../utils/utils");
function buttonEdit(compObj, psObj, viewObj, view, platform, result) {
    const frameIds = [...compObj.layerID];
    frameIds.splice(0, 1);
    const frames = compObj.frames;
    let index = 0;
    for (let frame in frames) {
        if (!frames.hasOwnProperty(frame)) {
            continue;
        }
        const questComp = convertButtonFramesToQuestComp(frames[frame], frameIds[index], compObj);
        edit(questComp, psObj, viewObj, view, platform, result);
        index++;
    }
}
exports.buttonEdit = buttonEdit;
function convertButtonFramesToQuestComp(frame, frameID, buttonObj) {
    return Object.assign(Object.assign({}, convertToQuest(buttonObj, frameID)), { type: "image", image: frame });
}
function imageEdit(compObj, psObj, viewObj, view, platform, result) {
    edit(compObj, psObj, viewObj, view, platform, result);
}
exports.imageEdit = imageEdit;
function meterEdit(compObj, psObj, viewObj, view, platform, result) {
    const labelID = compObj.layerID[1];
    const qComp = convertLabelToQuestComp(compObj, labelID);
    edit(qComp, psObj, viewObj, view, platform, result);
}
exports.meterEdit = meterEdit;
function convertLabelToQuestComp(compObj, layerID) {
    return Object.assign(Object.assign({}, convertToQuest(compObj, layerID)), { type: "label" });
}
function edit(compObj, pParser, viewObj, view, platform, result) {
    var _a, _b;
    let parent = compObj.parent ? compObj.parent : "";
    let tempParent = { "x": 0, "y": 0 };
    let tempChild = {};
    if (viewObj.hasOwnProperty(parent)) {
        let eleParent = viewObj[parent];
        tempParent["x"] = eleParent.x;
        tempParent["y"] = eleParent.y;
    }
    tempChild["x"] = compObj.x;
    tempChild["y"] = compObj.y;
    tempChild["width"] = (_a = compObj.width) !== null && _a !== void 0 ? _a : compObj.w;
    tempChild["height"] = (_b = compObj.height) !== null && _b !== void 0 ? _b : compObj.h;
    let resL = pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, tempParent, tempChild, null, "editElement");
    if (resL) {
        compObj["parentX"] = tempParent["x"];
        compObj["parentY"] = tempParent["y"];
        compObj["isAssetChange"] = false;
    }
    let path = utils_1.utlis.recurFiles(`${compObj.image}`, this.qAssetsPath);
    let resA = pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, path, null, compObj.image, "editImage");
    if (resA) {
        compObj["isAssetChange"] = true;
    }
    if (resA || resL) {
        const parentId = this.getParentId(view, platform);
        handleEditElement(compObj, parentId, view, platform, result);
    }
}
exports.edit = edit;
function handleEditElement(compObj, parentId, view, platform, result) {
    utils_1.utlis.addKeyToObject(result.edit, compObj.type);
    result.edit[compObj.type].push({
        key: compObj,
        viewId: parentId,
        view,
        platform
    });
}
function convertToQuest(qObj, layerID) {
    var _a, _b;
    return {
        x: qObj.x,
        y: qObj.y,
        height: (_a = qObj.height) !== null && _a !== void 0 ? _a : qObj.h,
        width: (_b = qObj.width) !== null && _b !== void 0 ? _b : qObj.w,
        layerID: [layerID],
        parent: qObj.id
    };
}
exports.editObj = {
    "image": imageEdit,
    "button": buttonEdit,
    "meter": meterEdit
};
//# sourceMappingURL=QuestHelpers.js.map