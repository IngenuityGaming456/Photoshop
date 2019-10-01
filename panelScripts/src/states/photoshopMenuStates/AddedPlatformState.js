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
var utilsPhotoshopState_1 = require("../../utils/utilsPhotoshopState");
var menuLabel = require("../../res/menuLables.json");
var AddedPlatformState = /** @class */ (function () {
    function AddedPlatformState() {
    }
    AddedPlatformState.prototype.checkMenuState = function (generator) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _i, menu;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = [];
                        for (_b in menuLabel)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        menu = _a[_i];
                        if (!menuLabel.hasOwnProperty(menu)) return [3 /*break*/, 3];
                        if (!!utilsPhotoshopState_1.UtilsPhotoshopState.isPlatform(menu)) return [3 /*break*/, 3];
                        return [4 /*yield*/, generator.toggleMenu(menuLabel[menu].label, true, false, menuLabel[menu].displayName)];
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
    AddedPlatformState.prototype.onAllPlatformsDeletion = function (menuManager, menuName) {
        menuManager.setCurrentState(menuManager.getNoPlatformState());
        menuManager.onAllPlatformsDeletion();
    };
    AddedPlatformState.prototype.onPlatformAddition = function (menuManager, generator, menuName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkMenuState(generator)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, generator.toggleMenu(menuName, false, false)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AddedPlatformState.prototype.onViewAddition = function (menuManager, generator, menuName) {
        menuManager.setCurrentState(menuManager.getAddedViewState());
        menuManager.onViewAddition(menuName);
    };
    AddedPlatformState.prototype.onViewDeletion = function (menuManager, generator, menuName) {
        menuManager.setCurrentState(menuManager.getViewDeletionState());
        menuManager.onViewDeletion(menuName);
    };
    AddedPlatformState.prototype.onPlatformDeletion = function (menuManager, generator, menuName) {
        menuManager.setCurrentState(menuManager.getDeletedPlatformState());
        menuManager.onPlatformDeletion(menuName);
    };
    return AddedPlatformState;
}());
exports.AddedPlatformState = AddedPlatformState;
//# sourceMappingURL=AddedPlatformState.js.map