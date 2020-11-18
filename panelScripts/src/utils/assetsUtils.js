"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFiles = exports.getAllDirectories = void 0;
var fs = require("fs");
function getAllDirectories(source) {
    return fs.readdirSync(source, { withFileTypes: true }).filter(function (dir) { return dir.isDirectory(); }).map(function (dir) { return dir.name; });
}
exports.getAllDirectories = getAllDirectories;
function getAllFiles(source) {
    return fs.readdirSync(source, { withFileTypes: true }).filter(function (dir) { return dir.isFile(); }).map(function (dir) { return dir.name; });
}
exports.getAllFiles = getAllFiles;
//# sourceMappingURL=assetsUtils.js.map