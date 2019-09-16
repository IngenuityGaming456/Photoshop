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
var menuLabels = require("../res/menuLables.json");
var MenuManager = /** @class */ (function () {
    function MenuManager(modelFactory, noPlatform, addedPlatform, addedView, deletedView) {
        this.platformStack = [];
        this.platformArray = [];
        this.viewArray = [];
        this.modelFactory = modelFactory;
        this.noPlatform = noPlatform;
        this.addedPlatform = addedPlatform;
        this.addedView = addedView;
        this.deletedView = deletedView;
    }
    MenuManager.prototype.execute = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.generator = params.generator;
                        this.subscribeListeners();
                        return [4 /*yield*/, this.addMenuItems()];
                    case 1:
                        _a.sent();
                        this.setStartingState();
                        return [2 /*return*/];
                }
            });
        });
    };
    MenuManager.prototype.subscribeListeners = function () {
        var _this = this;
        this.generator.on("layersDeleted", function (eventLayers) { return _this.onLayerDeletion(eventLayers); });
        this.generator.onPhotoshopEvent("generatorMenuChanged", function (event) { return _this.onButtonMenuClicked(event); });
    };
    MenuManager.prototype.addMenuItems = function () {
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
    MenuManager.prototype.setStartingState = function () {
        this.currentState = this.getNoPlatformState();
        this.onAllPlatformsDeletion();
    };
    MenuManager.prototype.drawMenuItems = function (menu) {
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
    MenuManager.prototype.setCurrentState = function (state) {
        this.currentState = state;
    };
    MenuManager.prototype.onViewAddition = function (viewMenuName) {
        this.currentState.onViewAddition(this, this.generator, viewMenuName);
    };
    MenuManager.prototype.onViewDeletion = function (viewMenuName) {
        this.currentState.onViewDeletion(this, this.generator, viewMenuName);
    };
    MenuManager.prototype.onPlatformAddition = function (platformMenuName) {
        this.currentState.onPlatformAddition(this, this.generator, platformMenuName);
    };
    MenuManager.prototype.onAllPlatformsDeletion = function () {
        this.currentState.onAllPlatformsDeletion(this, this.generator);
    };
    MenuManager.prototype.getNoPlatformState = function () {
        return this.noPlatform;
    };
    MenuManager.prototype.getPlatformAdditionState = function () {
        return this.addedPlatform;
    };
    MenuManager.prototype.getViewDeletionState = function () {
        return this.deletedView;
    };
    MenuManager.prototype.getAddedViewState = function () {
        return this.addedView;
    };
    MenuManager.prototype.onButtonMenuClicked = function (event) {
        var menu = event.generatorMenuChanged;
        if (this.isPlatformAdded(menu.name)) {
            this.onPlatformAddition(menu.name);
            return;
        }
        if (this.isViewAdded(menu.name)) {
            this.onViewAddition(menu.name);
        }
    };
    MenuManager.prototype.isViewAdded = function (menuName) {
        var viewMap = this.modelFactory.getMappingModel().getViewMap();
        return this.isAdded(menuName, viewMap, this.viewArray);
    };
    MenuManager.prototype.isPlatformAdded = function (menuName) {
        var platformMap = this.modelFactory.getMappingModel().getPlatformMap();
        return this.isAdded(menuName, platformMap, this.platformArray);
    };
    MenuManager.prototype.isAdded = function (menuName, valueMap, insertionArray) {
        if (~__spread(valueMap.keys()).indexOf(menuName)) {
            this.platformStack.push(menuName);
            var value = valueMap.get(menuName);
            insertionArray.push({ name: menuName, values: Object.keys(value) });
            return true;
        }
    };
    MenuManager.prototype.onLayerDeletion = function (eventLayers) {
        var baseMenuIds = this.modelFactory.getPhotoshopModel().menuIds;
        if (this.responseIsArrayOfArrays(eventLayers)) {
            this.getBaseId(eventLayers, baseMenuIds, this.handleArrayResponse);
        }
        else {
            this.getBaseId(eventLayers, baseMenuIds, this.handleNormalResponse);
        }
    };
    MenuManager.prototype.handleArrayResponse = function (baseId, eventLayers) {
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
    MenuManager.prototype.handleNormalResponse = function (baseId, eventLayers) {
        return eventLayers.some(function (item) {
            if (item.id === baseId.id) {
                return true;
            }
        });
    };
    MenuManager.prototype.getBaseId = function (eventLayers, baseMenuIds, callback) {
        var baseId = baseMenuIds.find(function (item) {
            if (callback(item, eventLayers)) {
                return true;
            }
        });
        if (baseId) {
            this.getMenuType(baseId);
        }
    };
    MenuManager.prototype.getMenuType = function (baseId) {
        var idName = baseId.name;
        var deletedView = this.isViewDeleted(idName);
        if (deletedView) {
            this.onViewDeletion(deletedView);
            return;
        }
        var deletedPlatform = this.isAllPlatformsDeleted(idName);
        if (deletedPlatform) {
            this.onAllPlatformsDeletion();
        }
    };
    MenuManager.prototype.isViewDeleted = function (idName) {
        var viewMap = this.modelFactory.getMappingModel().getViewMap();
        return this.isDeleted(idName, viewMap, this.viewArray);
    };
    MenuManager.prototype.isAllPlatformsDeleted = function (idName) {
        if (!this.platformStack.length) {
            return true;
        }
        var platformMap = this.modelFactory.getMappingModel().getPlatformMap();
        var deletedPlatform = this.isDeleted(idName, platformMap, this.platformArray);
        var platformIndex = this.platformStack.indexOf(deletedPlatform);
        this.platformStack.slice(platformIndex);
    };
    MenuManager.prototype.isDeleted = function (idName, valueMap, insertionArray) {
        valueMap.forEach(function (value, key) {
            if (~Object.keys(value).indexOf(idName)) {
                insertionArray = insertionArray.find(function (item) {
                    if (item.menuName === key) {
                        return true;
                    }
                });
                var insertionValueArray = insertionArray.values;
                if (!insertionValueArray.length) {
                    return key;
                }
                var idIndex = insertionValueArray.indexOf(idName);
                insertionValueArray.slice(idIndex);
            }
        });
        return null;
    };
    MenuManager.prototype.responseIsArrayOfArrays = function (eventLayers) {
        for (var item in eventLayers) {
            if (eventLayers[item] instanceof Array) {
                return true;
            }
        }
    };
    return MenuManager;
}());
exports.MenuManager = MenuManager;
//# sourceMappingURL=MenuManager.js.map