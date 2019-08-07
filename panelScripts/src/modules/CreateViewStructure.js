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
var CreateViewStructure = /** @class */ (function () {
    function CreateViewStructure(dependencies) {
        this._viewClass = dependencies[0];
    }
    CreateViewStructure.prototype.execute = function (generator, menuName, factoryMap, activeDocument) {
        this._generator = generator;
        this._element = factoryMap.get(menuName);
        this.drawStruct(this._element);
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
                        _a = [];
                        for (_b in params)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        keys = _a[_i];
                        if (!params.hasOwnProperty(keys)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.makeStruct(params[keys], insertionPoint)];
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
    CreateViewStructure.prototype.makeStruct = function (parserObject, insertionPoint) {
        return __awaiter(this, void 0, void 0, function () {
            var layerType, _a, _b, _i, keys, jsxParams, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _a = [];
                        for (_b in parserObject)
                            _a.push(_b);
                        _i = 0;
                        _e.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 10];
                        keys = _a[_i];
                        jsxParams = { parentId: "", childName: "", type: "" };
                        if (!parserObject.hasOwnProperty(keys)) return [3 /*break*/, 9];
                        layerType = parserObject[keys].type;
                        jsxParams.childName = parserObject[keys].id;
                        _c = jsxParams;
                        if (!parserObject[keys].parent) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.findParentId(parserObject[keys].parent, insertionPoint)];
                    case 2:
                        _d = _e.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _d = insertionPoint;
                        _e.label = 4;
                    case 4:
                        _c.parentId = _d;
                        if (!(!layerType && !jsxParams.childName)) return [3 /*break*/, 7];
                        jsxParams.childName = keys;
                        jsxParams.type = "layerSection";
                        return [4 /*yield*/, this.createBaseStruct(jsxParams)];
                    case 5:
                        insertionPoint = _e.sent();
                        return [4 /*yield*/, this.makeStruct(parserObject[keys], insertionPoint)];
                    case 6:
                        _e.sent();
                        return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, this.createElementTree(jsxParams, layerType)];
                    case 8:
                        _e.sent();
                        _e.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 1];
                    case 10: return [2 /*return*/];
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
    CreateViewStructure.prototype.createElementTree = function (jsxParams, layerType) {
        return __awaiter(this, void 0, void 0, function () {
            var jsonMap, element;
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
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!(element instanceof JsonComponents_1.QuestJsonComponent)) return [3 /*break*/, 4];
                        return [4 /*yield*/, element.setJsx(this._generator, jsxParams)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return CreateViewStructure;
}());
exports.CreateViewStructure = CreateViewStructure;
//# sourceMappingURL=CreateViewStructure.js.map