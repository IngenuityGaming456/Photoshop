"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsSync = void 0;
var utils_1 = require("../utils/utils");
var assetsUtils_1 = require("../utils/assetsUtils");
var path = require("path");
var fs = require("fs");
var packageJson = require("../../package.json");
var AssetsSync = /** @class */ (function () {
    function AssetsSync(modelFactory, pFactory) {
        this.artLayers = {};
        this.modelFactory = modelFactory;
        this.photoshopFactory = pFactory;
    }
    AssetsSync.prototype.execute = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.activeDocument = params.activeDocument;
                        this.generator = params.generator;
                        _a = this;
                        return [4 /*yield*/, this.generator.getDocumentInfo(undefined)];
                    case 1:
                        _a.document = _b.sent();
                        this.artLayers = {};
                        utils_1.utlis.traverseObject(this.document.layers, this.getAllArtLayers.bind(this));
                        return [4 /*yield*/, this.startAssestsChange()];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AssetsSync.prototype.startAssestsChange = function () {
        return __awaiter(this, void 0, void 0, function () {
            var savedPath, extIndex, fileName, changePath, changeFiles, changeFiles_1, changeFiles_1_1, changeFile, e_1_1;
            var e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        savedPath = this.activeDocument.directory;
                        extIndex = this.activeDocument.name.search(".psd");
                        fileName = this.activeDocument.name.slice(0, extIndex);
                        changePath = savedPath + ("\\" + fileName + "-changeAssets");
                        if (!fs.existsSync(changePath)) return [3 /*break*/, 8];
                        changeFiles = assetsUtils_1.getAllFiles(changePath);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        changeFiles_1 = __values(changeFiles), changeFiles_1_1 = changeFiles_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!changeFiles_1_1.done) return [3 /*break*/, 5];
                        changeFile = changeFiles_1_1.value;
                        return [4 /*yield*/, this.handleFileSyncProcedure(utils_1.utlis.removeExtensionFromFileName(changeFile), changePath)];
                    case 3:
                        _b.sent();
                        fs.unlinkSync(path.join(changePath, changeFile));
                        _b.label = 4;
                    case 4:
                        changeFiles_1_1 = changeFiles_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (changeFiles_1_1 && !changeFiles_1_1.done && (_a = changeFiles_1.return)) _a.call(changeFiles_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    AssetsSync.prototype.handleFileSyncProcedure = function (file, assetsPath) {
        return __awaiter(this, void 0, void 0, function () {
            var artLayers, artLayers_1, artLayers_1_1, artLayer, name_1, parentId, parentX, parentY, filePath, dimension, creationObj, bufferPayload, newLayerId, e_2_1;
            var e_2, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        artLayers = this.artLayers[file];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 10, 11, 12]);
                        artLayers_1 = __values(artLayers), artLayers_1_1 = artLayers_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!artLayers_1_1.done) return [3 /*break*/, 9];
                        artLayer = artLayers_1_1.value;
                        name_1 = artLayer.name;
                        return [4 /*yield*/, this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/getParentId.jsx"), { "childName": artLayer.id })];
                    case 3:
                        parentId = _b.sent();
                        parentX = 0;
                        parentY = 0;
                        filePath = path.join(assetsPath, file + ".png");
                        dimension = {
                            parentX: parentX,
                            parentY: parentY,
                            x: artLayer.bounds.left,
                            y: artLayer.bounds.top,
                            w: (artLayer.bounds.right - artLayer.bounds.left),
                            h: (artLayer.bounds.bottom - artLayer.bounds.top),
                        };
                        creationObj = {
                            dimensions: dimension,
                            type: "artLayer",
                            childName: name_1,
                            layerID: [artLayer.id],
                            image: file,
                            parentId: parentId,
                            file: filePath
                        };
                        return [4 /*yield*/, this.generator.getLayerSettingsForPlugin(this.activeDocument.id, artLayer.id, packageJson.name)];
                    case 4:
                        bufferPayload = _b.sent();
                        return [4 /*yield*/, this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), { id: artLayer.id })];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/InsertLayer.jsx"), creationObj)];
                    case 6:
                        newLayerId = _b.sent();
                        return [4 /*yield*/, this.generator.setLayerSettingsForPlugin(bufferPayload, newLayerId, packageJson.name)];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8:
                        artLayers_1_1 = artLayers_1.next();
                        return [3 /*break*/, 2];
                    case 9: return [3 /*break*/, 12];
                    case 10:
                        e_2_1 = _b.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 12];
                    case 11:
                        try {
                            if (artLayers_1_1 && !artLayers_1_1.done && (_a = artLayers_1.return)) _a.call(artLayers_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    AssetsSync.prototype.getAllArtLayers = function (artLayerRef) {
        var _a;
        var _b;
        if (!artLayerRef.generatorSettings) {
            return;
        }
        var imageName = JSON.parse(artLayerRef.generatorSettings.PanelScriptsImage.json).image;
        (_a = (_b = this.artLayers)[imageName]) !== null && _a !== void 0 ? _a : (_b[imageName] = []);
        this.artLayers[imageName].push(artLayerRef);
    };
    return AssetsSync;
}());
exports.AssetsSync = AssetsSync;
//# sourceMappingURL=AssetsSync.js.map