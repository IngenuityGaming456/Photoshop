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
var layerClass = require("../../lib/dom/layer.js");
var path = require("path");
var utils_1 = require("../utils/utils");
var constants_1 = require("../constants");
var packageJson = require("../../package.json");
var languagesStruct = require("../res/languages");
var CreateLocalisationStructure = /** @class */ (function () {
    function CreateLocalisationStructure(modelFactory) {
        this.recordedResponse = [];
        this.modelFactory = modelFactory;
    }
    CreateLocalisationStructure.prototype.execute = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var idsArray, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this._generator = params.generator;
                        this._activeDocument = params.activeDocument;
                        this.documentManager = params.storage.documentManager;
                        this.docEmitter = params.docEmitter;
                        return [4 /*yield*/, this.updateActiveDocument()];
                    case 1:
                        _b.sent();
                        this.recordedResponse = this.modelFactory.getPhotoshopModel().allRecordedResponse;
                        _a = this.modifySelectedResponse;
                        return [4 /*yield*/, this.findSelectedLayers()];
                    case 2: return [4 /*yield*/, _a.apply(this, [_b.sent()])];
                    case 3:
                        idsArray = _b.sent();
                        this.getParents(idsArray);
                        return [2 /*return*/];
                }
            });
        });
    };
    CreateLocalisationStructure.prototype.updateActiveDocument = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.documentManager.getDocument(this._activeDocument.id)];
                    case 1:
                        _a._activeDocument = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CreateLocalisationStructure.prototype.findSelectedLayers = function () {
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
    CreateLocalisationStructure.prototype.modifySelectedResponse = function (idsArray) {
        return __awaiter(this, void 0, void 0, function () {
            var toSpliceIndexes, idsArray_1, idsArray_1_1, item, genSettings, button, e_1_1, e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        toSpliceIndexes = [];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        idsArray_1 = __values(idsArray), idsArray_1_1 = idsArray_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!idsArray_1_1.done) return [3 /*break*/, 5];
                        item = idsArray_1_1.value;
                        return [4 /*yield*/, this._generator.getLayerSettingsForPlugin(this._activeDocument.id, Number(item), packageJson.name)];
                    case 3:
                        genSettings = _b.sent();
                        if (genSettings === "button") {
                            toSpliceIndexes.push(idsArray.indexOf(item));
                            button = this._activeDocument.layers.findLayer(Number(item));
                            this.modifyIdsArray(button.layer, idsArray);
                            utils_1.utlis.spliceFromIndexes(idsArray, toSpliceIndexes);
                        }
                        _b.label = 4;
                    case 4:
                        idsArray_1_1 = idsArray_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (idsArray_1_1 && !idsArray_1_1.done && (_a = idsArray_1.return)) _a.call(idsArray_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/, idsArray];
                }
            });
        });
    };
    CreateLocalisationStructure.prototype.modifyIdsArray = function (button, idsArray) {
        button.layers.forEach(function (item) {
            if (item.layers) {
                item.layers.forEach(function (itemL) {
                    if (idsArray.indexOf(itemL.id.toString()) === -1) {
                        idsArray.push(itemL.id.toString());
                    }
                });
            }
        });
    };
    CreateLocalisationStructure.prototype.getParents = function (idsArray) {
        return __awaiter(this, void 0, void 0, function () {
            var idsMap, idsArray_2, idsArray_2_1, item, parents, e_2, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!idsArray.length) {
                            this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, "Can't Localise an empty Button");
                            return [2 /*return*/];
                        }
                        idsMap = new Map();
                        try {
                            for (idsArray_2 = __values(idsArray), idsArray_2_1 = idsArray_2.next(); !idsArray_2_1.done; idsArray_2_1 = idsArray_2.next()) {
                                item = idsArray_2_1.value;
                                parents = [];
                                this.getParentStack(null, this._activeDocument.layers.layers, Number(item), parents);
                                idsMap.set(Number(item), parents);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (idsArray_2_1 && !idsArray_2_1.done && (_a = idsArray_2.return)) _a.call(idsArray_2);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        return [4 /*yield*/, this.drawLayers(idsMap)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CreateLocalisationStructure.prototype.getParentStack = function (parent, layers, id, parentStack) {
        var _this = this;
        parentStack = parentStack || [];
        var isExist = layers.some(function (item) {
            if (item instanceof layerClass.LayerGroup) {
                return _this.getParentStack(item, item.layers, id, parentStack);
            }
            if (item.id === id) {
                return true;
            }
        });
        if (isExist && parent) {
            parentStack.push({ name: parent.name, id: parent.id });
            return true;
        }
        return false;
    };
    CreateLocalisationStructure.prototype.drawLayers = function (idsMap) {
        return __awaiter(this, void 0, void 0, function () {
            var idsMapKeys, idsMapValues, langId, localisationStructure, alreadyLocalised, params, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        idsMapKeys = __spread(idsMap.keys());
                        idsMapValues = __spread(idsMap.values());
                        langId = this.findLanguageId(idsMapValues);
                        if (!langId) {
                            return [2 /*return*/];
                        }
                        this.filterMapValues(idsMapValues);
                        localisationStructure = this.modelFactory.getPhotoshopModel().docLocalisationStruct;
                        alreadyLocalised = [];
                        this.getAlreadyLocalisedArray(idsMapKeys, localisationStructure, alreadyLocalised, null);
                        params = {
                            languages: languagesStruct.languages,
                            ids: idsMapKeys,
                            values: idsMapValues,
                            langId: langId,
                            recordedResponse: this.recordedResponse,
                            alreadyLocalised: alreadyLocalised
                        };
                        this.docEmitter.emit(constants_1.photoshopConstants.localisation, idsMapKeys);
                        return [4 /*yield*/, this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/ShowPanel.jsx"), params)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, this.handleResponse(response)];
                    case 2:
                        _a.sent();
                        response.length && this.createLocalisationStruct(idsMapKeys, idsMapValues, langId, response);
                        return [2 /*return*/];
                }
            });
        });
    };
    CreateLocalisationStructure.prototype.getAlreadyLocalisedArray = function (idsMapKeys, localisationLayers, alreadyLocalised, langName) {
        if (!localisationLayers) {
            return;
        }
        for (var item in localisationLayers) {
            if (!localisationLayers.hasOwnProperty(item)) {
                continue;
            }
            if (~languagesStruct["languages"].indexOf(item)) {
                langName = item;
            }
            if (localisationLayers[item].localise) {
                if (~idsMapKeys.indexOf(localisationLayers[item].localise)) {
                    var idKeyObj = utils_1.utlis.hasKey(alreadyLocalised, localisationLayers[item].localise);
                    if (!idKeyObj) {
                        alreadyLocalised.push((_a = {},
                            _a[localisationLayers[item].localise] = [langName],
                            _a));
                    }
                    else {
                        idKeyObj[localisationLayers[item].localise].push(langName);
                    }
                }
                return;
            }
            this.getAlreadyLocalisedArray(idsMapKeys, localisationLayers[item], alreadyLocalised, langName);
        }
        var _a;
    };
    CreateLocalisationStructure.prototype.createLocalisationStruct = function (mapKeys, mapValues, langId, response) {
        var localiseStruct = this.modelFactory.getPhotoshopModel().docLocalisationStruct || {};
        utils_1.utlis.addKeyToObject(localiseStruct, langId);
        var responseArray = response.split(":");
        responseArray.forEach(function (response) {
            utils_1.utlis.addKeyToObject(localiseStruct[langId], response.split(",")[0]);
            var responseId = localiseStruct[langId][response.split(",")[0]];
            if (response.split(",")[1] === "null") {
                return;
            }
            mapKeys.forEach(function (mapItem, index) {
                var nextAvailableIndex = utils_1.utlis.getNextAvailableIndex(responseId, index);
                responseId[nextAvailableIndex] = {};
                responseId[nextAvailableIndex]["localise"] = mapItem;
                responseId[nextAvailableIndex]["struct"] = mapValues[index];
            });
        });
        this.modelFactory.getPhotoshopModel().docLocalisationStruct = localiseStruct;
    };
    CreateLocalisationStructure.prototype.handleResponse = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            var responseArray, responseArray_1, responseArray_1_1, item, responseSubArray, e_3_1, e_3, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        responseArray = response.split(":");
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 7, 8, 9]);
                        responseArray_1 = __values(responseArray), responseArray_1_1 = responseArray_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!responseArray_1_1.done) return [3 /*break*/, 6];
                        item = responseArray_1_1.value;
                        responseSubArray = utils_1.utlis.makeResponse(item.split("-1"));
                        this.recordedResponse.push(responseSubArray[0][0]);
                        return [4 /*yield*/, this._generator.setLayerSettingsForPlugin(constants_1.photoshopConstants.generatorIds.lang, Number(responseSubArray[0][1]), packageJson.name)];
                    case 3:
                        _b.sent();
                        responseSubArray[0].splice(0, 2);
                        return [4 /*yield*/, this.handleSubResponses(responseSubArray)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        responseArray_1_1 = responseArray_1.next();
                        return [3 /*break*/, 2];
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        e_3_1 = _b.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 9];
                    case 8:
                        try {
                            if (responseArray_1_1 && !responseArray_1_1.done && (_a = responseArray_1.return)) _a.call(responseArray_1);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    CreateLocalisationStructure.prototype.handleSubResponses = function (responseSubArray) {
        return __awaiter(this, void 0, void 0, function () {
            var viewIds, buttonIds, responseLength, i, subArray;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        viewIds = [];
                        buttonIds = [];
                        responseLength = responseSubArray.length;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < responseLength)) return [3 /*break*/, 6];
                        subArray = responseSubArray[i];
                        if (!!~viewIds.indexOf(Number[subArray[0]])) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._generator.setLayerSettingsForPlugin(constants_1.photoshopConstants.generatorIds.view, Number(subArray[0]), packageJson.name)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!((i + 1) < responseLength && utils_1.utlis.isButton(subArray[i], subArray[i + 1])
                            && !~buttonIds.indexOf(Number[subArray[subArray.length - 2]]))) return [3 /*break*/, 5];
                        return [4 /*yield*/, this._generator.setLayerSettingsForPlugin(constants_1.photoshopConstants.generatorIds.button, Number(subArray[subArray.length - 2]), packageJson.name)];
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
    CreateLocalisationStructure.prototype.findLanguageId = function (idsMapValues) {
        var docLayers = this._activeDocument.layers;
        var parent = idsMapValues[0].find(function (item) {
            if (item.name.search(/(desktop|portrait|landscape)/) !== -1) {
                return true;
            }
        });
        if (!this.safeToLocalise(parent, idsMapValues)) {
            return null;
        }
        var parentRef = docLayers.findLayer(parent.id);
        var languagesRef = parentRef.layer.layers.find(function (item) {
            if (item.name === constants_1.photoshopConstants.languages) {
                return true;
            }
        });
        return languagesRef.id;
    };
    CreateLocalisationStructure.prototype.safeToLocalise = function (parent, idsMapValues) {
        if (!parent) {
            this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, "Can't Localise a container");
            return false;
        }
        var langItem = idsMapValues[0].find(function (item) {
            if (item.name.search(/(languages)/) !== -1) {
                return true;
            }
        });
        if (langItem) {
            this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, "Can't Localise an already localised layer");
            return false;
        }
        return true;
    };
    CreateLocalisationStructure.prototype.filterMapValues = function (filterArray) {
        filterArray.forEach(function (item) {
            var keyIndex;
            item.forEach(function (key, index) {
                if (key.name === constants_1.photoshopConstants.common) {
                    keyIndex = index;
                }
            });
            if (keyIndex) {
                item.splice(keyIndex);
                item.reverse();
            }
        });
    };
    return CreateLocalisationStructure;
}());
exports.CreateLocalisationStructure = CreateLocalisationStructure;
//# sourceMappingURL=CreateLocalisationStructure.js.map