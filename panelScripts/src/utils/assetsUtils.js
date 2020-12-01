"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFolderByName = exports.getAllFiles = exports.getAllDirectories = void 0;
const fs = require("fs");
function getAllDirectories(source) {
    return fs.readdirSync(source, { withFileTypes: true }).filter(dir => dir.isDirectory()).map(dir => dir.name);
}
exports.getAllDirectories = getAllDirectories;
function getAllFiles(source) {
    return fs.readdirSync(source, { withFileTypes: true }).filter(dir => dir.isFile()).map(dir => dir.name);
}
exports.getAllFiles = getAllFiles;
function getFolderByName(source, key) {
    return getAllDirectories(source).find((dir) => dir === key);
}
exports.getFolderByName = getFolderByName;
//# sourceMappingURL=assetsUtils.js.map