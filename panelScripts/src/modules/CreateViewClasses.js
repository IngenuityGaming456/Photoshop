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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePlatform = exports.CreateView = void 0;
var constants_1 = require("../constants");
var path = require("path");
var CreateView = /** @class */ (function () {
    function CreateView() {
    }
    CreateView.prototype.shouldDrawStruct = function (generator, docEmitter, getPlatform, viewDeletionObj, menuName) {
        return __awaiter(this, void 0, void 0, function () {
            var selectedLayers, selectedLayerId, selectedLayersArray, selectedLayersIdArray;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, generator.evaluateJSXFile(path.join(__dirname, "../../jsx/SelectedLayers.jsx"))];
                    case 1:
                        selectedLayers = _a.sent();
                        return [4 /*yield*/, generator.evaluateJSXFile(path.join(__dirname, "../../jsx/SelectedLayersIds.jsx"))];
                    case 2:
                        selectedLayerId = _a.sent();
                        selectedLayersArray = selectedLayers.split(",");
                        selectedLayersIdArray = selectedLayerId.toString().split(",");
                        if (~selectedLayersArray.indexOf(constants_1.photoshopConstants.common) && selectedLayersArray.length === 1
                            && (!this.isAlreadyMade(selectedLayersIdArray[0], getPlatform, menuName, viewDeletionObj))) {
                            return [2 /*return*/, Promise.resolve({ insertId: selectedLayersIdArray[0], platform: this.platform })];
                        }
                        docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, "Need to select only common to make " + menuName);
                        return [2 /*return*/, Promise.reject("invalid")];
                }
            });
        });
    };
    CreateView.prototype.isAlreadyMade = function (selectedLayerId, getPlatform, menuName, viewDeletionObj) {
        var platform = getPlatform(Number(selectedLayerId));
        this.platform = platform;
        if (menuName === constants_1.photoshopConstants.views.genericView) {
            return false;
        }
        return !(viewDeletionObj[platform][menuName] === null || viewDeletionObj[platform][menuName]);
    };
    return CreateView;
}());
exports.CreateView = CreateView;
var CreatePlatform = /** @class */ (function () {
    function CreatePlatform() {
    }
    CreatePlatform.prototype.shouldDrawStruct = function (generator, docEmitter) {
        return __awaiter(this, void 0, void 0, function () {
            var jsxPath, selectedLayers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jsxPath = path.join(__dirname, "../../jsx/SelectedLayers.jsx");
                        return [4 /*yield*/, generator.evaluateJSXFile(jsxPath)];
                    case 1:
                        selectedLayers = _a.sent();
                        if (!selectedLayers.length) {
                            return [2 /*return*/, Promise.resolve({ insertId: null, platform: null })];
                        }
                        docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, "No layer should be selected in order to make a platform");
                        return [2 /*return*/, Promise.reject("invalid")];
                }
            });
        });
    };
    return CreatePlatform;
}());
exports.CreatePlatform = CreatePlatform;
//# sourceMappingURL=CreateViewClasses.js.map