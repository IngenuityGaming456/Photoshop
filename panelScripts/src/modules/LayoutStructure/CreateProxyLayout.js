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
var utils_1 = require("../../utils/utils");
var path = require("path");
var ModelFactory_1 = require("../../models/ModelFactory");
var FactoryClass_1 = require("../FactoryClass");
var CreateLayoutStructure_1 = require("./CreateLayoutStructure");
var packageJson = require("../../../package.json");
var CreateProxyLayout = /** @class */ (function () {
    function CreateProxyLayout(modelFactory) {
        this.artLayers = [];
        this.nameCache = [];
        this.errorData = [];
        this.bufferMap = new Map();
        this.modelFactory = modelFactory;
        this.errorData = this.modelFactory.getPhotoshopModel().allLayersErrorData;
    }
    CreateProxyLayout.prototype.execute = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.generator = params.generator;
                        this.docEmitter = params.docEmitter;
                        this.activeDocument = params.activeDocument;
                        this.imageState = params.storage.menuState;
                        _a = this;
                        return [4 /*yield*/, this.generator.getDocumentInfo(undefined)];
                    case 1:
                        _a.document = _b.sent();
                        return [4 /*yield*/, this.modifyParentNames()];
                    case 2:
                        _b.sent();
                        this.checkSymbols();
                        this.checkImageFolder();
                        this.checkIsLayoutSuccessful();
                        return [2 /*return*/];
                }
            });
        });
    };
    CreateProxyLayout.prototype.modifyParentNames = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        utils_1.utlis.traverseObject(this.document.layers, this.getAllArtLayers.bind(this));
                        this.artLayers.reverse();
                        return [4 /*yield*/, this.modifyPaths()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CreateProxyLayout.prototype.modifyPaths = function () {
        return __awaiter(this, void 0, void 0, function () {
            var noOfArtLayers, layerMap, keyPixmap, generatorJson, i, layerObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        noOfArtLayers = this.artLayers.length;
                        layerMap = new Map();
                        for (i = 0; i < noOfArtLayers; i++) {
                            generatorJson = this.artLayers[i].generatorSettings[packageJson.name];
                            if (!generatorJson) {
                                continue;
                            }
                            keyPixmap = JSON.parse(generatorJson.json);
                            layerObj = {
                                buffer: keyPixmap.pixels,
                                frequency: 1,
                                name: this.artLayers[i].name,
                                parentName: ""
                            };
                            layerMap.set(this.artLayers[i].id, layerObj);
                            this.bufferMap.set(layerObj.buffer, {
                                freq: 0,
                                parentName: "",
                            });
                        }
                        return [4 /*yield*/, this.getBufferFrequency(layerMap)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CreateProxyLayout.prototype.getBufferFrequency = function (layerMap) {
        return __awaiter(this, void 0, void 0, function () {
            var layerMapKeys, layerMapKeys_1, layerMapKeys_1_1, key, value, bufferObj, e_1_1, e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.layerMap = layerMap;
                        layerMapKeys = layerMap.keys();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        layerMapKeys_1 = __values(layerMapKeys), layerMapKeys_1_1 = layerMapKeys_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!layerMapKeys_1_1.done) return [3 /*break*/, 5];
                        key = layerMapKeys_1_1.value;
                        value = layerMap.get(key);
                        bufferObj = this.bufferMap.get(value.buffer);
                        bufferObj.freq++;
                        value.frequency = bufferObj.freq;
                        return [4 /*yield*/, this.modifyPathNames(value, key, bufferObj)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        layerMapKeys_1_1 = layerMapKeys_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (layerMapKeys_1_1 && !layerMapKeys_1_1.done && (_a = layerMapKeys_1.return)) _a.call(layerMapKeys_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    CreateProxyLayout.prototype.getAllArtLayers = function (artLayerRef) {
        this.artLayers.push(artLayerRef);
    };
    CreateProxyLayout.prototype.modifyPathNames = function (value, key, bufferObj) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(value.frequency === 1)) return [3 /*break*/, 2];
                        bufferObj.parentName = value.name;
                        return [4 /*yield*/, this.setToNameCache(value.name, key)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    CreateProxyLayout.prototype.setToNameCache = function (layerName, key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!~this.nameCache.indexOf(layerName)) return [3 /*break*/, 1];
                        this.nameCache.push(layerName);
                        return [3 /*break*/, 3];
                    case 1:
                        this.logError(key, layerName, "Error in name of " + layerName + " with id " + key);
                        return [4 /*yield*/, this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/addErrorPath.jsx"), { id: key })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CreateProxyLayout.prototype.checkSymbols = function () {
        utils_1.utlis.traverseBaseFreeGame(this.document.layers, this.inspectSymbols.bind(this));
    };
    CreateProxyLayout.prototype.inspectSymbols = function (viewLayer) {
        var _this = this;
        try {
            for (var _a = __values(viewLayer.layers), _b = _a.next(); !_b.done; _b = _a.next()) {
                var item = _b.value;
                if (item.name === "Symbols" && item.layers) {
                    item.layers.forEach(function (itemS) {
                        _this.checkIfStaticEmpty(itemS);
                    });
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_2) throw e_2.error; }
        }
        var e_2, _c;
    };
    CreateProxyLayout.prototype.checkIfStaticEmpty = function (item) {
        var _this = this;
        if (item.type === "layerSection") {
            item.layers.forEach(function (itemS) {
                if (itemS.name === "Static") {
                    if (!itemS.layers) {
                        _this.logError(itemS.id, itemS.name, "Symbol with name " + item.name + " has empty Static folder");
                    }
                    else {
                        _this.removeError(itemS.id);
                    }
                }
            });
        }
    };
    CreateProxyLayout.prototype.checkImageFolder = function () {
        this.assetsPath = this.getPath();
        // if(!this.isPluginEnabled()) {
        //     this.logError(1001, "", "Image Assets plugin is not on.");
        // } else {
        //     this.removeError(1001);
        // }
    };
    CreateProxyLayout.prototype.isPluginEnabled = function () {
        return this.imageState.state;
    };
    CreateProxyLayout.prototype.checkIsLayoutSuccessful = function () {
        if (!this.errorData.length) {
            this.initializeLayout();
        }
    };
    CreateProxyLayout.prototype.getPath = function () {
        var path = this.activeDocument.file;
        var extIndex = path.search(/\.(psd)/);
        return path.substring(0, extIndex);
    };
    CreateProxyLayout.prototype.initializeLayout = function () {
        var layout = FactoryClass_1.inject({ ref: CreateLayoutStructure_1.CreateLayoutStructure, dep: [ModelFactory_1.ModelFactory], isNonSingleton: true });
        FactoryClass_1.execute(layout, { storage: {
                layerMap: this.layerMap,
                bufferMap: this.bufferMap,
                assetsPath: this.assetsPath,
            }, generator: this.generator, activeDocument: this.activeDocument, docEmitter: this.docEmitter });
    };
    CreateProxyLayout.prototype.logError = function (id, name, errorType) {
        if (!utils_1.utlis.isIDExists(id, this.errorData)) {
            this.errorData.push({ id: id, name: name });
            this.docEmitter.emit("logError", id, name, errorType);
        }
    };
    CreateProxyLayout.prototype.removeError = function (id) {
        var beforeLength = this.errorData.length;
        utils_1.utlis.spliceFrom(id, this.errorData);
        var afterLength = this.errorData.length;
        if (beforeLength > afterLength) {
            this.docEmitter.emit("removeError", id);
        }
    };
    return CreateProxyLayout;
}());
exports.CreateProxyLayout = CreateProxyLayout;
//# sourceMappingURL=CreateProxyLayout.js.map