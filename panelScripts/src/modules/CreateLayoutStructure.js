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
var fs = require("fs");
var path = require("path");
var packageJson = require("../../package.json");
var CreateLayoutStructure = /** @class */ (function () {
    function CreateLayoutStructure() {
        this.artLayers = [];
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
                        this.unsubscribeEventListener("imageChanged");
                        this.modifyParentNames();
                        return [4 /*yield*/, this.requestDocument()];
                    case 1:
                        result = _a.sent();
                        this.traverseObject(result.layers, this.filterResult.bind(this));
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
    CreateLayoutStructure.prototype.modifyParentNames = function () {
        this.traverseObject(this._activeDocument.layers.layers, this.getAllArtLayers.bind(this));
        this.modifyPaths();
    };
    CreateLayoutStructure.prototype.getAllArtLayers = function (artLayerRef) {
        this.artLayers.push(artLayerRef);
    };
    CreateLayoutStructure.prototype.filterResult = function (artLayerRef) {
        delete artLayerRef["generatorSettings"][this._pluginId];
    };
    CreateLayoutStructure.prototype.writeJSON = function (result, modifiedPath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                fs.writeFile(modifiedPath + ".txt", JSON.stringify(result, null, "  "), function (err) {
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
    CreateLayoutStructure.prototype.traverseObject = function (documentLayers, callback) {
        var noOfLayers = documentLayers.length;
        for (var i = 0; i < noOfLayers; i++) {
            if (documentLayers[i].type === "layer") {
                callback(documentLayers[i]);
            }
            if (documentLayers[i].type === "layerSection") {
                if (documentLayers[i].layers) {
                    this.traverseObject(documentLayers[i].layers, callback);
                }
            }
        }
    };
    CreateLayoutStructure.prototype.modifyPaths = function () {
        var noOfArtLayers = this.artLayers.length;
        var layerMap = new Map();
        var bufferMap = new Map();
        var keyPixmap, generatorJson;
        for (var i = 0; i < noOfArtLayers; i++) {
            // if(artLayers[i].hasOwnProperty("generatorSettings")) {
            generatorJson = this.artLayers[i].generatorSettings[this._pluginId];
            if (generatorJson) {
                keyPixmap = JSON.parse(generatorJson.json);
            }
            // }
            var layerObj = {
                buffer: keyPixmap.pixels,
                frequency: 1,
                name: this.artLayers[i].name
            };
            layerMap.set(this.artLayers[i].id, layerObj);
            bufferMap.set(layerObj.buffer, {
                freq: 0,
                parentName: ""
            });
        }
        //console.log("mapped");
        this.getBufferFrequency(layerMap, bufferMap);
    };
    CreateLayoutStructure.prototype.getBufferFrequency = function (layerMap, bufferMap) {
        var _this = this;
        layerMap.forEach(function (value, key) {
            var bufferObj = bufferMap.get(value.buffer);
            bufferObj.freq++;
            value.frequency = bufferObj.freq;
            _this.modifyPathNames(value, key, bufferObj);
        });
    };
    CreateLayoutStructure.prototype.modifyPathNames = function (value, key, bufferObj) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(value.frequency === 1)) return [3 /*break*/, 2];
                        bufferObj.parentName = value.name;
                        CreateLayoutStructure.modifiedIds.push(key);
                        return [4 /*yield*/, this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/addPath.jsx"), { id: key })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.setDuplicateMetaData(bufferObj.parentName, key)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
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