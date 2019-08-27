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
var LayerManager_1 = require("./LayerManager");
var packageJson = require("../../package.json");
var CreateLayoutStructure = /** @class */ (function () {
    function CreateLayoutStructure() {
    }
    CreateLayoutStructure.prototype.execute = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this._generator = params.generator;
                        this._pluginId = packageJson.name;
                        this._activeDocument = params.activeDocument;
                        this.unsubscribeEventListener("imageChanged");
                        _a = this;
                        return [4 /*yield*/, this.requestDocument()];
                    case 1:
                        _a._document = _b.sent();
                        result = JSON.stringify(this._document, null, "  ");
                        this.writeJSON(result);
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
    CreateLayoutStructure.prototype.unsubscribeEventListener = function (eventName) {
        var listeners = this._generator.photoshopEventListeners(eventName);
        // Just a hack, will write a very detailed code in later phase.
        CreateLayoutStructure.listenerFn = listeners[1];
        this._generator.removePhotoshopEventListener(eventName, CreateLayoutStructure.listenerFn);
    };
    CreateLayoutStructure.prototype.writeJSON = function (result) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var path, extIndex, modifiedPath;
            return __generator(this, function (_a) {
                path = this._activeDocument.file;
                extIndex = path.search(/\.(psd)/);
                modifiedPath = path.substring(0, extIndex);
                Promise.all(LayerManager_1.LayerManager.promiseArray)
                    .then(function () {
                    // this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/alert.jsx"), {
                    //     message: "All layers have been pixel detailed"
                    // });
                    //dirty hack for 5th Aug demo
                    fs.writeFile(modifiedPath + ".txt", result, function (err) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            var artLayers = _this.getAllArtLayers(_this._document.layers, undefined);
                            _this.modifyPaths(artLayers);
                        }
                    });
                });
                return [2 /*return*/];
            });
        });
    };
    CreateLayoutStructure.prototype.getAllArtLayers = function (documentLayers, artLayers) {
        artLayers = artLayers || [];
        var noOfLayers = documentLayers.length;
        for (var i = 0; i < noOfLayers; i++) {
            if (documentLayers[i].type === "layer") {
                artLayers.push(documentLayers[i]);
            }
            if (documentLayers[i].type === "layerSection") {
                if (documentLayers[i].layers) {
                    artLayers = this.getAllArtLayers(documentLayers[i].layers, artLayers);
                }
            }
        }
        return artLayers;
    };
    CreateLayoutStructure.prototype.modifyPaths = function (artLayers) {
        return __awaiter(this, void 0, void 0, function () {
            var noOfArtLayers, layerMap, bufferMap, keyPixmap, generatorJson, i, layerObj;
            return __generator(this, function (_a) {
                noOfArtLayers = artLayers.length;
                layerMap = new Map();
                bufferMap = new Map();
                for (i = 0; i < noOfArtLayers; i++) {
                    if (artLayers[i].hasOwnProperty("generatorSettings")) {
                        generatorJson = artLayers[i].generatorSettings[this._pluginId];
                        if (generatorJson) {
                            keyPixmap = JSON.parse(generatorJson.json);
                        }
                    }
                    layerObj = {
                        buffer: keyPixmap.pixels,
                        frequency: 1,
                        name: artLayers[i].name
                    };
                    layerMap.set(artLayers[i].id, layerObj);
                    bufferMap.set(layerObj.buffer, 0);
                }
                //console.log("mapped");
                this.getBufferFrequency(layerMap, bufferMap);
                return [2 /*return*/];
            });
        });
    };
    CreateLayoutStructure.prototype.getBufferFrequency = function (layerMap, bufferMap) {
        layerMap.forEach(function (value, key) {
            var freq = bufferMap.get(value.buffer);
            freq++;
            value.frequency = freq;
            bufferMap.set(value.buffer, freq);
            layerMap.set(key, value);
        });
        //console.log("layerMap updated");
        this.modifyPathNames(layerMap);
    };
    CreateLayoutStructure.prototype.modifyPathNames = function (layerMap) {
        var _this = this;
        var promiseArray = [];
        layerMap.forEach(function (value, key) {
            if (value.frequency === 1) {
                CreateLayoutStructure.modifiedIds.push(key);
                promiseArray.push(_this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/addPath.jsx"), { id: key }));
            }
        });
        Promise.all(promiseArray)
            .then(function () {
            _this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/alert.jsx"), {
                message: "Export is complete"
            });
        });
    };
    CreateLayoutStructure.modifiedIds = [];
    return CreateLayoutStructure;
}());
exports.CreateLayoutStructure = CreateLayoutStructure;
//# sourceMappingURL=CreateLayoutStructure.js.map