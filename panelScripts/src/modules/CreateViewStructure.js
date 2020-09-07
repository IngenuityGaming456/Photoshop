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
exports.CreateViewStructure = void 0;
var constants_1 = require("../constants");
var path = require("path");
var packageJson = require("../../package.json");
var CreateViewStructure = /** @class */ (function () {
    function CreateViewStructure(viewClass, modelFactory, photoshopFactory) {
        this.questComponents = ["button", "image", "label", "meter", "animation", "shape", "container", "slider"];
        this._viewClass = viewClass;
        this.modelFactory = modelFactory;
        this.viewDeletionObj = this.modelFactory.getPhotoshopModel().viewDeletion;
        this.photoshopFactory = photoshopFactory;
    }
    CreateViewStructure.prototype.execute = function (params) {
        this.menuName = params.menuName;
        this._pluginId = packageJson.name;
        this._generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.currentMenu = params.menuName;
        this.docEmitter = params.docEmitter;
        this.photoshopModel = this.modelFactory.getPhotoshopModel();
        this.drawStruct(params.menuName);
    };
    CreateViewStructure.prototype.getElementMap = function () {
        return this.modelFactory.getMappingModel().getGenericViewMap();
    };
    CreateViewStructure.prototype.drawStruct = function (menuName) {
        return __awaiter(this, void 0, void 0, function () {
            var insertionObj, params, result, _a, _b, _i, keys;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this._viewClass.shouldDrawStruct(this._generator, this.docEmitter, this.getPlatform.bind(this), this.viewDeletionObj, this.menuName)];
                    case 1:
                        insertionObj = _e.sent();
                        if (!(insertionObj !== "invalid")) return [3 /*break*/, 6];
                        this.platform = insertionObj.platform;
                        params = this.getElementMap().get(menuName);
                        this.emitValidCalls(menuName);
                        return [4 /*yield*/, this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/CreateView.jsx"))];
                    case 2:
                        result = _e.sent();
                        params = (_c = {},
                            _c[result] = (_d = {},
                                _d[result] = {},
                                _d),
                            _c);
                        _a = [];
                        for (_b in params)
                            _a.push(_b);
                        _i = 0;
                        _e.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        keys = _a[_i];
                        if (!params.hasOwnProperty(keys)) return [3 /*break*/, 5];
                        this.modifyMappedPlatform(keys);
                        this.modifyElementalMap(keys);
                        return [4 /*yield*/, this.photoshopFactory.makeStruct(params[keys], insertionObj.insertId, null, this.platform)];
                    case 4:
                        _e.sent();
                        _e.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    CreateViewStructure.prototype.modifyMappedPlatform = function (view) {
        var _a;
        var mappedPlatform = this.modelFactory.getPhotoshopModel().mappedPlatformObj;
        for (var key in mappedPlatform) {
            if (!mappedPlatform.hasOwnProperty(key)) {
                continue;
            }
            mappedPlatform[key][view] = {};
            var firstKey = Object.keys(mappedPlatform[key])[0];
            var rear = Object.keys(mappedPlatform[key][firstKey]["mapping"])[0];
            mappedPlatform[key][view] = {
                "mapping": (_a = {},
                    _a[rear] = view,
                    _a)
            };
        }
    };
    CreateViewStructure.prototype.modifyElementalMap = function (view) {
        var elementalMap = this.modelFactory.getPhotoshopModel().viewElementalMap;
        this.addViewToElementalMap(elementalMap, view);
    };
    CreateViewStructure.prototype.addViewToElementalMap = function (elementalMap, view) {
        for (var key in elementalMap) {
            if (!elementalMap.hasOwnProperty(key)) {
                continue;
            }
            if (view in elementalMap[key]) {
                return;
            }
            elementalMap[key][view] = this.makeElementalObject();
        }
    };
    CreateViewStructure.prototype.makeElementalObject = function () {
        var e_1, _a;
        var elementalObj = {};
        try {
            for (var _b = __values(this.questComponents), _c = _b.next(); !_c.done; _c = _b.next()) {
                var item = _c.value;
                elementalObj[item] = [];
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return elementalObj;
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
    CreateViewStructure.prototype.emitValidCalls = function (menuName) {
        if (menuName != constants_1.photoshopConstants.views.genericView) {
            this.docEmitter.emit("validEntryStruct", this.currentMenu, this.platform);
        }
    };
    return CreateViewStructure;
}());
exports.CreateViewStructure = CreateViewStructure;
//# sourceMappingURL=CreateViewStructure.js.map