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
var path = require("path");
var JsonComponentsFactory_1 = require("./JsonComponentsFactory");
var JsonComponents_1 = require("./JsonComponents");
var constants_1 = require("../constants");
var packageJson = require("../../package.json");
var PhotoshopFactory = /** @class */ (function () {
    function PhotoshopFactory(modelFactory) {
        this.photoshopModel = modelFactory.getPhotoshopModel();
    }
    PhotoshopFactory.prototype.execute = function (params) {
        this._generator = params.generator;
        this._pluginId = packageJson.name;
    };
    PhotoshopFactory.prototype.makeStruct = function (parserObject, insertionPoint, parentKey, platform) {
        return __awaiter(this, void 0, void 0, function () {
            var layerType, _a, _b, _i, keys, jsxParams, mappedKey;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.platform = platform;
                        _a = [];
                        for (_b in parserObject)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        keys = _a[_i];
                        jsxParams = { parentId: "", childName: "", type: "" };
                        if (!parserObject.hasOwnProperty(keys) || keys === "base") {
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
                        this.baseView = parentKey;
                        mappedKey = this.getMappedKey();
                        if (mappedKey) {
                            this.photoshopModel.automationOn = true;
                        }
                        this.platform && this.modifyJSXParams(jsxParams, mappedKey, layerType);
                        return [4 /*yield*/, this.createElementTree(jsxParams, layerType, parentKey)];
                    case 5:
                        _c.sent();
                        this.photoshopModel.automationOn = false;
                        _c.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    PhotoshopFactory.prototype.getMappedKey = function () {
        var mappedPlatform = this.photoshopModel.mappedPlatformObj;
        if (this.platform) {
            return mappedPlatform[this.platform][this.baseView]["mapping"];
        }
        return null;
    };
    PhotoshopFactory.prototype.setParams = function (jsxParams, parserObject, keys, insertionPoint) {
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
    PhotoshopFactory.prototype.createBaseChild = function (jsxParams, keys, insertionPoint, parserObject) {
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
                        return [4 /*yield*/, this.makeStruct(parserObject[keys], insertionPoint, keys, this.platform)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PhotoshopFactory.prototype.setBaseIds = function (keys, insertionPoint) {
        if (!this.platform) {
            this.photoshopModel.setPlatformMenuIds(Number(insertionPoint), keys);
        }
        else {
            this.photoshopModel.setBaseMenuIds(this.platform, Number(insertionPoint), keys);
        }
        this.photoshopModel.setDrawnQuestItems(Number(insertionPoint), keys);
    };
    PhotoshopFactory.prototype.insertBaseMetaData = function (insertionPoint) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._generator.setLayerSettingsForPlugin(constants_1.photoshopConstants.generatorIds.view, insertionPoint, this._pluginId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PhotoshopFactory.prototype.findParentId = function (childName, parentId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/parentId.jsx"), { childName: childName, parentId: parentId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    PhotoshopFactory.prototype.createBaseStruct = function (jsxParams) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/InsertLayer.jsx"), jsxParams)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    PhotoshopFactory.prototype.createElementTree = function (jsxParams, layerType, parentKey) {
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
    PhotoshopFactory.prototype.setChildIds = function (childId, jsxParams, layerType, parentKey) {
        if (!this.platform) {
            this.photoshopModel.setPlatformMenuIds(childId, jsxParams.childName);
        }
        else {
            this.photoshopModel.setChildMenuIds(this.platform, childId, jsxParams.childName, layerType, parentKey);
        }
        this.photoshopModel.setDrawnQuestItems(childId, jsxParams.childName);
    };
    PhotoshopFactory.prototype.modifyJSXParams = function (jsxParams, mappedView, layerType) {
        if (layerType === "container") {
            if (jsxParams.leaf) {
                this.setParamsMapping(jsxParams, mappedView, layerType);
            }
        }
        else {
            this.setParamsMapping(jsxParams, mappedView, layerType);
        }
    };
    PhotoshopFactory.prototype.setParamsMapping = function (jsxParams, mappedView, layerType) {
        var elementalMap = this.photoshopModel.viewElementalMap;
        for (var key in mappedView) {
            if (!mappedView.hasOwnProperty(key)) {
                continue;
            }
            var typeArray = elementalMap[key][mappedView[key]][layerType];
            var mappedLayer = typeArray.find(function (item) {
                if (item.name === jsxParams.childName) {
                    return true;
                }
            });
            if (mappedLayer) {
                jsxParams[constants_1.photoshopConstants.mappedItem] = mappedLayer;
                return;
            }
        }
    };
    return PhotoshopFactory;
}());
exports.PhotoshopFactory = PhotoshopFactory;
//# sourceMappingURL=PhotoshopFactory.js.map