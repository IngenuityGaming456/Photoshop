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
var PhotoshopModel_1 = require("../../../src/models/PhotoshopModels/PhotoshopModel");
var PhotoshopModelApp = /** @class */ (function (_super) {
    __extends(PhotoshopModelApp, _super);
    function PhotoshopModelApp() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.sessionHandler = [];
        _this.modifiedIds = [];
        _this.recordedResponse = [];
        _this.isFromLayout = false;
        _this.selectedLayers = [];
        _this.renamedFromLayout = false;
        _this.isRemovalOn = false;
        _this.lastId = null;
        return _this;
    }
    PhotoshopModelApp.prototype.execute = function (params) {
        _super.prototype.execute.call(this, params);
    };
    PhotoshopModelApp.prototype.subscribeListeners = function () {
        _super.prototype.subscribeListeners.call(this);
    };
    Object.defineProperty(PhotoshopModelApp.prototype, "allSessionHandler", {
        get: function () {
            return this.sessionHandler;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoshopModelApp.prototype, "allModifiedIds", {
        get: function () {
            return this.modifiedIds;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoshopModelApp.prototype, "allRecordedResponse", {
        get: function () {
            return this.recordedResponse;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoshopModelApp.prototype, "isDeletedFromLayout", {
        get: function () {
            return this.isFromLayout;
        },
        set: function (value) {
            this.isFromLayout = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoshopModelApp.prototype, "isRenamedFromLayout", {
        get: function () {
            return this.renamedFromLayout;
        },
        set: function (value) {
            this.renamedFromLayout = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoshopModelApp.prototype, "isRemoval", {
        get: function () {
            return this.isRemovalOn;
        },
        set: function (value) {
            this.isRemovalOn = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhotoshopModelApp.prototype, "lastRemovalId", {
        get: function () {
            return this.lastId;
        },
        set: function (value) {
            this.lastId = value;
        },
        enumerable: true,
        configurable: true
    });
    return PhotoshopModelApp;
}(PhotoshopModel_1.PhotoshopModel));
exports.PhotoshopModelApp = PhotoshopModelApp;
//# sourceMappingURL=PhotoshopModelApp.js.map