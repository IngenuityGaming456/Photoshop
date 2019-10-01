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
var JsonComponentsFactory_1 = require("./JsonComponentsFactory");
var JsonComponents_1 = require("./JsonComponents");
var path = require("path");
var CreateViewClasses_1 = require("./CreateViewClasses");
var packageJson = require("../../package.json");
var CreateViewStructure = /** @class */ (function () {
    function CreateViewStructure(viewClass, modelFactory) {
        this._viewClass = viewClass;
        this.modelFactory = modelFactory;
    }
    CreateViewStructure.prototype.execute = function (params) {
        this._pluginId = packageJson.name;
        this._generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.currentMenu = params.menuName;
        this.photoshopModel = this.modelFactory.getPhotoshopModel();
        this._element = this.getElementMap().get(params.menuName);
        this.subscribeListeners();
        this.drawStruct(this._element);
    };
    CreateViewStructure.prototype.subscribeListeners = function () {
        var _this = this;
        this._generator.on("drawAddedStruct", function (parentId, parserObj, baseKey) {
            _this.makeStruct(parserObj, parentId, baseKey);
        });
        this._generator.on("deleteStruct", function (deletionId) { _this.onDeletion(deletionId); });
    };
    CreateViewStructure.prototype.getElementMap = function () {
        if (this._viewClass instanceof CreateViewClasses_1.CreatePlatform) {
            return this.modelFactory.getMappingModel().getPlatformMap();
        }
        if (this._viewClass instanceof CreateViewClasses_1.CreateView) {
            return this.modelFactory.getMappingModel().getViewMap();
        }
    };
    CreateViewStructure.prototype.drawStruct = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var insertionPoint, _a, _b, _i, keys;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this._viewClass.shouldDrawStruct(this._generator)];
                    case 1:
                        insertionPoint = _c.sent();
                        if (!(insertionPoint !== "invalid")) return [3 /*break*/, 5];
                        this.platform = this.getPlatform(insertionPoint);
                        this.emitValidCalls();
                        _a = [];
                        for (_b in params)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        keys = _a[_i];
                        if (!params.hasOwnProperty(keys)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.makeStruct(params[keys], insertionPoint, null)];
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
    CreateViewStructure.prototype.getPlatform = function (insertionPoint) {
        if (!insertionPoint) {
            return null;
        }
        else {
            var activeDocumentLayers = this.activeDocument.layers;
            var insertionRef = activeDocumentLayers.findLayer(Number(insertionPoint));
            return insertionRef.layer.group.name;
        }
    };
    CreateViewStructure.prototype.emitValidCalls = function () {
        this._generator.emit("validEntryStruct", this.currentMenu, this.platform);
    };
    CreateViewStructure.prototype.makeStruct = function (parserObject, insertionPoint, parentKey) {
        return __awaiter(this, void 0, void 0, function () {
            var layerType, _a, _b, _i, keys, jsxParams;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = [];
                        for (_b in parserObject)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        keys = _a[_i];
                        jsxParams = { parentId: "", childName: "", type: "" };
                        if (!parserObject.hasOwnProperty(keys)) {
                            return [3 /*break*/, 6];
                        }
                        layerType = parserObject[keys].type;
                        return [4 /*yield*/, this.setParams(jsxParams, parserObject, keys, insertionPoint)];
                    case 2:
                        _c.sent();
                        if (!(!layerType && !jsxParams.childName)) return [3 /*break*/, 4];
                        this.baseView = keys;
                        return [4 /*yield*/, this.createBaseChild(jsxParams, keys, insertionPoint, parserObject)];
                    case 3:
                        _c.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        this.platform && this.modifyJSXParams(jsxParams, this.getMappedKey(), layerType);
                        return [4 /*yield*/, this.createElementTree(jsxParams, layerType, parentKey)];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    CreateViewStructure.prototype.getMappedKey = function () {
        var mappedPlatform = this.photoshopModel.mappedPlatformObj;
        if (this.platform) {
            return mappedPlatform[this.platform][this.baseView]["mapping"];
        }
        return null;
    };
    CreateViewStructure.prototype.setParams = function (jsxParams, parserObject, keys, insertionPoint) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        jsxParams.leaf = parserObject[keys].leaf;
                        jsxParams.childName = parserObject[keys].id;
                        _a = jsxParams;
                        if (!parserObject[keys].parent) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.findParentId(parserObject[keys].parent, insertionPoint)];
                    case 1:
                        _b = _c.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _b = insertionPoint;
                        _c.label = 3;
                    case 3:
                        _a.parentId = _b;
                        return [2 /*return*/];
                }
            });
        });
    };
    CreateViewStructure.prototype.createBaseChild = function (jsxParams, keys, insertionPoint, parserObject) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jsxParams.childName = keys;
                        jsxParams.type = "layerSection";
                        return [4 /*yield*/, this.createBaseStruct(jsxParams)];
                    case 1:
                        insertionPoint = _a.sent();
                        this.setBaseIds(keys, insertionPoint);
                        return [4 /*yield*/, this.insertBaseMetaData(insertionPoint)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.makeStruct(parserObject[keys], insertionPoint, keys)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CreateViewStructure.prototype.setBaseIds = function (keys, insertionPoint) {
        if (!this.platform) {
            this.photoshopModel.setPlatformMenuIds(Number(insertionPoint), keys);
        }
        else {
            this.photoshopModel.setBaseMenuIds(this.platform, Number(insertionPoint), keys);
        }
        this.photoshopModel.setDrawnQuestItems(Number(insertionPoint), keys);
    };
    CreateViewStructure.prototype.insertBaseMetaData = function (insertionPoint) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._generator.setLayerSettingsForPlugin("view", insertionPoint, this._pluginId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CreateViewStructure.prototype.findParentId = function (childName, parentId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/parentId.jsx"), { childName: childName, parentId: parentId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    CreateViewStructure.prototype.createBaseStruct = function (jsxParams) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/InsertLayer.jsx"), jsxParams)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    CreateViewStructure.prototype.createElementTree = function (jsxParams, layerType, parentKey) {
        return __awaiter(this, void 0, void 0, function () {
            var jsonMap, element, childId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jsonMap = JsonComponentsFactory_1.JsonComponentsFactory.makeJsonComponentsMap();
                        element = jsonMap.get(layerType);
                        if (!(element instanceof JsonComponents_1.PhotoshopJsonComponent)) return [3 /*break*/, 2];
                        jsxParams.type = element.getType();
                        jsxParams.subType = element.getSubType();
                        return [4 /*yield*/, element.setJsx(this._generator, jsxParams)];
                    case 1:
                        childId = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!(element instanceof JsonComponents_1.QuestJsonComponent)) return [3 /*break*/, 4];
                        return [4 /*yield*/, element.setJsx(this._generator, jsxParams)];
                    case 3:
                        childId = _a.sent();
                        _a.label = 4;
                    case 4:
                        this.setChildIds(childId, jsxParams, layerType, parentKey);
                        return [2 /*return*/];
                }
            });
        });
    };
    CreateViewStructure.prototype.setChildIds = function (childId, jsxParams, layerType, parentKey) {
        if (!this.platform) {
            this.photoshopModel.setPlatformMenuIds(childId, jsxParams.childName);
        }
        else {
            this.photoshopModel.setChildMenuIds(this.platform, childId, jsxParams.childName, layerType, parentKey);
        }
        this.photoshopModel.setDrawnQuestItems(childId, jsxParams.childName);
    };
    CreateViewStructure.prototype.onDeletion = function (deletionId) {
        this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), { id: deletionId });
    };
    CreateViewStructure.prototype.modifyJSXParams = function (jsxParams, mappedView, layerType) {
        if (layerType === "container") {
            if (jsxParams.leaf) {
                this.setParamsMapping(jsxParams, mappedView, layerType);
            }
        }
        else {
            this.setParamsMapping(jsxParams, mappedView, layerType);
        }
    };
    CreateViewStructure.prototype.setParamsMapping = function (jsxParams, mappedView, layerType) {
        var elementalMap = this.photoshopModel.viewElementalMap;
        for (var key in mappedView) {
            if (!mappedView.hasOwnProperty(key)) {
                continue;
            }
            var typeArray = elementalMap.get(key).get(mappedView[key])[layerType];
            var mappedLayer = typeArray.find(function (item) {
                if (item.name === jsxParams.childName) {
                    return true;
                }
            });
            if (mappedLayer) {
                jsxParams["mappedItem"] = mappedLayer;
                return;
            }
        }
    };
    return CreateViewStructure;
}());
exports.CreateViewStructure = CreateViewStructure;
//# sourceMappingURL=CreateViewStructure.js.map