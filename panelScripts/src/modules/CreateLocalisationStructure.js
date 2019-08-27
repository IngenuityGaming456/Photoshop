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
var languagesStruct = require("../res/languages");
var CreateLocalisationStructure = /** @class */ (function () {
    function CreateLocalisationStructure() {
    }
    CreateLocalisationStructure.prototype.execute = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this._generator = params.generator;
                        this._activeDocument = params.activeDocument;
                        _a = this.getParents;
                        return [4 /*yield*/, this.findSelectedLayers()];
                    case 1:
                        _a.apply(this, [_b.sent()]);
                        return [2 /*return*/];
                }
            });
        });
    };
    CreateLocalisationStructure.prototype.findSelectedLayers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var selectedIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/SelectedLayersIds.jsx"))];
                    case 1:
                        selectedIds = _a.sent();
                        return [2 /*return*/, selectedIds.toString().split(",")];
                }
            });
        });
    };
    CreateLocalisationStructure.prototype.getParents = function (idsArray) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var idsMap;
            return __generator(this, function (_a) {
                idsMap = new Map();
                idsArray.forEach(function (item) {
                    var parents = [];
                    _this.getParentStack(null, _this._activeDocument.layers.layers, Number(item), parents);
                    idsMap.set(Number(item), parents);
                });
                this.drawLayers(idsMap);
                return [2 /*return*/];
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
            else {
                if (item.id === id) {
                    return true;
                }
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
            var idsMapKeys, idsMapValues, langId, params;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        idsMapKeys = __spread(idsMap.keys());
                        idsMapValues = __spread(idsMap.values());
                        langId = this.findLanguageId(idsMapValues);
                        this.filterMapValues(idsMapValues);
                        params = {
                            languages: languagesStruct.languages,
                            ids: idsMapKeys,
                            values: idsMapValues,
                            langId: langId
                        };
                        this._generator.emit("localisation", idsMapKeys);
                        return [4 /*yield*/, this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/ShowPanel.jsx"), params)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
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
        var parentRef = docLayers.findLayer(parent.id);
        var languagesRef = parentRef.layer.layers.find(function (item) {
            if (item.name === "languages") {
                return true;
            }
        });
        return languagesRef.id;
    };
    CreateLocalisationStructure.prototype.filterMapValues = function (filterArray) {
        filterArray.forEach(function (item) {
            var keyIndex;
            item.forEach(function (key, index) {
                if (key.name === "common") {
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