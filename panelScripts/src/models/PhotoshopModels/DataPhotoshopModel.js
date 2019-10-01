"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../../utils/utils");
var DataPhotoshopModel = /** @class */ (function () {
    function DataPhotoshopModel() {
    }
    DataPhotoshopModel.prototype.createElementData = function () {
        return utils_1.utlis.objectToMap(this.openDocumentData.elementalMap);
    };
    DataPhotoshopModel.prototype.execute = function (params) {
        this.openDocumentData = params.storage.openDocumentData;
    };
    return DataPhotoshopModel;
}());
exports.DataPhotoshopModel = DataPhotoshopModel;
//# sourceMappingURL=DataPhotoshopModel.js.map