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
var Restructure_1 = require("./Restructure");
var path = require("path");
var utils_1 = require("../utils/utils");
var constants_1 = require("../constants");
var packageJson = require("../../package.json");
var CreateComponent = /** @class */ (function () {
    function CreateComponent(modelFactory) {
        this.isPaste = false;
        this.executeCalls = 1;
        this.modelFactory = modelFactory;
    }
    CreateComponent.prototype.execute = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._generator = params.generator;
                        this._pluginId = packageJson.name;
                        this.docEmitter = params.docEmitter;
                        this.componentsMap = params.storage.factoryMap;
                        this.activeDocument = params.activeDocument;
                        return [4 /*yield*/, this.validate(params)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CreateComponent.prototype.validate = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var isValid, sequenceId, id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.isValid()];
                    case 1:
                        isValid = _a.sent();
                        if (!isValid) {
                            this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, "A component should always be made inside a view");
                            return [2 /*return*/, Promise.resolve()];
                        }
                        this.subscribeListeners(this.executeCalls++);
                        this.searchDocument();
                        this.elementValue = this.modelFactory.getMappingModel().getComponentsMap().get(params.menuName);
                        sequenceId = Restructure_1.Restructure.sequenceStructure(this.elementValue);
                        return [4 /*yield*/, this.callComponentJsx(sequenceId, params.menuName)];
                    case 2:
                        id = _a.sent();
                        return [4 /*yield*/, this.controlJSXReturn(id, this.elementValue)];
                    case 3:
                        _a.sent();
                        this.elementValue.elementArray.push({ id: id, sequence: sequenceId });
                        return [2 /*return*/];
                }
            });
        });
    };
    CreateComponent.prototype.isValid = function () {
        return __awaiter(this, void 0, void 0, function () {
            var selectedLayersString, selectedLayersIdArray, layers, selectedRef;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/SelectedLayersIds.jsx"))];
                    case 1:
                        selectedLayersString = _a.sent();
                        selectedLayersIdArray = selectedLayersString.toString().split(",");
                        layers = this.activeDocument.layers;
                        selectedRef = layers.findLayer(Number(selectedLayersIdArray[0]));
                        return [2 /*return*/, this.isCorrectSelection(selectedRef)];
                }
            });
        });
    };
    CreateComponent.prototype.isCorrectSelection = function (selectedRef) {
        if (!selectedRef) {
            return false;
        }
        var layerRef;
        if (selectedRef.layer) {
            layerRef = selectedRef.layer;
        }
        if (selectedRef.name) {
            layerRef = selectedRef;
        }
        if (!layerRef) {
            return false;
        }
        if (layerRef.group && layerRef.group.name && ~layerRef.group.name.search((/common/))) {
            return true;
        }
        return this.isCorrectSelection(layerRef.group);
    };
    CreateComponent.prototype.subscribeListeners = function (executeCalls) {
        var _this = this;
        if (executeCalls === 1) {
            this._generator.on(constants_1.photoshopConstants.generator.layersDeleted, function (eventLayers) { return _this.handleChange(eventLayers); });
            this._generator.on(constants_1.photoshopConstants.generator.layerRenamed, function (eventLayers) { return _this.handleChange(eventLayers); });
            this._generator.on(constants_1.photoshopConstants.generator.paste, function () { return _this.onPaste(); });
            this._generator.on(constants_1.photoshopConstants.generator.layersAdded, function (eventLayers) { return _this.onLayersAddition(eventLayers); });
        }
    };
    CreateComponent.prototype.controlJSXReturn = function (id, elementValue) {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.isID(id, elementValue)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.isBitmap(id, elementValue)];
                    case 2:
                        (_a.sent())
                            .isInvalidSpecialItem(id)
                            .isInvalidBitmap(id);
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        console.log("return controlled");
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CreateComponent.prototype.isID = function (id, elementValue) {
        return __awaiter(this, void 0, void 0, function () {
            var returnArray, returnCount, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!Number(id)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.setGeneratorSettings(id, elementValue.label.toLowerCase(), this._pluginId)];
                    case 1:
                        _a.sent();
                        this.docEmitter.emit("componentAdded", elementValue.label.toLowerCase());
                        throw new Error("Control Done");
                    case 2:
                        returnArray = id.split(",");
                        if (!(returnArray[0] && returnArray[1] && ~returnArray[1].search(/(Paylines|Symbols|WinFrames)/))) return [3 /*break*/, 6];
                        returnCount = returnArray.length;
                        i = 2;
                        _a.label = 3;
                    case 3:
                        if (!(i < returnCount)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.setGeneratorSettings(Number(returnArray[i]), elementValue.label.toLowerCase(), this._pluginId)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    CreateComponent.prototype.isBitmap = function (id, elementValue) {
        return __awaiter(this, void 0, void 0, function () {
            var returnArray;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        returnArray = id.split(",");
                        if (!Number(returnArray[0])) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.setGeneratorSettings(returnArray[0], elementValue.label.toLowerCase(), this._pluginId)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.setGeneratorSettings(returnArray[0], returnArray[1], this._pluginId + "Bitmap")];
                    case 2:
                        _a.sent();
                        throw new Error("Control Done");
                    case 3: return [2 /*return*/, this];
                }
            });
        });
    };
    CreateComponent.prototype.isInvalidSpecialItem = function (id) {
        var returnArray = id.split(",");
        if (returnArray[0] === constants_1.photoshopConstants.jsxReturn.falseType) {
            this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, "Need to select " + returnArray[1] + " from the document tree");
            throw new Error("Control Done");
        }
        return this;
    };
    CreateComponent.prototype.isInvalidBitmap = function (id) {
        var returnArray = id.split(",");
        if (returnArray[0] === constants_1.photoshopConstants.jsxReturn.bitmapType) {
            this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, "No bitmap font is found at \"others/Bitmaps\"");
            throw new Error("Control Done");
        }
        if (returnArray[0] === constants_1.photoshopConstants.jsxReturn.bitmapTypeExtra) {
            this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, "png file corresponding to bitmap is not found");
        }
    };
    CreateComponent.prototype.handleChange = function (eventLayers) {
        if (this.isPaste) {
            this.isPaste = false;
            return;
        }
        var componentsMap = this.modelFactory.getMappingModel().getComponentsMap();
        componentsMap.forEach(function (item) {
            Restructure_1.Restructure.searchAndModifyControlledArray(eventLayers, item);
        });
    };
    CreateComponent.prototype.callComponentJsx = function (sequenceId, jsxName) {
        return __awaiter(this, void 0, void 0, function () {
            var jsxPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jsxPath = path.join(__dirname, "../../jsx/" + jsxName + ".jsx");
                        return [4 /*yield*/, this._generator.evaluateJSXFile(jsxPath, { clicks: sequenceId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    CreateComponent.prototype.setGeneratorSettings = function (id, insertion, pluginId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._generator.setLayerSettingsForPlugin(insertion, id, pluginId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CreateComponent.prototype.onPaste = function () {
        this.isPaste = true;
    };
    CreateComponent.prototype.onLayersAddition = function (eventLayers) {
        if (this.isPaste) {
            utils_1.utlis.traverseAddedLayers(eventLayers, this.onAddition.bind(this));
        }
    };
    CreateComponent.prototype.onAddition = function (addedLayer) {
        var _this = this;
        this._generator.once(constants_1.photoshopConstants.generator.documentResolved, function () {
            var component = _this.isComponent(addedLayer.name);
            if (component) {
                if (_this.isInLanguage(addedLayer)) {
                    return;
                }
                var sequenceId = Restructure_1.Restructure.sequenceStructure(_this.elementValue);
                _this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/RenameErrorLayer.jsx"), {
                    id: addedLayer.id,
                    level: 1,
                    index: component.index,
                    sequence: sequenceId
                });
                _this.elementValue.elementArray.push({ id: addedLayer.id, sequence: sequenceId });
            }
        });
    };
    CreateComponent.prototype.isInLanguage = function (addedLayer) {
        var addedLayerRef = this.activeDocument.layers.findLayer(addedLayer.id);
        return !!utils_1.utlis.getElementName(addedLayerRef, constants_1.photoshopConstants.languages);
    };
    CreateComponent.prototype.isComponent = function (layerName) {
        var componentValues = this.componentsMap.values();
        try {
            for (var componentValues_1 = __values(componentValues), componentValues_1_1 = componentValues_1.next(); !componentValues_1_1.done; componentValues_1_1 = componentValues_1.next()) {
                var key = componentValues_1_1.value;
                var labelName = key.label;
                var labelIndex = layerName.search(labelName);
                if (labelIndex === 0) {
                    var sequence = layerName.substring(labelName.length);
                    if (Number(sequence)) {
                        return {
                            sequence: Number(sequence),
                            index: labelName.length
                        };
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (componentValues_1_1 && !componentValues_1_1.done && (_a = componentValues_1.return)) _a.call(componentValues_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
        var e_1, _a;
    };
    CreateComponent.prototype.searchDocument = function () {
        return __awaiter(this, void 0, void 0, function () {
            var componentValues, componentValues_2, componentValues_2_1, value, e_2, _a;
            return __generator(this, function (_b) {
                if (this.executeCalls !== 2) {
                    return [2 /*return*/];
                }
                componentValues = this.componentsMap.values();
                try {
                    for (componentValues_2 = __values(componentValues), componentValues_2_1 = componentValues_2.next(); !componentValues_2_1.done; componentValues_2_1 = componentValues_2.next()) {
                        value = componentValues_2_1.value;
                        this.searchInDocument(value, this.activeDocument.layers.layers);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (componentValues_2_1 && !componentValues_2_1.done && (_a = componentValues_2.return)) _a.call(componentValues_2);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                return [2 /*return*/];
            });
        });
    };
    CreateComponent.prototype.searchInDocument = function (value, activeLayers) {
        var layersCount = activeLayers.length;
        for (var i = 0; i < layersCount; i++) {
            var layerRef = activeLayers[i];
            var layerName = layerRef.name;
            var position = layerName.search(value.label);
            if (position === 0) {
                var sequenceId = layerName.slice(value.label.length);
                if (Number(sequenceId)) {
                    value.elementArray.push({
                        id: layerRef.id,
                        sequence: Number(sequenceId)
                    });
                }
            }
            if (layerRef.layers) {
                this.searchInDocument(value, layerRef.layers);
            }
        }
    };
    return CreateComponent;
}());
exports.CreateComponent = CreateComponent;
//# sourceMappingURL=CreateComponent.js.map