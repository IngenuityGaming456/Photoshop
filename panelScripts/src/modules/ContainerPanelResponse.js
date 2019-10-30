"use strict";
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
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils/utils");
var packageJson = require("../../package.json");
var ContainerPanelResponse = /** @class */ (function () {
    function ContainerPanelResponse(modelFactory, photoshopFactory) {
        this.platformArray = [];
        this.deletionHandler = [];
        this.modelFactory = modelFactory;
        this.photoshopFactory = photoshopFactory;
    }
    ContainerPanelResponse.prototype.execute = function (params) {
        this.platformArray = this.modelFactory.getPhotoshopModel().allQuestPlatforms;
        this.deletionHandler = this.modelFactory.getPhotoshopModel().allSessionHandler;
        this.generator = params.generator;
        this.docEmitter = params.docEmitter;
        this.activeDocument = params.activeDocument;
        this.documentManager = params.storage.documentManager;
        this.subscribeListeners();
    };
    ContainerPanelResponse.prototype.subscribeListeners = function () {
        var _this = this;
        this.generator.on("save", function () { return _this.onSave(); });
        this.generator.on("layersDeleted", function (eventLayers) { return _this.onLayersDeleted(eventLayers); });
        this.docEmitter.on("HandleSocketResponse", function () { return _this.getDataForChanges(); });
        this.docEmitter.on("getUpdatedHTMLSocket", function (socket) { return _this.onSocketUpdate(socket); });
    };
    ContainerPanelResponse.prototype.onSave = function () {
        return __awaiter(this, void 0, void 0, function () {
            var docIdObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.socket) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.generator.getDocumentSettingsForPlugin(this.activeDocument.id, packageJson.name + "Document")];
                    case 1:
                        docIdObj = _a.sent();
                        this.socket.emit("activeDocument", this.activeDocument.directory, docIdObj.docId);
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ContainerPanelResponse.prototype.onSocketUpdate = function (socket) {
        this.socket = socket;
    };
    ContainerPanelResponse.prototype.onLayersDeleted = function (eventLayers) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var questArray;
            return __generator(this, function (_a) {
                questArray = this.modelFactory.getPhotoshopModel().allDrawnQuestItems;
                eventLayers.forEach(function (item) {
                    var element = utils_1.utlis.isIDExists(item.id, questArray);
                    if (element) {
                        var elementView = utils_1.utlis.getElementView(element, _this.activeDocument.layers);
                        var elementPlatform = utils_1.utlis.getElementPlatform(element, _this.activeDocument.layers);
                        _this.socket.emit("UncheckFromContainerPanel", elementPlatform, elementView, element.name);
                    }
                });
                utils_1.utlis.handleModelData(eventLayers, questArray, this.modelFactory.getPhotoshopModel().viewElementalMap, this.deletionHandler);
                return [2 /*return*/];
            });
        });
    };
    ContainerPanelResponse.prototype.getDataForChanges = function () {
        return __awaiter(this, void 0, void 0, function () {
            var previousResponse, currentResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        previousResponse = this.modelFactory.getPhotoshopModel().previousContainerResponse;
                        currentResponse = this.modelFactory.getPhotoshopModel().currentContainerResponse;
                        if (!previousResponse) return [3 /*break*/, 1];
                        this.getChanges(previousResponse, currentResponse);
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.construct(currentResponse)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ContainerPanelResponse.prototype.construct = function (currentResponse) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, platform, viewObj, _c, _d, _i, view, e_1_1, e_1, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 9, 10, 11]);
                        _a = __values(this.platformArray), _b = _a.next();
                        _f.label = 1;
                    case 1:
                        if (!!_b.done) return [3 /*break*/, 8];
                        platform = _b.value;
                        if (!currentResponse[platform]["base"]) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.makePlatforms(platform)];
                    case 2:
                        _f.sent();
                        _f.label = 3;
                    case 3:
                        viewObj = currentResponse[platform];
                        _c = [];
                        for (_d in viewObj)
                            _c.push(_d);
                        _i = 0;
                        _f.label = 4;
                    case 4:
                        if (!(_i < _c.length)) return [3 /*break*/, 7];
                        view = _c[_i];
                        if (!viewObj.hasOwnProperty(view)) {
                            return [3 /*break*/, 6];
                        }
                        if (!(viewObj[view][view] && viewObj[view][view]["base"])) return [3 /*break*/, 6];
                        this.applyStartingLogs(view);
                        return [4 /*yield*/, this.makeViews(view, platform)];
                    case 5:
                        _f.sent();
                        this.applyEndingLogs(view);
                        _f.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7:
                        _b = _a.next();
                        return [3 /*break*/, 1];
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        e_1_1 = _f.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 11];
                    case 10:
                        try {
                            if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    ContainerPanelResponse.prototype.makePlatforms = function (platform) {
        return __awaiter(this, void 0, void 0, function () {
            var platformMap, platformJson;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        platformMap = this.modelFactory.getMappingModel().getPlatformMap();
                        platformJson = platformMap.get(platform);
                        return [4 /*yield*/, this.photoshopFactory.makeStruct(platformJson, null, null, null)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ContainerPanelResponse.prototype.makeViews = function (view, platform) {
        return __awaiter(this, void 0, void 0, function () {
            var viewMap, viewJson, platformRef, commonId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        viewMap = this.modelFactory.getMappingModel().getViewPlatformMap(platform);
                        viewJson = viewMap.get(view);
                        platformRef = this.getPlatformRef(platform);
                        commonId = this.getCommonId(platformRef);
                        return [4 /*yield*/, this.photoshopFactory.makeStruct(viewJson, commonId, null, platform)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ContainerPanelResponse.prototype.getPlatformRef = function (platform) {
        var activeLayers = this.activeDocument.layers.layers;
        try {
            for (var activeLayers_1 = __values(activeLayers), activeLayers_1_1 = activeLayers_1.next(); !activeLayers_1_1.done; activeLayers_1_1 = activeLayers_1.next()) {
                var layer = activeLayers_1_1.value;
                if (layer.name === platform) {
                    return layer;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (activeLayers_1_1 && !activeLayers_1_1.done && (_a = activeLayers_1.return)) _a.call(activeLayers_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        var e_2, _a;
    };
    ContainerPanelResponse.prototype.getCommonId = function (platformRef) {
        try {
            for (var _a = __values(platformRef.layers), _b = _a.next(); !_b.done; _b = _a.next()) {
                var layer = _b.value;
                if (layer.name === "common") {
                    return layer.id;
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_3) throw e_3.error; }
        }
        var e_3, _c;
    };
    ContainerPanelResponse.prototype.getChanges = function (previousResponseMap, responseMap) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, platform, e_4_1, e_4, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, 6, 7]);
                        _a = __values(this.platformArray), _b = _a.next();
                        _d.label = 1;
                    case 1:
                        if (!!_b.done) return [3 /*break*/, 4];
                        platform = _b.value;
                        return [4 /*yield*/, this.getPlatformChanges(platform, previousResponseMap[platform], responseMap[platform])];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        _b = _a.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_4_1 = _d.sent();
                        e_4 = { error: e_4_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_4) throw e_4.error; }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ContainerPanelResponse.prototype.getPlatformChanges = function (platform, previousPlatformView, currentPlatformView) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _i, key;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.sendPlatformJsonChanges(previousPlatformView, currentPlatformView, platform)];
                    case 1:
                        _c.sent();
                        _a = [];
                        for (_b in previousPlatformView)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        key = _a[_i];
                        if (!previousPlatformView.hasOwnProperty(key)) {
                            return [3 /*break*/, 4];
                        }
                        return [4 /*yield*/, this.sendViewJsonChanges(previousPlatformView[key], currentPlatformView[key], key, platform)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ;
    ContainerPanelResponse.prototype.sendPlatformJsonChanges = function (previousPlatformView, currentPlatformView, platform) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(currentPlatformView.base && !previousPlatformView.base)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.makePlatforms(platform)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ContainerPanelResponse.prototype.sendViewJsonChanges = function (previousJson, currentJson, key, platform) {
        return __awaiter(this, void 0, void 0, function () {
            var previousBaseChild, currentBaseChild, _a, _b, _i, keyC;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        previousBaseChild = previousJson[Object.keys(previousJson)[0]];
                        currentBaseChild = currentJson[Object.keys(currentJson)[0]];
                        if (!(currentBaseChild && currentBaseChild["base"] && previousBaseChild && !previousBaseChild["base"])) return [3 /*break*/, 2];
                        this.applyStartingLogs(key);
                        return [4 /*yield*/, this.makeViews(key, platform)];
                    case 1:
                        _c.sent();
                        this.applyEndingLogs(key);
                        return [2 /*return*/];
                    case 2:
                        _a = [];
                        for (_b in currentBaseChild)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        keyC = _a[_i];
                        if (!currentBaseChild.hasOwnProperty(keyC)) return [3 /*break*/, 5];
                        if (!!previousBaseChild[keyC]) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.sendAdditionRequest(Object.keys(previousJson)[0], currentBaseChild[keyC], keyC, platform)];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ContainerPanelResponse.prototype.sendAdditionRequest = function (baseKey, currentObj, key, platform) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.photoshopFactory.makeStruct((_a = {}, _a[key] = currentObj, _a), this.getParentId(baseKey), baseKey, platform)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ContainerPanelResponse.prototype.getParentId = function (baseKey) {
        var baseId = this.modelFactory.getPhotoshopModel().allDrawnQuestItems;
        var parent = baseId.find(function (item) {
            if (item.name === baseKey) {
                return true;
            }
        });
        if (parent) {
            return parent.id;
        }
    };
    ContainerPanelResponse.prototype.applyStartingLogs = function (keys) {
        this.docEmitter.emit("logStatus", "Started making " + keys);
    };
    ContainerPanelResponse.prototype.applyEndingLogs = function (keys) {
        this.docEmitter.emit("logStatus", keys + " done");
    };
    return ContainerPanelResponse;
}());
exports.ContainerPanelResponse = ContainerPanelResponse;
//# sourceMappingURL=ContainerPanelResponse.js.map