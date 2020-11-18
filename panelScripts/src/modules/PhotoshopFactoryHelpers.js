"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTextToParams = exports.addFramesToParams = exports.addImageToParams = exports.addDimensionsToParams = void 0;
var utils_1 = require("../utils/utils");
function addDimensionsToParams(jsxParams, parserObject, keys) {
    if ("x" in parserObject[keys] && "y" in parserObject[keys]) {
        var jsxDim = jsxParams["dimensions"] = {};
        jsxDim["x"] = parserObject[keys].x;
        jsxDim["y"] = parserObject[keys].y;
        jsxDim["h"] = parserObject[keys].h || parserObject[keys].height;
        jsxDim["w"] = parserObject[keys].w || parserObject[keys].width;
        jsxDim["parentX"] = parserObject[keys].parentX;
        jsxDim["parentY"] = parserObject[keys].parentY;
    }
}
exports.addDimensionsToParams = addDimensionsToParams;
function addImageToParams(jsxParams, parserObject, keys, assetsPath) {
    if (parserObject[keys].image) {
        jsxParams.image = parserObject[keys].image;
        jsxParams.file = utils_1.utlis.recurFiles(jsxParams.image, assetsPath);
    }
}
exports.addImageToParams = addImageToParams;
function addFramesToParams(jsxParams, parserObject, keys, assetsPath) {
    if (parserObject[keys].frames) {
        var jsxFrames = jsxParams["frames"] = {};
        var pObjFrames = parserObject[keys].frames;
        jsxFrames["hover"] = utils_1.utlis.recurFiles(pObjFrames["over"], assetsPath);
        jsxFrames["normal"] = utils_1.utlis.recurFiles(pObjFrames["out"], assetsPath);
        jsxFrames["down"] = utils_1.utlis.recurFiles(pObjFrames["down"], assetsPath);
        jsxFrames["disabled"] = utils_1.utlis.recurFiles(pObjFrames["disable"], assetsPath);
    }
}
exports.addFramesToParams = addFramesToParams;
function addTextToParams(jsxParams, parserObject, keys, assetsPath) {
    if (parserObject[keys].text) {
        var jsxText = jsxParams["text"] = {};
        jsxText["contents"] = parserObject[keys].text;
        jsxParams["style"] = parserObject[keys].style;
    }
}
exports.addTextToParams = addTextToParams;
//# sourceMappingURL=PhotoshopFactoryHelpers.js.map