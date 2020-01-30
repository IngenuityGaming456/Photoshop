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
var constants_1 = require("../../constants");
var menuLabels = require("../../res/menuLables");
var MenuProxyManager = /** @class */ (function () {
    function MenuProxyManager(modelFactory) {
        this.menuStates = [];
        this.modelFactory = modelFactory;
    }
    MenuProxyManager.prototype.execute = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.generator = params.generator;
                        this.docEmitter = params.docEmitter;
                        this.menuStates = this.modelFactory.getPhotoshopModel().allMenuStates;
                        this.subscribeListeners();
                        return [4 /*yield*/, this.addMenuItems()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MenuProxyManager.prototype.subscribeListeners = function () {
        var _this = this;
        this.docEmitter.on(constants_1.photoshopConstants.logger.currentDocument, function () { return _this.enableAllMenuItems(); });
        this.docEmitter.on(constants_1.photoshopConstants.logger.newDocument, function () { return _this.disableAllMenuItems(); });
    };
    MenuProxyManager.prototype.addMenuItems = function () {
        return __awaiter(this, void 0, void 0, function () {
            var menuArray, menuArray_1, menuArray_1_1, menu, e_1_1, e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        menuArray = Object.keys(menuLabels);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        menuArray_1 = __values(menuArray), menuArray_1_1 = menuArray_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!menuArray_1_1.done) return [3 /*break*/, 5];
                        menu = menuArray_1_1.value;
                        return [4 /*yield*/, this.drawMenuItems(menu)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        menuArray_1_1 = menuArray_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (menuArray_1_1 && !menuArray_1_1.done && (_a = menuArray_1.return)) _a.call(menuArray_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    MenuProxyManager.prototype.drawMenuItems = function (menu) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(menuLabels[menu].enabled === false)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.generator.addMenuItem(menuLabels[menu].label, menuLabels[menu].displayName, menuLabels[menu].enabled, false)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.generator.addMenuItem(menuLabels[menu].label, menuLabels[menu].displayName, true, false)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MenuProxyManager.prototype.enableAllMenuItems = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _i, menu;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = [];
                        for (_b in menuLabels)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        menu = _a[_i];
                        if (!(menuLabels.hasOwnProperty(menu) && menuLabels[menu].enabled !== false)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.generator.toggleMenu(menuLabels[menu].label, true, false, menuLabels[menu].displayName)];
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
    MenuProxyManager.prototype.disableAllMenuItems = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _i, menu;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = [];
                        for (_b in menuLabels)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        menu = _a[_i];
                        if (!menuLabels.hasOwnProperty(menu)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.generator.toggleMenu(menuLabels[menu].label, false, false, menuLabels[menu].displayName)];
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
    return MenuProxyManager;
}());
exports.MenuProxyManager = MenuProxyManager;
//# sourceMappingURL=MenuProxyManager.js.map