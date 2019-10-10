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
var path = require("path");
var LayerClass = require("../../lib/dom/layer.js");
var packageJson = require("../../package.json");
var LayerManager = /** @class */ (function () {
    function LayerManager(modelFactory) {
        this.selectedLayers = [];
        this.localisedLayers = [];
        this.copiedLayers = [];
        this.isPasteEvent = false;
        this.modelFactory = modelFactory;
    }
    LayerManager.prototype.execute = function (params) {
        this._generator = params.generator;
        this.docEmitter = params.docEmitter;
        this._activeDocument = params.activeDocument;
        this.pluginId = packageJson.name;
        this.subscribeListeners();
    };
    LayerManager.prototype.subscribeListeners = function () {
        var _this = this;
        this._generator.on("layersAdded", function (eventLayers) {
            _this.onLayersAdded(eventLayers);
        });
        this._generator.on("select", function () { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.eventName = Events.SELECT;
                        _a = this;
                        return [4 /*yield*/, this.getSelectedLayers()];
                    case 1:
                        _a.selectedLayers = _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        this._generator.on("copy", function () { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.eventName = Events.COPY;
                        _a = this;
                        return [4 /*yield*/, this.getSelectedLayers()];
                    case 1:
                        _a.copiedLayers = _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        this._generator.on("paste", function () {
            _this.eventName = Events.PASTE;
            _this.isPasteEvent = true;
        });
        this._generator.on("copyToLayer", function () {
            _this.eventName = Events.COPYTOLAYER;
        });
        this._generator.on("duplicate", function () {
            _this.eventName = Events.DUPLICATE;
            _this.isPasteEvent = true;
        });
        this.docEmitter.on("localisation", function (localisedLayers) {
            _this.localisedLayers = localisedLayers;
        });
    };
    LayerManager.prototype.onLayersAdded = function (eventLayers) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.addBufferData(eventLayers);
                return [2 /*return*/];
            });
        });
    };
    LayerManager.prototype.handleLayersAddition = function (eventLayers, questItems, deletedLayers) {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_1, this_1, eventLayers_1, eventLayers_1_1, item, state_1, e_1_1, e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _loop_1 = function (item) {
                            var inQuest;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!item.added) return [3 /*break*/, 3];
                                        inQuest = questItems.some(function (key) {
                                            if (key === item.name) {
                                                return true;
                                            }
                                        });
                                        if (!inQuest) return [3 /*break*/, 2];
                                        deletedLayers.push(item.id);
                                        this_1.docEmitter.emit("logWarning", item.name, item.id, "CopyPasteOfQuestElement");
                                        return [4 /*yield*/, this_1._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), { id: item.id })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/, { value: void 0 }];
                                    case 2: return [3 /*break*/, 4];
                                    case 3:
                                        if (item.layers) {
                                            this_1.handleLayersAddition(item.layers, questItems, deletedLayers);
                                        }
                                        _a.label = 4;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        eventLayers_1 = __values(eventLayers), eventLayers_1_1 = eventLayers_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!eventLayers_1_1.done) return [3 /*break*/, 5];
                        item = eventLayers_1_1.value;
                        return [5 /*yield**/, _loop_1(item)];
                    case 3:
                        state_1 = _b.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
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
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    LayerManager.prototype.getSelectedLayers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var selectedLayersString;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/SelectedLayersIds.jsx"))];
                    case 1:
                        selectedLayersString = _a.sent();
                        return [2 /*return*/, selectedLayersString.toString().split(",")];
                }
            });
        });
    };
    LayerManager.prototype.addBufferData = function (changedLayers) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.eventName;
                        switch (_a) {
                            case Events.COPYTOLAYER: return [3 /*break*/, 1];
                            case Events.DUPLICATE: return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 5];
                    case 1: return [4 /*yield*/, this.handleDuplicate(changedLayers, this.selectedLayers, [])];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 3: return [4 /*yield*/, this.handleDuplicateEvent(changedLayers)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.handleImportEvent(changedLayers, undefined)];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    LayerManager.prototype.handleDuplicateEvent = function (changedLayers) {
        return __awaiter(this, void 0, void 0, function () {
            var questItems, deletedLayers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isPasteEvent) return [3 /*break*/, 3];
                        questItems = this.modelFactory.getPhotoshopModel().allQuestItems;
                        deletedLayers = [];
                        return [4 /*yield*/, this.handleLayersAddition(changedLayers, questItems, deletedLayers)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.handleDuplicate(changedLayers, this.copiedLayers, deletedLayers)];
                    case 2:
                        _a.sent();
                        this.isPasteEvent = false;
                        return [2 /*return*/];
                    case 3:
                        if (!this.localisedLayers.length) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.handleDuplicate(changedLayers, this.localisedLayers, [])];
                    case 4:
                        _a.sent();
                        this.localisedLayers.splice(0, 1);
                        return [2 /*return*/];
                    case 5: return [4 /*yield*/, this.handleDuplicate(changedLayers, this.selectedLayers, [])];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    LayerManager.prototype.handleDuplicate = function (changedLayers, parentLayers, deletedLayers) {
        return __awaiter(this, void 0, void 0, function () {
            var addedLayers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        addedLayers = this.handleEvent(changedLayers, undefined);
                        return [4 /*yield*/, this.getImageDataOfEvent(addedLayers, parentLayers, deletedLayers)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    LayerManager.prototype.handleEvent = function (changedLayers, addedLayers) {
        addedLayers = addedLayers || [];
        var layersCount = changedLayers.length;
        for (var i = 0; i < layersCount; i++) {
            var change = changedLayers[i];
            if (change.hasOwnProperty("added")) {
                addedLayers.push(change);
            }
            else {
                if (change.layers) {
                    addedLayers = this.handleEvent(change.layers, addedLayers);
                }
            }
        }
        return addedLayers;
    };
    LayerManager.prototype.handleImportEvent = function (changedLayers, promiseArray) {
        promiseArray = promiseArray || [];
        var layersCount = changedLayers.length;
        for (var i = 0; i < layersCount; i++) {
            var change = changedLayers[i];
            if (change.hasOwnProperty("added") && change.type === "layer") {
                this.getImageData(change.id, promiseArray);
            }
            if (change.hasOwnProperty("layers")) {
                this.handleImportEvent(change.layers, promiseArray);
            }
        }
    };
    LayerManager.prototype.getImageData = function (layerId, promiseArray) {
        var _this = this;
        var bufferPayload = {};
        var pixMapPromise = this._generator.getPixmap(this._activeDocument.id, layerId, { scaleX: 0.5, scaleY: 0.5 });
        var bufferPromise = pixMapPromise
            .then(function (pixmap) {
            //writing layer's pixel data into it.
            //console.log("Got the pixel map");
            var pixmapBuffer = Buffer.from(pixmap.pixels);
            var cBuffer = LayerManager.compressBuffer(pixmapBuffer, pixmap.channelCount);
            var base64Pixmap = cBuffer.toString('base64');
            bufferPayload = {
                "pixels": base64Pixmap
            };
            return _this.setLayerSettings(bufferPayload, layerId);
        });
        //bufferPromise.then(() => console.log("Buffer Added to metadata"));
        promiseArray.push(bufferPromise);
    };
    LayerManager.prototype.getImageDataOfEvent = function (layersArray, parentLayers, deletedLayers) {
        return __awaiter(this, void 0, void 0, function () {
            var layersCount, i, copiedLayerRef, pastedLayerRef;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        layersCount = layersArray.length;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < layersCount)) return [3 /*break*/, 7];
                        copiedLayerRef = this.findLayerRef(this._activeDocument.layers.layers, parentLayers[i]);
                        if (!(copiedLayerRef instanceof LayerClass.LayerGroup)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.setBufferOnEvent(this._activeDocument.id, parentLayers[i], layersArray[i].id)];
                    case 2:
                        _a.sent();
                        pastedLayerRef = this.findLayerRef(this._activeDocument.layers.layers, layersArray[i].id);
                        if (~deletedLayers.indexOf(pastedLayerRef.id)) {
                            return [3 /*break*/, 6];
                        }
                        return [4 /*yield*/, this.handleGroupEvent(copiedLayerRef, pastedLayerRef)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.setBufferOnEvent(this._activeDocument.id, parentLayers[i], layersArray[i].id)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    LayerManager.prototype.getGeneratorSettings = function (parentLayerRef) {
        return parentLayerRef.generatorSettings && parentLayerRef.generatorSettings[this.pluginId];
    };
    LayerManager.prototype.handleGroupEvent = function (copiedLayerGroup, pastedLayerGroup) {
        return __awaiter(this, void 0, void 0, function () {
            var copiedLayers, pastedLayers, layersCount, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        copiedLayers = copiedLayerGroup.layers;
                        pastedLayers = pastedLayerGroup.layers;
                        layersCount = copiedLayers.length;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < layersCount)) return [3 /*break*/, 6];
                        if (!(copiedLayers[i] instanceof LayerClass.LayerGroup)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.handleGroupEvent(copiedLayers[i], pastedLayers[i])];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.setBufferOnEvent(this._activeDocument.id, copiedLayers[i].id, pastedLayers[i].id)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    LayerManager.prototype.setBufferOnEvent = function (documentId, copyId, pasteId) {
        return __awaiter(this, void 0, void 0, function () {
            var bufferPayload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._generator.getLayerSettingsForPlugin(documentId, copyId, this.pluginId)];
                    case 1:
                        bufferPayload = _a.sent();
                        return [4 /*yield*/, this.setLayerSettings(bufferPayload, pasteId)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    LayerManager.prototype.findLayerRef = function (documentLayers, layerId) {
        var _this = this;
        var layerRef;
        documentLayers.some(function (item) {
            if (item.id == layerId) {
                layerRef = item;
                return true;
            }
            if (item.layers) {
                layerRef = _this.findLayerRef(item.layers, layerId);
                if (layerRef) {
                    return true;
                }
            }
        });
        if (layerRef) {
            return layerRef;
        }
    };
    LayerManager.compressBuffer = function (buffer, channelCount) {
        var cBL = buffer.length / 2 + 1;
        var cBuffer = Buffer.alloc(cBL);
        for (var i = 0; i < buffer.length; i += channelCount) {
            cBuffer[i] = buffer[i];
            cBuffer[i + 1] = (buffer[i + 1] + buffer[i + 2] + buffer[i + 3]) / 3;
        }
        return cBuffer;
    };
    LayerManager.prototype.setLayerSettings = function (bufferPayload, layerId) {
        if (Object.keys(bufferPayload).length) {
            var promise = this._generator.setLayerSettingsForPlugin(bufferPayload, layerId, this.pluginId);
            LayerManager.promiseArray.push(promise);
            return promise;
        }
        return Promise.resolve();
    };
    LayerManager.promiseArray = [];
    return LayerManager;
}());
exports.LayerManager = LayerManager;
var Events;
(function (Events) {
    Events["DUPLICATE"] = "Dplc";
    Events["SELECT"] = "slct";
    Events["COPYTOLAYER"] = "CpTL";
    Events["COPY"] = "copy";
    Events["PASTE"] = "past";
})(Events || (Events = {}));
//# sourceMappingURL=LayerManager.js.map