"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allViewDispatch = exports.allCommonDispatch = exports.upperDispatch = exports.getAllFiles = exports.getAllDirectories = void 0;
const fs = require("fs");
function getAllDirectories(source) {
    return fs.readdirSync(source, { withFileTypes: true }).filter(dir => dir.isDirectory()).map(dir => dir.name);
}
exports.getAllDirectories = getAllDirectories;
function getAllFiles(source) {
    return fs.readdirSync(source, { withFileTypes: true }).filter(dir => dir.isFile()).map(dir => dir.name);
}
exports.getAllFiles = getAllFiles;
function upperDispatch(artLayers, fileName, allArtLayers) {
    var _a;
    for (let key in artLayers) {
        if (key === "common") {
            const viewsObj = artLayers[key];
            for (let view in viewsObj) {
                const fileChangeArr = (_a = viewsObj[view]) === null || _a === void 0 ? void 0 : _a[fileName];
                if (fileChangeArr) {
                    allArtLayers.push(...fileChangeArr);
                }
            }
        }
        else {
            upperDispatch(artLayers[key], fileName, allArtLayers);
        }
    }
}
exports.upperDispatch = upperDispatch;
function allCommonDispatch(artLayers, platform, fileName, allArtLayers) {
    return upperDispatch(artLayers[platform], fileName, allArtLayers);
}
exports.allCommonDispatch = allCommonDispatch;
function allViewDispatch(artLayers, platform, key, view, fileName, allArtLayers) {
    allArtLayers.push(...artLayers[platform][key][view][fileName]);
}
exports.allViewDispatch = allViewDispatch;
//# sourceMappingURL=assetsUtils.js.map