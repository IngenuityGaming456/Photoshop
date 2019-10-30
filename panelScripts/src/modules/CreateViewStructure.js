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
var packageJson = require("../../package.json");
var CreateViewStructure = /** @class */ (function () {
    function CreateViewStructure(viewClass, modelFactory, photoshopFactory) {
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
        if (!this.platform) {
            return this.modelFactory.getMappingModel().getPlatformMap();
        }
        return this.modelFactory.getMappingModel().getViewPlatformMap(this.platform);
    };
    CreateViewStructure.prototype.drawStruct = function (menuName) {
        return __awaiter(this, void 0, void 0, function () {
            var insertionObj, params, _a, _b, _i, keys;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this._viewClass.shouldDrawStruct(this._generator, this.docEmitter, this.getPlatform.bind(this), this.viewDeletionObj, this.menuName)];
                    case 1:
                        insertionObj = _c.sent();
                        if (!(insertionObj !== "invalid")) return [3 /*break*/, 5];
                        this.platform = insertionObj.platform;
                        params = this.getElementMap().get(menuName);
                        this.emitValidCalls(menuName);
                        _a = [];
                        for (_b in params)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        keys = _a[_i];
                        if (!params.hasOwnProperty(keys)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.photoshopFactory.makeStruct(params[keys], insertionObj.insertId, null, this.platform)];
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
        if (menuName != "AddGenericView") {
            this.docEmitter.emit("validEntryStruct", this.currentMenu, this.platform);
        }
    };
    return CreateViewStructure;
}());
exports.CreateViewStructure = CreateViewStructure;
//# sourceMappingURL=CreateViewStructure.js.map