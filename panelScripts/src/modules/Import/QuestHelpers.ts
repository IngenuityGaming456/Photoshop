import {utlis} from "../../utils/utils";

export function buttonEdit(compObj, psObj, viewObj, view, platform, result) {
    const frameIds = [...compObj.layerID];
    frameIds.splice(0, 1);
    const frames = compObj.frames;
    let index = 0;
    for(let frame in frames) {
        if(!frames.hasOwnProperty(frame)) {
            continue;
        }
        const questComp = convertButtonFramesToQuestComp(frames[frame], frameIds[index], compObj);
        edit(questComp, psObj, viewObj, view, platform, result);
        index++;
    }
}

function convertButtonFramesToQuestComp(frame, frameID, buttonObj) {
    return {
        ...convertToQuest(buttonObj, frameID),
        type: "image",
        image: frame,
    }
}

export function imageEdit(compObj, psObj, viewObj, view, platform, result) {
    edit(compObj, psObj, viewObj, view, platform, result);
}

export function meterEdit(compObj, psObj, viewObj, view, platform, result) {
    const labelID = compObj.layerID[1];
    const qComp = convertLabelToQuestComp(compObj, labelID);
    edit(qComp, psObj, viewObj, view, platform, result);
}

function convertLabelToQuestComp(compObj, layerID) {
    return {
        ...convertToQuest(compObj, layerID),
        type: "label"
    }
}

export function edit(compObj, pParser, viewObj, view, platform, result) {
    let parent = compObj.parent ? compObj.parent:"";
    let tempParent = {"x": 0, "y": 0};
    let tempChild = {};
    if(viewObj.hasOwnProperty(parent)){
        let eleParent = viewObj[parent];
        tempParent["x"]= eleParent.x;
        tempParent["y"]= eleParent.y;
    }
    tempChild["x"]= compObj.x;
    tempChild["y"]= compObj.y;
    tempChild["width"]= compObj.width ?? compObj.w;
    tempChild["height"]= compObj.height ?? compObj.h;
    let resL = pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, tempParent, tempChild, null, "editElement");
    if(resL){
        compObj["parentX"] = tempParent["x"];
        compObj["parentY"] = tempParent["y"];
        compObj["isAssetChange"] = false;
    }
    let path = utlis.recurFiles(`${compObj.image}`, this.qAssetsPath);
    let resA = pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, path, null, compObj.image, "editImage");
    if(resA){
        compObj["isAssetChange"] = true;
    }
    if(resA || resL){
        const parentId = this.getParentId(view, platform);
        handleEditElement(compObj, parentId, view, platform, result);
    }
}

function handleEditElement(compObj, parentId ,view:string, platform:string, result):void{
    utlis.addKeyToObject(result.edit, compObj.type);
    result.edit[compObj.type].push({
        key:compObj,
        viewId: parentId,
        view,
        platform
    });
}

function convertToQuest(qObj, layerID) {
    return {
        x: qObj.x,
        y: qObj.y,
        height: qObj.height ?? qObj.h,
        width: qObj.width ?? qObj.w,
        layerID: [layerID],
        parent: qObj.id
    }
}

export const editObj = {
    "image": imageEdit,
    "button": buttonEdit,
    "meter": meterEdit
}