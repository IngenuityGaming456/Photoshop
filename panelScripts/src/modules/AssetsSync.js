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
var utils_1 = require("../utils/utils");
var fs = require("fs");
var path = require("path");
var AssetsSync = /** @class */ (function () {
    function AssetsSync(modelFactory, pFactory) {
        this.artLayers = [];
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
                        this.getAssetsAndJson();
                        this.assetsSyncDriver();
                        return [2 /*return*/];
                }
            });
        });
    };
    AssetsSync.prototype.getAssetsAndJson = function () {
        var stats = utils_1.utlis.getAssetsAndJson("Photoshop", this.activeDocument);
        this.psAssetsPath = stats.qAssetsPath;
        this.psObj = stats.qObj;
    };
    AssetsSync.prototype.assetsSyncDriver = function () {
        var assetsPath = this.psAssetsPath;
        /**as we are at the root of the assets folder */
        var level = 0;
        utils_1.utlis.traverseObject(this.psObj.layers, this.getAllArtLayers.bind(this));
        this.artLayers.reverse();
        this.searchForChangedAssets(level, assetsPath, null, 'common', null);
    };
    AssetsSync.prototype.searchForChangedAssets = function (level, assetsPath, platform, common, view) {
        return __awaiter(this, void 0, void 0, function () {
            var files, files_1, files_1_1, file, filePath, stats, currentFile, e_1_1, e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        files = fs.readdirSync(assetsPath);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        files_1 = __values(files), files_1_1 = files_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!files_1_1.done) return [3 /*break*/, 5];
                        file = files_1_1.value;
                        switch (level) {
                            case 0:
                                platform = file;
                                break;
                            case 1:
                                common = file;
                                break;
                            case 2: view = file;
                        }
                        filePath = path.join(assetsPath, file);
                        stats = fs.statSync(filePath);
                        if (stats.isDirectory() && level <= 3) {
                            this.searchForChangedAssets(level + 1, filePath, platform, common, view);
                        }
                        if (!(level === 4)) return [3 /*break*/, 4];
                        currentFile = this.removeExtensionFromFileName(file);
                        return [4 /*yield*/, this.handleFileSyncProcedure(currentFile, assetsPath, platform, common, view)];
                    case 3:
                        _b.sent();
                        fs.unlinkSync(filePath);
                        _b.label = 4;
                    case 4:
                        files_1_1 = files_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (files_1_1 && !files_1_1.done && (_a = files_1.return)) _a.call(files_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    AssetsSync.prototype.handleFileSyncProcedure = function (file, assetsPath, platform, common, view) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, artLayer, imageName, name_1, type, viewId, parentId, parentX, parentY, dimension, creationObj, e_2_1, e_2, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        console.log(file, assetsPath, platform, common, view);
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 8, 9, 10]);
                        _a = __values(this.artLayers), _b = _a.next();
                        _d.label = 2;
                    case 2:
                        if (!!_b.done) return [3 /*break*/, 7];
                        artLayer = _b.value;
                        console.log(artLayer);
                        imageName = JSON.parse(artLayer.generatorSettings.PanelScriptsImage.json).image;
                        if (!(imageName === file && artLayer.type == "layer")) return [3 /*break*/, 6];
                        name_1 = artLayer.name;
                        type = artLayer.type;
                        viewId = this.getParentId(view, platform);
                        return [4 /*yield*/, this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/getParentId.jsx"), { "childName": artLayer.id, "parentId": viewId })];
                    case 3:
                        parentId = _d.sent();
                        parentX = 0;
                        parentY = 0;
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
                            image: imageName,
                            parentId: parentId,
                            file: path.join(assetsPath, file + ".png")
                        };
                        // await this.photoshopFactory.makeStruct({[name]: creationObj}, parentId, view, platform, "image", assetsPath);
                        return [4 /*yield*/, this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/InsertLayer.jsx"), creationObj)];
                    case 4:
                        // await this.photoshopFactory.makeStruct({[name]: creationObj}, parentId, view, platform, "image", assetsPath);
                        _d.sent();
                        return [4 /*yield*/, this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), { id: artLayer.id })];
                    case 5:
                        _d.sent();
                        _d.label = 6;
                    case 6:
                        _b = _a.next();
                        return [3 /*break*/, 2];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_2_1 = _d.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 10];
                    case 9:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    AssetsSync.prototype.getAllArtLayers = function (artLayerRef) {
        this.artLayers.push(artLayerRef);
    };
    AssetsSync.prototype.getParentId = function (view, platform) {
        var elementalMap = this.modelFactory.getPhotoshopModel().viewElementalMap;
        var currentView = elementalMap[platform][view];
        return currentView.base.id;
    };
    AssetsSync.prototype.removeExtensionFromFileName = function (file) {
        return file.split('.').slice(0, -1).join('.');
    };
    return AssetsSync;
}());
exports.AssetsSync = AssetsSync;
//# sourceMappingURL=AssetsSync.js.map