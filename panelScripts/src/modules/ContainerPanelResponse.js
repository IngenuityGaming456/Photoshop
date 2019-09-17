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
var ContainerPanelResponse = /** @class */ (function () {
    function ContainerPanelResponse(modelFactory) {
        this.modelFactory = modelFactory;
    }
    ContainerPanelResponse.prototype.execute = function (params) {
        this.generator = params.generator;
        this.subscribeListeners();
        this.getDataForChanges();
    };
    ContainerPanelResponse.prototype.subscribeListeners = function () {
        var _this = this;
        this.generator.on("layersDeleted", function (eventLayers) { return _this.onLayersDeleted(eventLayers); });
    };
    ContainerPanelResponse.prototype.onLayersDeleted = function (eventLayers) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _i, item, deletedObj;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = [];
                        for (_b in eventLayers)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        item = _a[_i];
                        if (!eventLayers.hasOwnProperty(item)) return [3 /*break*/, 3];
                        deletedObj = eventLayers[item];
                        return [4 /*yield*/, this.generator.evaluateJSXFile("")];
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
    ContainerPanelResponse.prototype.getDataForChanges = function () {
        var previousResponse = this.modelFactory.getPhotoshopModel().previousContainerResponse;
        var currentResponse = this.modelFactory.getPhotoshopModel().currentContainerResponse;
        var viewMap = this.modelFactory.getMappingModel().getViewMap();
        var clickedMenus = this.modelFactory.getPhotoshopModel().clickedMenuNames;
        this.getChanges(previousResponse, currentResponse, viewMap, clickedMenus);
    };
    ContainerPanelResponse.prototype.getChanges = function (previousResponseMap, responseMap, viewsMap, clickedMenus) {
        var _this = this;
        clickedMenus.forEach(function (item) {
            var viewObj = viewsMap.get(item);
            var viewKeys = Object.keys(viewObj);
            _this.handleViewKeys(viewKeys, previousResponseMap, responseMap);
        });
    };
    ContainerPanelResponse.prototype.handleViewKeys = function (viewKeys, previousResponseMap, responseMap) {
        var _this = this;
        viewKeys.forEach(function (item) {
            _this.sendJsonChanges(previousResponseMap.get(item), responseMap.get(item));
        });
    };
    ContainerPanelResponse.prototype.sendJsonChanges = function (previousJson, currentJson) {
        var previousBaseChild = previousJson[Object.keys(previousJson)[0]];
        var currentBaseChild = currentJson[Object.keys(currentJson)[0]];
        for (var key in currentBaseChild) {
            if (currentBaseChild.hasOwnProperty(key)) {
                if (!previousBaseChild[key]) {
                    this.sendAdditionRequest(Object.keys(previousJson)[0], currentBaseChild[key]);
                }
            }
        }
        for (var key in previousBaseChild) {
            if (previousBaseChild.hasOwnProperty(key)) {
                if (!currentBaseChild[key]) {
                    this.sendDeletionRequest(Object.keys(previousJson)[0], previousBaseChild[key]);
                }
            }
        }
    };
    ContainerPanelResponse.prototype.sendAdditionRequest = function (baseKey, currentObj) {
        console.log(baseKey, currentObj);
    };
    ContainerPanelResponse.prototype.sendDeletionRequest = function (baseKey, previousObj) {
        console.log(baseKey, previousObj);
    };
    return ContainerPanelResponse;
}());
exports.ContainerPanelResponse = ContainerPanelResponse;
//# sourceMappingURL=ContainerPanelResponse.js.map