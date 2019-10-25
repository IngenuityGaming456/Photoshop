"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var PhotoshopModel_1 = require("./PhotoshopModel");
var PhotoshopChildModel = /** @class */ (function (_super) {
    __extends(PhotoshopChildModel, _super);
    function PhotoshopChildModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.sessionHandler = [];
        _this.modifiedIds = [];
        return _this;
    }
    PhotoshopChildModel.prototype.execute = function (params) {
        _super.prototype.execute.call(this, params);
    };
    Object.defineProperty(PhotoshopChildModel.prototype, "allSessionHandler", {
        get: function () {
            return this.sessionHandler;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoshopChildModel.prototype, "allModifiedIds", {
        get: function () {
            return this.modifiedIds;
        },
        enumerable: true,
        configurable: true
    });
    return PhotoshopChildModel;
}(PhotoshopModel_1.PhotoshopModel));
exports.PhotoshopChildModel = PhotoshopChildModel;
//# sourceMappingURL=PhotoshopChildModel.js.map