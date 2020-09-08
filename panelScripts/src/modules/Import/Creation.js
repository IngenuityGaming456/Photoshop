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
exports.Creation = void 0;
var utils_1 = require("../../utils/utils");
var path = require("path");
var Creation = /** @class */ (function () {
    function Creation() {
    }
    Creation.prototype.execute = function (params) {
        this.diffObj = this.storage.result;
        this.pFactory = this.storage.pFactory;
        this.generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.handleChangesInPS();
    };
    Creation.prototype.handleChangesInPS = function () {
        var diffObj = this.diffObj;
        if (diffObj.hasOwnProperty("delete")) {
            this.handleDeleteComp(diffObj['delete']);
        }
        if (diffObj.hasOwnProperty("move")) {
            this.handleOperationOverComp(diffObj['move'], "move");
        }
        if (diffObj.hasOwnProperty("rename")) {
            this.handleOperationOverComp(diffObj['rename'], "rename");
        }
        if (diffObj.hasOwnProperty("create")) {
            this.handleOperationOverComp(diffObj['create'], "create");
        }
    };
    Creation.prototype.handleDeleteComp = function (deleteObj) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _i, i;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!deleteObj.hasOwnProperty('components')) return [3 /*break*/, 4];
                        _a = [];
                        for (_b in deleteObj['components'])
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        i = _a[_i];
                        return [4 /*yield*/, this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/DeleteErrorLayer.jsx"), { id: deleteObj['components'][i].id })];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Creation.prototype.handleOperationOverComp = function (obj, operation) {
        if (obj.hasOwnProperty('container')) {
            switch (operation) {
                case "move":
                    this.handleMoveComp(obj['container']);
                    break;
                case "rename":
                    this.handleRenameComp(obj['container']);
                    break;
                case "create": this.handleCreation(obj);
            }
        }
        if (obj.hasOwnProperty('image')) {
            switch (operation) {
                case "move":
                    this.handleMoveComp(obj['container']);
                    break;
                case "rename":
                    this.handleRenameComp(obj['container']);
                    break;
            }
        }
    };
    Creation.prototype.handleMoveComp = function (moveObj) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _i, i, currentObj, currentMovedObj;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = [];
                        for (_b in moveObj)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        i = _a[_i];
                        currentObj = moveObj[i];
                        currentMovedObj = JSON.parse(currentObj['moveObj']);
                        return [4 /*yield*/, this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/move.jsx"), { "newParentId": currentMovedObj.newparentId, "childId": currentMovedObj.childId })];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Creation.prototype.handleRenameComp = function (renameObj) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _i, i, currentObj, currentMovedObj;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = [];
                        for (_b in renameObj)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        i = _a[_i];
                        currentObj = renameObj[i];
                        currentMovedObj = JSON.parse(currentObj['renamed']);
                        return [4 /*yield*/, this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/rename.jsx"), { "elementId": currentMovedObj.elementId, "newName": currentMovedObj.newName })];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Creation.prototype.handleCreation = function (createObj) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.handleViewCreation(createObj["views"])];
                    case 1:
                        (_a.sent())
                            .handleContainerCreation(createObj["containers"]);
                        return [2 /*return*/];
                }
            });
        });
    };
    Creation.prototype.handleViewCreation = function (views) {
        return __awaiter(this, void 0, void 0, function () {
            var views_1, views_1_1, view, platformRef, commonId, e_1_1;
            var e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, 6, 7]);
                        views_1 = __values(views), views_1_1 = views_1.next();
                        _b.label = 1;
                    case 1:
                        if (!!views_1_1.done) return [3 /*break*/, 4];
                        view = views_1_1.value;
                        platformRef = utils_1.utlis.getPlatformRef(view.platform, this.activeDocument);
                        commonId = utils_1.utlis.getCommonId(platformRef);
                        return [4 /*yield*/, this.pFactory.makeStruct(view.view, commonId, null, view.platform, "quest")];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        views_1_1 = views_1.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (views_1_1 && !views_1_1.done && (_a = views_1.return)) _a.call(views_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/, this];
                }
            });
        });
    };
    Creation.prototype.handleContainerCreation = function (containers) {
        return __awaiter(this, void 0, void 0, function () {
            var container;
            return __generator(this, function (_a) {
                for (container in containers) {
                }
                return [2 /*return*/];
            });
        });
    };
    return Creation;
}());
exports.Creation = Creation;
//# sourceMappingURL=Creation.js.map