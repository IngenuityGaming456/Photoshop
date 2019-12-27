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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var PhotoshopModel_1 = require("../../../src/models/PhotoshopModels/PhotoshopModel");
var path = require("path");
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
        return _this;
    }
    PhotoshopModelApp.prototype.execute = function (params) {
        _super.prototype.execute.call(this, params);
    };
    PhotoshopModelApp.prototype.subscribeListeners = function () {
        var _this = this;
        _super.prototype.subscribeListeners.call(this);
        this.generator.on("select", function () { return _this.getSelectedLayers(); });
    };
    PhotoshopModelApp.prototype.getSelectedLayers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var selectedLayersString;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/SelectedLayersIds.jsx"))];
                    case 1:
                        selectedLayersString = _a.sent();
                        this.selectedLayers = selectedLayersString.toString().split(",");
                        return [2 /*return*/];
                }
            });
        });
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
    Object.defineProperty(PhotoshopModelApp.prototype, "allSelectedLayers", {
        get: function () {
            return this.selectedLayers;
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
    return PhotoshopModelApp;
}(PhotoshopModel_1.PhotoshopModel));
exports.PhotoshopModelApp = PhotoshopModelApp;
//# sourceMappingURL=PhotoshopModelApp.js.map