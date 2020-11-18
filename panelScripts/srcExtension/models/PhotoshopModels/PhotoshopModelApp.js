"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoshopModelApp = void 0;
var PhotoshopModel_1 = require("../../../src/models/PhotoshopModels/PhotoshopModel");
var path = require("path");
var constants_1 = require("../../../src/constants");
var utils_1 = require("../../../src/utils/utils");
var languages = require("../../../src/res/languages.json");
var PhotoshopModelApp = /** @class */ (function (_super) {
    __extends(PhotoshopModelApp, _super);
    function PhotoshopModelApp() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.sessionHandler = [];
        _this.modifiedIds = [];
        _this.recordedResponse = [];
        _this.isFromLayout = false;
        _this.renamedFromLayout = false;
        _this.isRemovalOn = false;
        _this.lastId = null;
        _this.lastRenameId = null;
        _this.localisationStruct = null;
        _this.isAutomationOn = false;
        _this.mappedIds = [];
        return _this;
    }
    PhotoshopModelApp.prototype.execute = function (params) {
        _super.prototype.execute.call(this, params);
    };
    PhotoshopModelApp.prototype.subscribeListeners = function () {
        var _this = this;
        _super.prototype.subscribeListeners.call(this);
        this.generator.on(constants_1.photoshopConstants.generator.layersDeleted, function (eventLayers) { return _this.onLayersDeleted(eventLayers); });
        this.generator.on("select", function () { return _this.storeSelectedName(); });
        this.generator.on("select", function () { return _this.storeSelectedIds(); });
    };
    PhotoshopModelApp.prototype.onLayersDeleted = function (eventLayers) {
        var _this = this;
        var activeDocumentNonUpdated = __assign({}, this.activeDocument);
        eventLayers.forEach(function (deletedLayers) {
            var deletedRef = activeDocumentNonUpdated._layers.findLayer(deletedLayers.id);
            if (!deletedRef)
                return;
            if (utils_1.utlis.getElementName(deletedRef, constants_1.photoshopConstants.languages)) {
                var platformName = utils_1.utlis.getElementName(deletedRef, null);
                var platformRef = utils_1.utlis.getPlatformRef(platformName, _this.activeDocument);
                var commonId = utils_1.utlis.getCommonId(platformRef);
                var commonRef = _this.activeDocument.layers.findLayer(commonId);
                var mappedView = utils_1.utlis.getView(commonRef, deletedRef.layer.name);
                if (mappedView) {
                    _this.deleteMappedViewFromLocalisationStruct(mappedView, _this.localisationStruct);
                }
                else if (~languages["languages"].indexOf(deletedRef.layer.name)) {
                    _this.deletedMappedLangIdFromLocalisationStruct(deletedRef.layer.name, _this.localisationStruct);
                }
            }
        });
    };
    PhotoshopModelApp.prototype.deleteMappedViewFromLocalisationStruct = function (mappedView, localisationLayers) {
        var e_1, _a;
        for (var item in localisationLayers) {
            if (!localisationLayers.hasOwnProperty(item)) {
                continue;
            }
            var localisedStruct = localisationLayers[item];
            if (localisedStruct.struct) {
                try {
                    for (var _b = (e_1 = void 0, __values(localisedStruct.struct)), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var structLayers = _c.value;
                        if (structLayers.id === mappedView) {
                            delete localisationLayers[item];
                            break;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            else {
                this.deleteMappedViewFromLocalisationStruct(mappedView, localisedStruct);
            }
        }
    };
    PhotoshopModelApp.prototype.deletedMappedLangIdFromLocalisationStruct = function (deletedLangId, localisationLayers) {
        for (var item in localisationLayers) {
            if (!localisationLayers.hasOwnProperty(item)) {
                continue;
            }
            if (localisationLayers[item].localise) {
                return;
            }
            if (item === deletedLangId) {
                delete localisationLayers[item];
                return;
            }
            this.deletedMappedLangIdFromLocalisationStruct(deletedLangId, localisationLayers[item]);
        }
    };
    PhotoshopModelApp.prototype.handleData = function () {
        _super.prototype.handleData.call(this);
        this.localisationStruct = this.accessDocLocalisationStruct();
        this.modifiedIds = this.accessModifiedIds();
    };
    PhotoshopModelApp.prototype.accessDocLocalisationStruct = function () {
        return this.subPhotoshopModel.accessDocLocalisationStruct();
    };
    PhotoshopModelApp.prototype.accessModifiedIds = function () {
        return this.subPhotoshopModel.accessModifiedIds();
    };
    PhotoshopModelApp.prototype.storeSelectedName = function () {
        return __awaiter(this, void 0, void 0, function () {
            var selectedLayersString;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isAutomationOn) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, Promise.resolve()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/SelectedLayers.jsx"))];
                    case 2:
                        selectedLayersString = _a.sent();
                        this.selectedIdName = selectedLayersString.toString().split(",")[0];
                        return [2 /*return*/];
                }
            });
        });
    };
    PhotoshopModelApp.prototype.storeSelectedIds = function () {
        return __awaiter(this, void 0, void 0, function () {
            var selectedLayersString;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isAutomationOn) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, Promise.resolve()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/SelectedLayersIds.jsx"))];
                    case 2:
                        selectedLayersString = _a.sent();
                        this.selectedId = selectedLayersString.toString().split(",")[0];
                        return [2 /*return*/];
                }
            });
        });
    };
    PhotoshopModelApp.prototype.getWriteData = function () {
        _super.prototype.getWriteData.call(this);
        this.writeData["docLocalisationStruct"] = this.localisationStruct;
        this.writeData["modifiedIds"] = this.modifiedIds;
    };
    Object.defineProperty(PhotoshopModelApp.prototype, "selectedName", {
        get: function () {
            return this.selectedIdName;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhotoshopModelApp.prototype, "selectedNameId", {
        get: function () {
            return this.selectedId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhotoshopModelApp.prototype, "allSessionHandler", {
        get: function () {
            return this.sessionHandler;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhotoshopModelApp.prototype, "allModifiedIds", {
        get: function () {
            return this.modifiedIds;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhotoshopModelApp.prototype, "allRecordedResponse", {
        get: function () {
            return this.recordedResponse;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhotoshopModelApp.prototype, "isDeletedFromLayout", {
        get: function () {
            return this.isFromLayout;
        },
        set: function (value) {
            this.isFromLayout = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhotoshopModelApp.prototype, "isRenamedFromLayout", {
        get: function () {
            return this.renamedFromLayout;
        },
        set: function (value) {
            this.renamedFromLayout = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhotoshopModelApp.prototype, "isRemoval", {
        get: function () {
            return this.isRemovalOn;
        },
        set: function (value) {
            this.isRemovalOn = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhotoshopModelApp.prototype, "lastRemovalId", {
        get: function () {
            return this.lastId;
        },
        set: function (value) {
            this.lastId = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhotoshopModelApp.prototype, "lastRename", {
        get: function () {
            return this.lastRenameId;
        },
        set: function (value) {
            this.lastRenameId = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhotoshopModelApp.prototype, "docLocalisationStruct", {
        get: function () {
            return this.localisationStruct;
        },
        set: function (value) {
            this.localisationStruct = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhotoshopModelApp.prototype, "automationOn", {
        get: function () {
            return this.isAutomationOn;
        },
        set: function (value) {
            this.isAutomationOn = value;
        },
        enumerable: false,
        configurable: true
    });
    PhotoshopModelApp.prototype.setMappedIds = function (id) {
        this.mappedIds.push(id);
    };
    PhotoshopModelApp.prototype.getMappedIds = function () {
        return this.mappedIds;
    };
    return PhotoshopModelApp;
}(PhotoshopModel_1.PhotoshopModel));
exports.PhotoshopModelApp = PhotoshopModelApp;
//# sourceMappingURL=PhotoshopModelApp.js.map