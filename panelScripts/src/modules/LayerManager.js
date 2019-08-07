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
Object.defineProperty(exports, "__esModule", { value: true });
var LayerClass = require("../../lib/dom/layer.js");
var packageJson = require("../../package.json");
var LayerManager = /** @class */ (function () {
    function LayerManager(generator, activeDocument) {
        this._generator = generator;
        this._activeDocument = activeDocument;
        this.pluginId = packageJson.name;
    }
    LayerManager.prototype.addBufferData = function (changedLayers) {
        return __awaiter(this, void 0, void 0, function () {
            var addedLayers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._generator.isPasteEvent) return [3 /*break*/, 2];
                        addedLayers = this.handlePasteEvent(changedLayers, undefined);
                        return [4 /*yield*/, this.getImageDataOfPaste(addedLayers)];
                    case 1:
                        _a.sent();
                        this._generator.isPasteEvent = false;
                        return [3 /*break*/, 3];
                    case 2:
                        this.handleImportEvent(changedLayers, undefined);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    LayerManager.prototype.handlePasteEvent = function (changedLayers, addedLayers) {
        addedLayers = addedLayers || [];
        var layersCount = changedLayers.length;
        for (var i = 0; i < layersCount; i++) {
            var change = changedLayers[i];
            if (change.hasOwnProperty("added")) {
                addedLayers.push(change);
            }
            else {
                if (change.layers) {
                    addedLayers = this.handlePasteEvent(change.layers, addedLayers);
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
        })
            .catch(function (err) { return console.log(err); });
        //bufferPromise.then(() => console.log("Buffer Added to metadata"));
        promiseArray.push(bufferPromise);
    };
    LayerManager.prototype.getImageDataOfPaste = function (layersArray) {
        return __awaiter(this, void 0, void 0, function () {
            var layersCount, i, copiedLayerRef, pastedLayerRef;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        layersCount = layersArray.length;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < layersCount)) return [3 /*break*/, 6];
                        copiedLayerRef = this.findLayerRef(this._activeDocument.layers.layers, this._generator.copiedLayers[i]);
                        if (!(copiedLayerRef instanceof LayerClass.LayerGroup)) return [3 /*break*/, 3];
                        pastedLayerRef = this.findLayerRef(this._activeDocument.layers.layers, layersArray[i].id);
                        return [4 /*yield*/, this.handleGroupPaste(copiedLayerRef, pastedLayerRef)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.setBufferOnPaste(this._activeDocument.id, this._generator.copiedLayers[i], layersArray[i].id)];
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
    LayerManager.prototype.handleGroupPaste = function (copiedLayerGroup, pastedLayerGroup) {
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
                        return [4 /*yield*/, this.handleGroupPaste(copiedLayers[i], pastedLayers[i])];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.setBufferOnPaste(this._activeDocument.id, copiedLayers[i].id, pastedLayers[i].id)];
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
    LayerManager.prototype.setBufferOnPaste = function (documentId, copyId, pasteId) {
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
        var promise = this._generator.setLayerSettingsForPlugin(bufferPayload, layerId, this.pluginId);
        LayerManager.promiseArray.push(promise);
        return promise;
    };
    LayerManager.promiseArray = [];
    return LayerManager;
}());
exports.LayerManager = LayerManager;
//# sourceMappingURL=LayerManager.js.map