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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var utils_1 = require("../../utils/utils");
var constants_1 = require("../../constants");
var packageJson = require("../../../package.json");
var CreateLayoutStructure = /** @class */ (function () {
    //just for test
    function CreateLayoutStructure(modelFactory) {
        //dirty hack for test
        this.modifiedIds = [];
        this.modelFactory = modelFactory;
        this.modifiedIds = this.modelFactory.getPhotoshopModel().allModifiedIds;
        this.modifiedIds.length = 0;
    }
    CreateLayoutStructure.prototype.execute = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._generator = params.generator;
                        this._pluginId = packageJson.name;
                        this._activeDocument = params.activeDocument;
                        this.layerMap = params.storage.layerMap;
                        this.bufferMap = params.storage.bufferMap;
                        this.assetsPath = params.storage.assetsPath;
                        this.docEmitter = params.docEmitter;
                        this.emitStartStatus();
                        return [4 /*yield*/, this.upperLevelUnwantedLayers()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.restructureTempLayers()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.modifyPathNames()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.requestDocument()];
                    case 4:
                        result = _a.sent();
                        this.result = result;
                        utils_1.utlis.traverseObject(result.layers, this.filterResult.bind(this));
                        this.modifyJSON(result.layers);
                        this.modifyBottomBar(result.layers);
                        return [4 /*yield*/, this.removeUnwantedLayers()];
                    case 5:
                        _a.sent();
                        this.removeDuplicates(result.layers);
                        this.writeJSON(result);
                        this.emitStopStatus();
                        return [2 /*return*/];
                }
            });
        });
    };
    CreateLayoutStructure.prototype.emitStartStatus = function () {
        this.docEmitter.emit(constants_1.photoshopConstants.logger.logStatus, "Started generating layout");
    };
    CreateLayoutStructure.prototype.restructureTempLayers = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.restructure(constants_1.photoshopConstants.generatorButtons.symbols)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.restructure(constants_1.photoshopConstants.generatorButtons.winFrames)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.restructure(constants_1.photoshopConstants.generatorButtons.paylines)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CreateLayoutStructure.prototype.restructure = function (layerName) {
        return __awaiter(this, void 0, void 0, function () {
            var drawnQuestItems, items, items_1, items_1_1, item, structRef, structRefNestedLayers, i, e_1_1, e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        drawnQuestItems = this.modelFactory.getPhotoshopModel().allDrawnQuestItems;
                        items = drawnQuestItems.filter(function (item) {
                            if (item.name === layerName) {
                                return true;
                            }
                        });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 8, 9, 10]);
                        items_1 = __values(items), items_1_1 = items_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!items_1_1.done) return [3 /*break*/, 7];
                        item = items_1_1.value;
                        structRef = this._activeDocument.layers.findLayer(item.id);
                        if (structRef.layer.group.name === constants_1.photoshopConstants.views.baseGame) {
                            return [2 /*return*/];
                        }
                        if (!structRef.layer.layers) return [3 /*break*/, 6];
                        structRefNestedLayers = structRef.layer.layers.length;
                        i = 0;
                        _b.label = 3;
                    case 3:
                        if (!(i < structRefNestedLayers)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this._generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/addSpecialPath.jsx"), { id: structRef.layer.layers[i].layers[0].id, parentName: layerName,
                                subLayerName: structRef.layer.layers[i].name })];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6:
                        items_1_1 = items_1.next();
                        return [3 /*break*/, 2];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 10];
                    case 9:
                        try {
                            if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    CreateLayoutStructure.prototype.requestDocument = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._generator.getDocumentInfo(undefined)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    CreateLayoutStructure.prototype.filterResult = function (artLayerRef) {
        artLayerRef.name = this.applySplitter(artLayerRef.name);
        delete artLayerRef["generatorSettings"][this._pluginId];
    };
    CreateLayoutStructure.prototype.applySplitter = function (artLayerName) {
        if (~artLayerName.search(/\.(png|jpg)/)) {
            var extensionIndex = artLayerName.indexOf(".");
            var slashIndex = artLayerName.lastIndexOf("/");
            if (slashIndex > -1) {
                return artLayerName.substring(slashIndex + 1, extensionIndex);
            }
            else {
                return artLayerName.substring(0, extensionIndex);
            }
        }
        return artLayerName;
    };
    CreateLayoutStructure.prototype.writeJSON = function (result) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                fs.writeFile(this.assetsPath + ".json", JSON.stringify(result, null, "  "), function (err) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log("File successfully written");
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    CreateLayoutStructure.prototype.modifyPathNames = function () {
        return __awaiter(this, void 0, void 0, function () {
            var bufferKeys, bufferKeysCount, lastUniqueId, i, layerValue, i, layerValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bufferKeys = __spread(this.layerMap.keys());
                        this.modelFactory.getPhotoshopModel().isRenamedFromLayout = true;
                        bufferKeysCount = bufferKeys.length;
                        for (i = 0; i < bufferKeysCount; i++) {
                            layerValue = this.layerMap.get(bufferKeys[i]);
                            if (layerValue.frequency === 1) {
                                lastUniqueId = bufferKeys[i];
                            }
                        }
                        this.modelFactory.getPhotoshopModel().lastRename = lastUniqueId;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < bufferKeysCount)) return [3 /*break*/, 4];
                        layerValue = this.layerMap.get(bufferKeys[i]);
                        return [4 /*yield*/, this.handleBufferValue(layerValue, bufferKeys[i])];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CreateLayoutStructure.prototype.handleBufferValue = function (layerValue, key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(layerValue.frequency === 1)) return [3 /*break*/, 2];
                        this.modifiedIds.push(key);
                        return [4 /*yield*/, this._generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/addPath.jsx"), { id: key })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.setDuplicateMetaData(this.applySplitter(this.bufferMap.get(layerValue.buffer).parentName), key)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CreateLayoutStructure.prototype.setDuplicateMetaData = function (parentName, key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._generator.setLayerSettingsForPlugin({
                            image: parentName
                        }, key, this._pluginId + "Image")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CreateLayoutStructure.prototype.removeUnwantedLayers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var targetPath;
            return __generator(this, function (_a) {
                targetPath = this.assetsPath + "-assets";
                if (fs.existsSync(targetPath)) {
                    fs.readdirSync(targetPath).forEach(function (fileName) {
                        _this.removeFiles(targetPath + "/" + fileName);
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    CreateLayoutStructure.prototype.upperLevelUnwantedLayers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var str;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.modelFactory.getPhotoshopModel().isDeletedFromLayout = true;
                        str = "var upperLevelLayers = app.activeDocument.layers; \n                     var layersCount = upperLevelLayers.length;\n                     for(var i=0;i<layersCount;i++) {\n                          if(!~upperLevelLayers[i].name.search(/(desktop|landscape|portrait)/)) {\n                               upperLevelLayers[i].remove();\n                          }         \n                     }";
                        return [4 /*yield*/, this._generator.evaluateJSXString(str)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CreateLayoutStructure.prototype.removeFiles = function (targetPath) {
        var path = targetPath + "/" + constants_1.photoshopConstants.common;
        if (!fs.existsSync(path)) {
            return;
        }
        fs.readdirSync(path).forEach(function (fileName) {
            if (~fileName.search(/(Animation)/)) {
                utils_1.utlis.removeFile(path + "/" + fileName);
            }
        });
    };
    CreateLayoutStructure.prototype.modifyJSON = function (resultLayers) {
        var _this = this;
        resultLayers.forEach(function (item) {
            if (!item.layers) {
                return;
            }
            if (item.name === constants_1.photoshopConstants.views.freeGame) {
                var freeGameLayers = item.layers;
                var symbolRef = freeGameLayers.find(function (itemFG) {
                    if (itemFG.name === constants_1.photoshopConstants.generatorButtons.symbols) {
                        return true;
                    }
                });
                if (symbolRef) {
                    symbolRef.name += constants_1.photoshopConstants.fg;
                }
            }
            else if (item.layers) {
                _this.modifyJSON(item.layers);
            }
        });
    };
    CreateLayoutStructure.prototype.modifyBottomBar = function (resultLayers) {
        var _this = this;
        resultLayers.forEach(function (item) {
            if (item.name === constants_1.photoshopConstants.views.baseGame) {
                var freeGameLayers = item.layers;
                var symbolRef = freeGameLayers.find(function (itemFG) {
                    if (itemFG.name === constants_1.photoshopConstants.buttonsContainerBg) {
                        return true;
                    }
                });
                if (symbolRef) {
                    symbolRef.name = constants_1.photoshopConstants.buttonsContainer;
                }
            }
            else if (item.layers) {
                _this.modifyBottomBar(item.layers);
            }
        });
    };
    CreateLayoutStructure.prototype.removeDuplicates = function (layers) {
        try {
            for (var layers_1 = __values(layers), layers_1_1 = layers_1.next(); !layers_1_1.done; layers_1_1 = layers_1.next()) {
                var item = layers_1_1.value;
                if (item.name === constants_1.photoshopConstants.common) {
                    this.handleCommonLayers(item);
                    break;
                }
                if (item.layers) {
                    this.removeDuplicates(item.layers);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (layers_1_1 && !layers_1_1.done && (_a = layers_1.return)) _a.call(layers_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        var e_2, _a;
    };
    CreateLayoutStructure.prototype.handleCommonLayers = function (item) {
        var _this = this;
        var commonLayers = item.layers;
        commonLayers && commonLayers.forEach(function (view) {
            view.layers && _this.handleViewDuplicates(view.layers, null);
        });
    };
    CreateLayoutStructure.prototype.handleViewDuplicates = function (viewLayers, uiMap) {
        var _this = this;
        uiMap = uiMap || [];
        viewLayers.forEach(function (item) {
            if (item.type === "layerSection" && !(item.generatorSettings && item.generatorSettings[_this._pluginId])
                && utils_1.utlis.isNotContainer(item, _this._activeDocument, _this.result.layers, _this._pluginId)) {
                return;
            }
            if (~uiMap.indexOf(item.name)) {
                var sequence = _this.getCorrectSequence(uiMap, item.name, 1);
                uiMap.push(item.name + sequence);
                item.name = item.name + sequence;
            }
            else {
                uiMap.push(item.name);
            }
            // //Mocking a text layer as it does not have generator setting by default.
            // if(item.type === "textLayer") {
            //     utlis.putComponentInGeneratorSettings(item, this._pluginId, "label");
            //
            // }
            // if(item.type === "layerSection") {
            //     utlis.putComponentInGeneratorSettings(item, this._pluginId, "container");
            // }
            // if(item.type === "layer") {
            //     utlis.putComponentInGeneratorSettings(item, this._pluginId, "image");
            // }
            // if(item.generatorSettings && item.generatorSettings[this._pluginId]) {
            //     const genSettings = item.generatorSettings[this._pluginId].json;
            //     if(!uiMap.hasOwnProperty(genSettings)) {
            //         uiMap[genSettings] = [];
            //         uiMap[genSettings].push(item.name);
            //     } else {
            //         if(~uiMap[genSettings].indexOf(item.name)) {
            //
            //         } else {
            //             uiMap[genSettings].push(item.name);
            //         }
            //     }
            // }
            if (item.layers) {
                _this.handleViewDuplicates(item.layers, uiMap);
            }
        });
    };
    CreateLayoutStructure.prototype.getCorrectSequence = function (uiArray, name, count) {
        if (~uiArray.indexOf(name + count)) {
            return this.getCorrectSequence(uiArray, name, ++count);
        }
        else {
            return count;
        }
    };
    CreateLayoutStructure.prototype.emitStopStatus = function () {
        this.docEmitter.emit(constants_1.photoshopConstants.logger.logStatus, "Layout Generation done");
    };
    return CreateLayoutStructure;
}());
exports.CreateLayoutStructure = CreateLayoutStructure;
//# sourceMappingURL=CreateLayoutStructure.js.map