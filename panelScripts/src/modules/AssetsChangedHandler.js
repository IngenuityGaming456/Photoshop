"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils/utils");
var AssetsChangedHandler = /** @class */ (function () {
    function AssetsChangedHandler() {
    }
    AssetsChangedHandler.prototype.execute = function (params) {
        this.activeDocument = params.activeDocument;
        this.getAssetsAndJson();
    };
    AssetsChangedHandler.prototype.getAssetsAndJson = function () {
        var stats = utils_1.utlis.getAssetsAndJson("Photoshop", this.activeDocument);
        this.psAssetsPath = stats.qAssetsPath;
        this.psObj = stats.qObj;
        console.log("assets changes");
    };
    return AssetsChangedHandler;
}());
exports.AssetsChangedHandler = AssetsChangedHandler;
//# sourceMappingURL=AssetsChangedHandler.js.map