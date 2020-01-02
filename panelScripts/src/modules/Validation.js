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
var utils_1 = require("../utils/utils");
var path = require("path");
var Validation = /** @class */ (function () {
    function Validation(modelFactory) {
        this.alreadyRenamed = [];
        this.modelFactory = modelFactory;
        this.layersErrorData = this.modelFactory.getPhotoshopModel().allLayersErrorData;
    }
    ;
    Validation.prototype.execute = function (params) {
        this.generator = params.generator;
        this.docEmitter = params.docEmitter;
        this.activeDocument = params.activeDocument;
        this.subscribeListeners();
    };
    Validation.prototype.subscribeListeners = function () {
        var _this = this;
        this.generator.on("layerRenamed", function (eventLayers) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.onLayersRename(eventLayers)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); }); });
        this.generator.on("layersDeleted", function (eventLayers) { return _this.onLayersDeleted(eventLayers); });
    };
    Validation.prototype.isInHTML = function (key, id, questArray, drawnQuestItems) {
        if (~questArray.indexOf(key) && !utils_1.utlis.isIDExists(id, drawnQuestItems) && !~this.alreadyRenamed.indexOf(id)) {
            this.docEmitter.emit("logWarning", "Not allowed to create HTML Container, " + key + " with id = " + id);
            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), { id: id });
        }
    };
    Validation.prototype.onLayersRename = function (eventLayers) {
        return __awaiter(this, void 0, void 0, function () {
            var questArray, drawnQuestItems;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        questArray = this.modelFactory.getPhotoshopModel().allQuestItems;
                        drawnQuestItems = this.modelFactory.getPhotoshopModel().allDrawnQuestItems;
                        return [4 /*yield*/, this.startValidationSequence(eventLayers, questArray, drawnQuestItems)];
                    case 1:
                        _a.sent();
                        this.isErrorFree(eventLayers, this.errorFreeFromRename.bind(this));
                        return [2 /*return*/];
                }
            });
        });
    };
    Validation.prototype.onLayersDeleted = function (eventLayers) {
        this.isErrorFree(eventLayers, this.errorFreeFromDeletion.bind(this));
    };
    Validation.prototype.startValidationSequence = function (eventLayers, questArray, drawnQuestItems) {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.drawnQuestItemsRenamed(eventLayers[0].name, eventLayers[0].id, drawnQuestItems)];
                    case 1:
                        (_a.sent())
                            .isInHTML(eventLayers[0].name, eventLayers[0].id, questArray, drawnQuestItems);
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        console.log("Validation Stopped");
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Validation.prototype.drawnQuestItemsRenamed = function (name, id, drawnQuestItems) {
        return __awaiter(this, void 0, void 0, function () {
            var selectedLayersString, layerId, layerRef, questItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/SelectedLayersIds.jsx"))];
                    case 1:
                        selectedLayersString = _a.sent();
                        layerId = selectedLayersString.toString().split(",")[0];
                        if (this.modelFactory.getPhotoshopModel().isRemoval) {
                            if (this.modelFactory.getPhotoshopModel().lastRemovalId === Number(id)) {
                                this.modelFactory.getPhotoshopModel().isRemoval = false;
                            }
                            throw new Error("Validation Stop");
                        }
                        layerRef = this.activeDocument.layers.findLayer(Number(layerId));
                        questItem = drawnQuestItems.find(function (item) {
                            if (item.id === id && item.name !== name) {
                                return true;
                            }
                        });
                        if (questItem && questItem.name !== "generic") {
                            this.docEmitter.emit("logWarning", "Not allowed to rename Quest Item, " + questItem.name + " with id = " + id);
                            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/UndoRenamedLayer.jsx"), { id: questItem.id, name: questItem.name });
                            throw new Error("Validation Stop");
                        }
                        if (utils_1.utlis.getElementName(layerRef, "languages") && !~this.alreadyRenamed.indexOf(id)) {
                            if (this.modelFactory.getPhotoshopModel().isRenamedFromLayout) {
                                this.modelFactory.getPhotoshopModel().isRenamedFromLayout = false;
                                return [2 /*return*/, this];
                            }
                            this.alreadyRenamed.push(id);
                            this.docEmitter.emit("logWarning", "Can't rename an item inside languages");
                            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/UndoRenamedLayer.jsx"), { id: layerRef.layer.id, name: layerRef.layer.name });
                            throw new Error("Validation Stop");
                        }
                        return [2 /*return*/, this];
                }
            });
        });
    };
    Validation.prototype.isErrorFree = function (eventLayers, callback) {
        var errorData = callback(eventLayers);
        if (errorData) {
            utils_1.utlis.spliceFrom(errorData.id, this.layersErrorData);
            this.docEmitter.emit("removeError", eventLayers[0].id);
        }
    };
    Validation.prototype.errorFreeFromRename = function (eventLayers) {
        return this.layersErrorData.find(function (item) {
            if (item.id === eventLayers[0].id && !~eventLayers[0].name.search(/(Error)/)) {
                return true;
            }
        });
    };
    Validation.prototype.errorFreeFromDeletion = function (eventLayers) {
        return this.layersErrorData.find(function (item) {
            var isInDeletedLayers = utils_1.utlis.isIDExists(item.id, eventLayers);
            if (isInDeletedLayers) {
                return true;
            }
        });
    };
    return Validation;
}());
exports.Validation = Validation;
//# sourceMappingURL=Validation.js.map