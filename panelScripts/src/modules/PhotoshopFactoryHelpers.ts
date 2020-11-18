import {utlis} from "../utils/utils";

export function addDimensionsToParams(jsxParams, parserObject, keys) {
    if("x" in parserObject[keys] && "y" in parserObject[keys]) {
        const jsxDim = jsxParams["dimensions"] = {};
        jsxDim["x"] = parserObject[keys].x;
        jsxDim["y"] = parserObject[keys].y;
        jsxDim["h"] = parserObject[keys].h || parserObject[keys].height;
        jsxDim["w"] = parserObject[keys].w || parserObject[keys].width;
        jsxDim["parentX"] = parserObject[keys].parentX;
        jsxDim["parentY"] = parserObject[keys].parentY;
    }
}

export function addImageToParams(jsxParams, parserObject, keys, assetsPath) {
    if(parserObject[keys].image) {
        jsxParams.image = parserObject[keys].image;
        jsxParams.file = utlis.recurFiles(jsxParams.image, assetsPath);
    }
}

export function addFramesToParams(jsxParams, parserObject, keys, assetsPath) {
    if(parserObject[keys].frames) {
        const jsxFrames = jsxParams["frames"] = {};
        const pObjFrames = parserObject[keys].frames;
        jsxFrames["hover"] = utlis.recurFiles(pObjFrames["over"], assetsPath);
        jsxFrames["normal"] = utlis.recurFiles(pObjFrames["out"], assetsPath);
        jsxFrames["down"] = utlis.recurFiles(pObjFrames["down"], assetsPath);
        jsxFrames["disabled"] = utlis.recurFiles(pObjFrames["disable"], assetsPath);
    }
}

export function addTextToParams(jsxParams, parserObject, keys, assetsPath) {
    if(parserObject[keys].text) {
        const jsxText = jsxParams["text"] = {};
        jsxText["contents"] = parserObject[keys].text;
        jsxParams["style"] = parserObject[keys].style;
    }
}