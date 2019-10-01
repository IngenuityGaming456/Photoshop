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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var FactoryClass_1 = require("../FactoryClass");
var MenuManager_1 = require("./MenuManager");
var NoPlatformState_1 = require("../../states/photoshopMenuStates/NoPlatformState");
var AddedPlatformState_1 = require("../../states/photoshopMenuStates/AddedPlatformState");
var AddedViewState_1 = require("../../states/photoshopMenuStates/AddedViewState");
var DeletedViewsState_1 = require("../../states/photoshopMenuStates/DeletedViewsState");
var ModelFactory_1 = require("../../models/ModelFactory");
var DeletedPlatformState_1 = require("../../states/photoshopMenuStates/DeletedPlatformState");
var menuLabels = require("../../res/menuLables");
var MenuProxyManager = /** @class */ (function () {
    function MenuProxyManager(modelFactory) {
        this.platformStack = [];
        this.platformDeletion = { desktop: false, portrait: false, landscape: false };
        this.viewDeletion = {};
        this.platformArray = [];
        this.modelFactory = modelFactory;
        this.menuManager = FactoryClass_1.inject({
            ref: MenuManager_1.MenuManager, dep: [ModelFactory_1.ModelFactory, NoPlatformState_1.NoPlatformState,
                AddedPlatformState_1.AddedPlatformState, AddedViewState_1.AddedViewState, DeletedViewsState_1.DeletedViewState, DeletedPlatformState_1.DeletedPlatformState]
        });
    }
    MenuProxyManager.prototype.execute = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.generator = params.generator;
                        this.subscribeListeners();
                        return [4 /*yield*/, this.addMenuItems()];
                    case 1:
                        _a.sent();
                        this.platformArray = this.modelFactory.getPhotoshopModel().allQuestPlatforms;
                        this.createViewDeletionObj();
                        FactoryClass_1.execute(this.menuManager, { generator: this.generator });
                        return [2 /*return*/];
                }
            });
        });
    };
    MenuProxyManager.prototype.subscribeListeners = function () {
        var _this = this;
        this.generator.on("validEntryStruct", function (currentMenuName, currentPlatform) {
            _this.filterAllIncomingResults(currentMenuName, currentPlatform);
        });
        this.generator.on("layersDeleted", function (deletedLayers) {
            _this.onLayersDeletion(deletedLayers);
        });
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
                    case 0: return [4 /*yield*/, this.generator.addMenuItem(menuLabels[menu].label, menuLabels[menu].displayName, true, false)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MenuProxyManager.prototype.createViewDeletionObj = function () {
        var _this = this;
        this.platformArray.forEach(function (platformKey) {
            _this.viewDeletion[platformKey] = {};
            for (var menu in menuLabels) {
                if (!menuLabels.hasOwnProperty(menu)) {
                    continue;
                }
                if (menuLabels[menu].menuGroup === "Menu_View") {
                    _this.viewDeletion[platformKey][menuLabels[menu].label] = false;
                }
            }
        });
    };
    MenuProxyManager.prototype.filterAllIncomingResults = function (currentMenuName, currentPlatform) {
        if (!currentPlatform) {
            this.handlePlatformAddition(currentMenuName);
        }
        else {
            this.handleViewAddition(currentMenuName, currentPlatform);
        }
    };
    MenuProxyManager.prototype.handlePlatformAddition = function (currentMenuName) {
        var _this = this;
        var platformMap = this.modelFactory.getMappingModel().getPlatformMap();
        var platformObj = platformMap.get(currentMenuName);
        Object.keys(Object.values(platformObj)[0]).forEach(function (key) {
            _this.platformDeletion[key] = false;
        });
        this.menuManager.onPlatformAddition(currentMenuName);
    };
    MenuProxyManager.prototype.handleViewAddition = function (currentMenuName, currentPlatform) {
        this.viewDeletion[currentPlatform][currentMenuName] = false;
        if (!~this.platformStack.indexOf(currentPlatform)) {
            this.platformStack.push(currentPlatform);
        }
        if (this.platformStack.length === 3) {
            this.menuManager.onViewAddition(currentMenuName);
        }
    };
    MenuProxyManager.prototype.onLayersDeletion = function (eventLayers) {
        var viewElementalMap = this.modelFactory.getPhotoshopModel().viewElementalMap;
        var callback = this.getCallback(eventLayers);
        try {
            this.handlePlatformDeletion(eventLayers, viewElementalMap, callback)
                .handleViewDeletion(eventLayers, viewElementalMap, callback);
        }
        catch (err) {
            console.log(err);
        }
    };
    MenuProxyManager.prototype.getCallback = function (eventLayers) {
        if (this.responseIsArrayOfArrays(eventLayers)) {
            return this.handleArrayResponse;
        }
        return this.handleNormalResponse;
    };
    MenuProxyManager.prototype.responseIsArrayOfArrays = function (eventLayers) {
        for (var item in eventLayers) {
            if (eventLayers[item] instanceof Array) {
                return true;
            }
        }
    };
    MenuProxyManager.prototype.handleArrayResponse = function (baseId, eventLayers) {
        var _this = this;
        return eventLayers.some(function (item) {
            if (item instanceof Array) {
                return _this.handleArrayResponse(baseId, item);
            }
            else {
                return _this.handleNormalResponse(baseId, item);
            }
        });
    };
    MenuProxyManager.prototype.handleNormalResponse = function (baseId, eventLayers) {
        return eventLayers.some(function (item) {
            if (item.id === baseId) {
                return true;
            }
        });
    };
    MenuProxyManager.prototype.handlePlatformDeletion = function (eventLayers, viewElementalMap, callback) {
        var _this = this;
        this.platformArray.forEach(function (platformKey) {
            var platformId = viewElementalMap.get(platformKey).get("base");
            if (platformId) {
                if (callback(platformId, eventLayers)) {
                    _this.platformDeletion[platformKey] = true;
                }
            }
        });
        var allTrue = this.platformDeletion["desktop"] &&
            this.platformDeletion["portrait"] &&
            this.platformDeletion["landscape"];
        if (allTrue) {
            this.menuManager.onAllPlatformsDeletion();
            throw new Error("No need to check for view deletion");
        }
        if (this.platformDeletion["portrait"] && this.platformDeletion["landscape"]) {
            this.menuManager.onPlatformDeletion("MobileView");
            throw new Error("No need to check for view deletion");
        }
        if (this.platformDeletion["desktop"]) {
            this.menuManager.onPlatformDeletion("DesktopView");
            throw new Error("No need to check for view deletion");
        }
        return this;
    };
    MenuProxyManager.prototype.handleViewDeletion = function (eventLayers, viewElementalMap, callback) {
        var _this = this;
        var viewMap = this.modelFactory.getMappingModel().getViewMap();
        if (viewMap) {
            __spread(viewElementalMap.keys()).forEach(function (platformKey) {
                viewMap.forEach(function (value, key) {
                    _this.checkElementKey(key, Object.keys(value), platformKey, eventLayers, callback, viewElementalMap);
                });
            });
            this.checkViewDeletion();
        }
    };
    MenuProxyManager.prototype.checkElementKey = function (viewKey, valueArray, platformKey, eventLayers, callback, viewElementalMap) {
        try {
            for (var valueArray_1 = __values(valueArray), valueArray_1_1 = valueArray_1.next(); !valueArray_1_1.done; valueArray_1_1 = valueArray_1.next()) {
                var value = valueArray_1_1.value;
                if (this.viewDeletion[platformKey][viewKey]) {
                    continue;
                }
                var valueObj = viewElementalMap.get(platformKey).get(value)["base"];
                if (!valueObj || !callback(valueObj.id, eventLayers)) {
                    this.viewDeletion[platformKey][viewKey] = false;
                    return;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (valueArray_1_1 && !valueArray_1_1.done && (_a = valueArray_1.return)) _a.call(valueArray_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        this.viewDeletion[platformKey][viewKey] = true;
        var e_2, _a;
    };
    MenuProxyManager.prototype.checkViewDeletion = function () {
        for (var menu in menuLabels) {
            if (!menuLabels.hasOwnProperty(menu)) {
                continue;
            }
            if (menuLabels[menu].menuGroup === "Menu_View") {
                this.checkViewForDeletion(menuLabels[menu].label);
            }
        }
    };
    MenuProxyManager.prototype.checkViewForDeletion = function (menuName) {
        var keysLength = Object.keys(this.viewDeletion).length;
        var count = 0;
        for (var key in this.viewDeletion) {
            if (this.viewDeletion[key][menuName]) {
                count++;
            }
        }
        if (count === keysLength) {
            this.menuManager.onViewDeletion(menuName);
        }
    };
    return MenuProxyManager;
}());
exports.MenuProxyManager = MenuProxyManager;
//# sourceMappingURL=MenuProxyManager.js.map