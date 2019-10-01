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
var fs = require("fs");
var path = require("path");
var utils_1 = require("../../utils/utils");
var packageJson = require("../../../package.json");
var CreateLayoutStructure = /** @class */ (function () {
    function CreateLayoutStructure() {
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
                        this.bufferMap = params.storage.bufferMap;
                        this.unsubscribeEventListener("imageChanged");
                        return [4 /*yield*/, this.modifyPathNames()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.requestDocument()];
                    case 2:
                        result = _a.sent();
                        utils_1.utlis.traverseObject(result.layers, this.filterResult.bind(this));
                        this.writeJSON(result, this.getPath());
                        return [2 /*return*/];
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
    CreateLayoutStructure.prototype.getPath = function () {
        var path = this._activeDocument.file;
        var extIndex = path.search(/\.(psd)/);
        return path.substring(0, extIndex);
    };
    CreateLayoutStructure.prototype.unsubscribeEventListener = function (eventName) {
        var listeners = this._generator.photoshopEventListeners(eventName);
        // Just a hack, will write a very detailed code in later phase.
        CreateLayoutStructure.listenerFn = listeners[1];
        this._generator.removePhotoshopEventListener(eventName, CreateLayoutStructure.listenerFn);
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
    CreateLayoutStructure.prototype.writeJSON = function (result, modifiedPath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                fs.writeFile(modifiedPath + ".json", JSON.stringify(result, null, "  "), function (err) {
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
            var bufferKeys, bufferKeys_1, bufferKeys_1_1, key, bufferValue, e_1_1, e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        bufferKeys = this.bufferMap.keys();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        bufferKeys_1 = __values(bufferKeys), bufferKeys_1_1 = bufferKeys_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!bufferKeys_1_1.done) return [3 /*break*/, 5];
                        key = bufferKeys_1_1.value;
                        bufferValue = this.bufferMap[key];
                        return [4 /*yield*/, this.handleBufferValue(bufferValue)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        bufferKeys_1_1 = bufferKeys_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (bufferKeys_1_1 && !bufferKeys_1_1.done && (_a = bufferKeys_1.return)) _a.call(bufferKeys_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    CreateLayoutStructure.prototype.handleBufferValue = function (bufferValue) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(bufferValue.frequency === 1)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/addPath.jsx"), { id: bufferValue.id })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.setDuplicateMetaData(this.applySplitter(bufferValue.parentName), bufferValue.id)];
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
    CreateLayoutStructure.modifiedIds = [];
    return CreateLayoutStructure;
}());
exports.CreateLayoutStructure = CreateLayoutStructure;
//# sourceMappingURL=CreateLayoutStructure.js.map