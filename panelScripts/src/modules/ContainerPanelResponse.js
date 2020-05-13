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
var constants_1 = require("../constants");
var cloneDeep = require('lodash/cloneDeep.js');
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
        this.isReady();
    };
    ContainerPanelResponse.prototype.subscribeListeners = function () {
        var _this = this;
        this.generator.on(constants_1.photoshopConstants.generator.layersDeleted, function (eventLayers) { return _this.onLayersDeleted(eventLayers); });
        this.docEmitter.on(constants_1.photoshopConstants.emitter.handleSocketResponse, function (type) { return _this.getDataForChanges(type); });
        this.docEmitter.on(constants_1.photoshopConstants.logger.getUpdatedHTMLSocket, function (socket) { return _this.onSocketUpdate(socket); });
        this.docEmitter.on(constants_1.photoshopConstants.logger.destroy, function () { return _this.onDestroy(); });
        this.docEmitter.on(constants_1.photoshopConstants.logger.newDocument, function () { return _this.onNewDocument(); });
        this.docEmitter.on(constants_1.photoshopConstants.logger.currentDocument, function () { return _this.onCurrentDocument(); });
    };
    ContainerPanelResponse.prototype.isReady = function () {
        this.docEmitter.emit(constants_1.photoshopConstants.logger.containerPanelReady);
    };
    ContainerPanelResponse.prototype.onSocketUpdate = function (socket) {
        this.socket = socket;
    };
    ContainerPanelResponse.prototype.onLayersDeleted = function (eventLayers) {
        return __awaiter(this, void 0, void 0, function () {
            var activeDocumentCopy, questArray, eventLayers_1, eventLayers_1_1, item, element, elementView, elementPlatform, e_1_1, e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        activeDocumentCopy = cloneDeep(this.activeDocument);
                        if (this.modelFactory.getPhotoshopModel().isDeletedFromLayout) {
                            this.modelFactory.getPhotoshopModel().isDeletedFromLayout = false;
                            return [2 /*return*/];
                        }
                        questArray = this.modelFactory.getPhotoshopModel().allDrawnQuestItems;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        eventLayers_1 = __values(eventLayers), eventLayers_1_1 = eventLayers_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!eventLayers_1_1.done) return [3 /*break*/, 5];
                        item = eventLayers_1_1.value;
                        if (!item.removed) return [3 /*break*/, 4];
                        element = utils_1.utlis.isIDExists(item.id, questArray);
                        if (!element) return [3 /*break*/, 4];
                        elementView = utils_1.utlis.getElementView(element, activeDocumentCopy._layers);
                        elementPlatform = utils_1.utlis.getElementPlatform(element, activeDocumentCopy._layers);
                        return [4 /*yield*/, this.sendResponseToPanel(elementView, elementPlatform, element.name)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        eventLayers_1_1 = eventLayers_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (eventLayers_1_1 && !eventLayers_1_1.done && (_a = eventLayers_1.return)) _a.call(eventLayers_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8:
                        utils_1.utlis.handleModelData(eventLayers, questArray, this.modelFactory.getPhotoshopModel().viewElementalMap, this.deletionHandler);
                        return [2 /*return*/];
                }
            });
        });
    };
    ContainerPanelResponse.prototype.sendResponseToPanel = function (elementView, elementPlatform, elementName) {
        var _this = this;
        return new Promise(function (resolve) {
            var eventNames = _this.socket.eventNames();
            if (~eventNames.indexOf("uncheckFinished")) {
                _this.socket.removeAllListeners("uncheckFinished");
            }
            _this.socket.on("uncheckFinished", function () { return resolve(); });
            _this.socket.emit(constants_1.photoshopConstants.socket.uncheckFromContainerPanel, elementPlatform, elementView, elementName);
        });
    };
    ContainerPanelResponse.prototype.getDataForChanges = function (type) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var previousResponse, currentResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        previousResponse = this.modelFactory.getPhotoshopModel().previousContainerResponse(type);
                        currentResponse = this.modelFactory.getPhotoshopModel().currentContainerResponse(type);
                        if (!previousResponse) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getChanges(previousResponse, currentResponse)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.construct(currentResponse)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        setTimeout(function () { return _this.resetMappedIds(); }, 0);
                        return [2 /*return*/];
                }
            });
        });
    };
    ContainerPanelResponse.prototype.construct = function (currentResponse) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, platform, viewObj, _c, _d, _i, view, e_2_1, e_2, _e;
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
                        e_2_1 = _f.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 11];
                    case 10:
                        try {
                            if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
                        }
                        finally { if (e_2) throw e_2.error; }
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
                        platformRef = utils_1.utlis.getPlatformRef(platform, this.activeDocument);
                        commonId = utils_1.utlis.getCommonId(platformRef);
                        return [4 /*yield*/, this.photoshopFactory.makeStruct(viewJson, commonId, null, platform)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ContainerPanelResponse.prototype.getChanges = function (previousResponseMap, responseMap) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, platform, e_3_1, e_3, _c;
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
                        e_3_1 = _d.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_3) throw e_3.error; }
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
                        previousBaseChild = previousJson && previousJson[Object.keys(previousJson)[0]];
                        currentBaseChild = currentJson && currentJson[Object.keys(currentJson)[0]];
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
                    case 0: return [4 /*yield*/, this.photoshopFactory.makeStruct((_a = {}, _a[key] = currentObj, _a), this.getParentId(baseKey, platform), baseKey, platform)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ContainerPanelResponse.prototype.getParentId = function (baseKey, platform) {
        var elementalMap = this.modelFactory.getPhotoshopModel().viewElementalMap;
        var view = elementalMap[platform][baseKey];
        return view.base.id;
    };
    ContainerPanelResponse.prototype.applyStartingLogs = function (keys) {
        this.docEmitter.emit(constants_1.photoshopConstants.logger.logStatus, "Started making " + keys);
    };
    ContainerPanelResponse.prototype.applyEndingLogs = function (keys) {
        this.docEmitter.emit(constants_1.photoshopConstants.logger.logStatus, keys + " done");
    };
    ContainerPanelResponse.prototype.onDestroy = function () {
        this.socket.emit(constants_1.photoshopConstants.logger.destroy);
    };
    ContainerPanelResponse.prototype.onNewDocument = function () {
        this.socket.emit(constants_1.photoshopConstants.socket.disablePage);
    };
    ContainerPanelResponse.prototype.onCurrentDocument = function () {
        this.socket.emit(constants_1.photoshopConstants.socket.enablePage);
    };
    ContainerPanelResponse.prototype.resetMappedIds = function () {
        var mappedIds = this.modelFactory.getPhotoshopModel().getMappedIds();
        mappedIds.length = 0;
    };
    return ContainerPanelResponse;
}());
exports.ContainerPanelResponse = ContainerPanelResponse;
//# sourceMappingURL=ContainerPanelResponse.js.map