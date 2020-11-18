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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editObj = exports.edit = exports.meterEdit = exports.imageEdit = exports.buttonEdit = void 0;
var utils_1 = require("../../utils/utils");
function buttonEdit(compObj, psObj, viewObj, view, platform, result) {
    var frameIds = __spread(compObj.layerID);
    frameIds.splice(0, 1);
    var frames = compObj.frames;
    var index = 0;
    for (var frame in frames) {
        if (!frames.hasOwnProperty(frame)) {
            continue;
        }
        var questComp = convertButtonFramesToQuestComp(frames[frame], frameIds[index], compObj);
        edit(questComp, psObj, viewObj, view, platform, result);
        index++;
    }
}
exports.buttonEdit = buttonEdit;
function convertButtonFramesToQuestComp(frame, frameID, buttonObj) {
    return __assign(__assign({}, convertToQuest(buttonObj, frameID)), { type: "image", image: frame });
}
function imageEdit(compObj, psObj, viewObj, view, platform, result) {
    edit(compObj, psObj, viewObj, view, platform, result);
}
exports.imageEdit = imageEdit;
function meterEdit(compObj, psObj, viewObj, view, platform, result) {
    var labelID = compObj.layerID[1];
    var qComp = convertLabelToQuestComp(compObj, labelID);
    edit(qComp, psObj, viewObj, view, platform, result);
}
exports.meterEdit = meterEdit;
function convertLabelToQuestComp(compObj, layerID) {
    return __assign(__assign({}, convertToQuest(compObj, layerID)), { type: "label" });
}
function edit(compObj, pParser, viewObj, view, platform, result) {
    var _a, _b;
    var parent = compObj.parent ? compObj.parent : "";
    var tempParent = { "x": 0, "y": 0 };
    var tempChild = {};
    if (viewObj.hasOwnProperty(parent)) {
        var eleParent = viewObj[parent];
        tempParent["x"] = eleParent.x;
        tempParent["y"] = eleParent.y;
    }
    tempChild["x"] = compObj.x;
    tempChild["y"] = compObj.y;
    tempChild["width"] = (_a = compObj.width) !== null && _a !== void 0 ? _a : compObj.w;
    tempChild["height"] = (_b = compObj.height) !== null && _b !== void 0 ? _b : compObj.h;
    var resL = pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, tempParent, tempChild, null, "editElement");
    if (resL) {
        compObj["parentX"] = tempParent["x"];
        compObj["parentY"] = tempParent["y"];
        compObj["isAssetChange"] = false;
    }
    var path = utils_1.utlis.recurFiles("" + compObj.image, this.qAssetsPath);
    var resA = pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, path, null, compObj.image, "editImage");
    if (resA) {
        compObj["isAssetChange"] = true;
    }
    if (resA || resL) {
        var parentId = this.getParentId(view, platform);
        handleEditElement(compObj, parentId, view, platform, result);
    }
}
exports.edit = edit;
function handleEditElement(compObj, parentId, view, platform, result) {
    utils_1.utlis.addKeyToObject(result.edit, compObj.type);
    result.edit[compObj.type].push({
        key: compObj,
        viewId: parentId,
        view: view,
        platform: platform
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