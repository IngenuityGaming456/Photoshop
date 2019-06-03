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
var DrawView = /** @class */ (function () {
    function DrawView(params, generator, menuName) {
        var _this = this;
        this._generator = generator;
        this.drawStruct(params)
            .then(function () {
            if (menuName === "AddMainView" || menuName === "AddFreeGameView") {
                _this.insertDefaultJsx();
            }
        });
    }
    DrawView.prototype.drawStruct = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _i, keys;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = [];
                        for (_b in params)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        keys = _a[_i];
                        if (!params.hasOwnProperty(keys)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.makeStruct(params[keys], null)];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, Promise.resolve()];
                }
            });
        });
    };
    DrawView.prototype.makeStruct = function (parserObject, baseKeyName) {
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
                        if (!(_i < _a.length)) return [3 /*break*/, 13];
                        keys = _a[_i];
                        jsxParams = { parentName: "", childName: "", type: "" };
                        if (!parserObject.hasOwnProperty(keys)) return [3 /*break*/, 12];
                        layerType = parserObject[keys].type;
                        jsxParams.childName = parserObject[keys].id;
                        if (!!baseKeyName) return [3 /*break*/, 4];
                        baseKeyName = keys;
                        jsxParams.childName = baseKeyName;
                        jsxParams.type = "layerSection";
                        return [4 /*yield*/, this._generator.evaluateJSXFile("C:\\Users\\hswaroop\\photoshop-scripting\\panelScripts\\refactoredJsx\\InsertLayer.jsx", jsxParams)];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, this.makeStruct(parserObject[keys], baseKeyName)];
                    case 3:
                        _c.sent();
                        return [2 /*return*/];
                    case 4:
                        jsxParams.parentName = parserObject[keys].parent ? parserObject[keys].parent : baseKeyName;
                        if (!(layerType === "image" || layerType === "shape" || layerType === "label")) return [3 /*break*/, 6];
                        jsxParams.type = "artLayer";
                        if (layerType === "label") {
                            jsxParams.subType = "text";
                        }
                        return [4 /*yield*/, this._generator.evaluateJSXFile("C:\\Users\\hswaroop\\photoshop-scripting\\panelScripts\\refactoredJsx\\InsertLayer.jsx", jsxParams)];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6:
                        if (!(layerType === "container")) return [3 /*break*/, 8];
                        jsxParams.type = "layerSection";
                        return [4 /*yield*/, this._generator.evaluateJSXFile("C:\\Users\\hswaroop\\photoshop-scripting\\panelScripts\\refactoredJsx\\InsertLayer.jsx", jsxParams)];
                    case 7:
                        _c.sent();
                        _c.label = 8;
                    case 8:
                        if (!(layerType === "button")) return [3 /*break*/, 10];
                        return [4 /*yield*/, this._generator.evaluateJSXFile("C:\\Users\\hswaroop\\photoshop-scripting\\panelScripts\\jsx\\AddButton.jsx", jsxParams)];
                    case 9:
                        _c.sent();
                        _c.label = 10;
                    case 10:
                        if (!(layerType === "animation")) return [3 /*break*/, 12];
                        return [4 /*yield*/, this._generator.evaluateJSXFile("C:\\Users\\hswaroop\\photoshop-scripting\\panelScripts\\jsx\\AddAnimation.jsx", jsxParams)];
                    case 11:
                        _c.sent();
                        _c.label = 12;
                    case 12:
                        _i++;
                        return [3 /*break*/, 1];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    DrawView.prototype.insertDefaultJsx = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    return DrawView;
}());
exports.DrawView = DrawView;
//# sourceMappingURL=DrawView.js.map