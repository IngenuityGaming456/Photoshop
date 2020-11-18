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
exports.Validation = void 0;
var utils_1 = require("../utils/utils");
var path = require("path");
var constants_1 = require("../constants");
var languagesJson = require("../res/languages.json");
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
        this.generator.on(constants_1.photoshopConstants.generator.layerRenamed, function (eventLayers) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.onLayersRename(eventLayers)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); }); });
        this.generator.on(constants_1.photoshopConstants.generator.layersDeleted, function (eventLayers) { return _this.onLayersDeleted(eventLayers); });
        this.generator.on(constants_1.photoshopConstants.generator.layersAdded, function (eventLayers) { return _this.waitForDocumentResolution(eventLayers); });
        this.generator.on(constants_1.photoshopConstants.generator.layersAdded, function (eventLayers) { return _this.checkForNumericName(eventLayers); });
        this.generator.on(constants_1.photoshopConstants.generator.layersMoved, function (eventLayers) { return _this.waitForDocumentResolution(eventLayers); });
        this.docEmitter.on(constants_1.photoshopConstants.emitter.layersMovedMock, function (eventLayers) { return _this.onLayersLocalised(eventLayers, true); });
    };
    Validation.prototype.checkForNumericName = function (eventLayers) {
        utils_1.utlis.traverseAddedLayers(eventLayers, this.isNumericInAdded.bind(this));
    };
    Validation.prototype.isNumericInAdded = function (item) {
        if (~item.name.search(/^[\W\d_]+/)) {
            this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, "Not allowed to add Items with special characters");
            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), { id: item.id });
        }
    };
    Validation.prototype.isInHTML = function (key, id, questArray, drawnQuestItems) {
        if (~questArray.indexOf(key) && !utils_1.utlis.isIDExists(id, drawnQuestItems) && !~this.alreadyRenamed.indexOf(id)) {
            this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, "Not allowed to create HTML Container, " + key + " with id = " + id);
            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), { id: id });
            throw new Error("Validation Stopped");
        }
        return this;
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
    Validation.prototype.waitForDocumentResolution = function (eventLayers, isOmit) {
        var _this = this;
        this.generator.once(constants_1.photoshopConstants.generator.documentResolved, function () { return _this.onLayersLocalised(eventLayers, isOmit); });
    };
    Validation.prototype.onLayersLocalised = function (eventLayers, isOmit) {
        return __awaiter(this, void 0, void 0, function () {
            var localisationStructure, langIds, langIds_1, langIds_1_1, langId, langRef, langStructArray, langStructArrays, langStructArrays_1, langStructArrays_1_1, langArray, compareStruct, e_1_1, e_2_1;
            var e_2, _a, e_1, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        localisationStructure = this.modelFactory.getPhotoshopModel().docLocalisationStruct;
                        langIds = localisationStructure && Object.keys(localisationStructure);
                        if (!langIds) {
                            return [2 /*return*/];
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 12, 13, 14]);
                        langIds_1 = __values(langIds), langIds_1_1 = langIds_1.next();
                        _c.label = 2;
                    case 2:
                        if (!!langIds_1_1.done) return [3 /*break*/, 11];
                        langId = langIds_1_1.value;
                        langRef = utils_1.utlis.isIDExistsRec(langId, eventLayers);
                        if (!langRef) return [3 /*break*/, 10];
                        langStructArray = [];
                        this.createLangStructArray(langStructArray, eventLayers, langRef);
                        langStructArrays = utils_1.utlis.breakArrayOnTrue(langStructArray);
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 8, 9, 10]);
                        langStructArrays_1 = (e_1 = void 0, __values(langStructArrays)), langStructArrays_1_1 = langStructArrays_1.next();
                        _c.label = 4;
                    case 4:
                        if (!!langStructArrays_1_1.done) return [3 /*break*/, 7];
                        langArray = langStructArrays_1_1.value;
                        this.modifyLangArray(langArray);
                        compareStruct = this.makeCompareStruct(langArray);
                        return [4 /*yield*/, this.compareLocalisation(compareStruct, localisationStructure, langRef.id, isOmit)];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6:
                        langStructArrays_1_1 = langStructArrays_1.next();
                        return [3 /*break*/, 4];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_1_1 = _c.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 10];
                    case 9:
                        try {
                            if (langStructArrays_1_1 && !langStructArrays_1_1.done && (_b = langStructArrays_1.return)) _b.call(langStructArrays_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 10:
                        langIds_1_1 = langIds_1.next();
                        return [3 /*break*/, 2];
                    case 11: return [3 /*break*/, 14];
                    case 12:
                        e_2_1 = _c.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 14];
                    case 13:
                        try {
                            if (langIds_1_1 && !langIds_1_1.done && (_a = langIds_1.return)) _a.call(langIds_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    Validation.prototype.modifyLangArray = function (langArray) {
        var langId = langArray[0];
        var langIdRef = this.activeDocument.layers.findLayer(langId);
        if (!(~languagesJson["languages"].indexOf(langIdRef.layer.name))) {
            var actualLangId = langIdRef.layer.group.id;
            langArray.unshift(actualLangId);
        }
    };
    Validation.prototype.createLangStructArray = function (langStructArray, eventLayers, langRef) {
        var _this = this;
        eventLayers.forEach(function (layer) {
            if (layer.id > langRef.id) {
                langStructArray.push(layer.id);
            }
            if (layer.layers) {
                _this.createLangStructArray(langStructArray, layer.layers, langRef);
            }
            else {
                langStructArray.push(true);
            }
        });
    };
    Validation.prototype.makeCompareStruct = function (langStructArray) {
        var localisedObj = this.interpretLocalisedStruct(langStructArray);
        var localisedLayers = localisedObj.localised;
        var localisedStruct = localisedObj.struct;
        return {
            langId: langStructArray[0],
            localisedLayers: localisedLayers,
            localisedStruct: localisedStruct
        };
    };
    Validation.prototype.interpretLocalisedStruct = function (langStructArray) {
        var langStructLength = langStructArray.length;
        var trueIndex = langStructLength + 1;
        var localisedArray = [];
        var structArray = [];
        for (var index in langStructArray) {
            if (langStructArray[index] === true) {
                trueIndex = index;
                break;
            }
        }
        for (var i = trueIndex - 1; i < langStructLength; i = i + 2) {
            localisedArray.push(langStructArray[i]);
        }
        for (var i = 1; i <= trueIndex - 2; i++) {
            structArray.push(langStructArray[i]);
        }
        return {
            localised: localisedArray,
            struct: structArray
        };
    };
    Validation.prototype.compareLocalisation = function (compareStruct, localisationStructure, langId, isOmit) {
        return __awaiter(this, void 0, void 0, function () {
            var langRef, langName, toCompareWith, _a, _b, item, localisedRef, localisedObj, e_3_1;
            var e_3, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        langRef = this.activeDocument.layers.findLayer(compareStruct.langId);
                        if (!langRef) {
                            return [2 /*return*/];
                        }
                        langName = langRef.layer.name;
                        toCompareWith = localisationStructure[langId][langName];
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 7, 8, 9]);
                        _a = __values(compareStruct.localisedLayers), _b = _a.next();
                        _d.label = 2;
                    case 2:
                        if (!!_b.done) return [3 /*break*/, 6];
                        item = _b.value;
                        localisedRef = this.activeDocument.layers.findLayer(item);
                        if (!(!localisedRef && item === 100000)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.showLocalisationWarning(compareStruct.localisedStruct, langId, langName)];
                    case 3:
                        localisedObj = _d.sent();
                        this.docEmitter.emit(constants_1.photoshopConstants.emitter.layersLocalised, localisedObj);
                        return [2 /*return*/];
                    case 4:
                        if (!localisedRef) {
                            return [2 /*return*/];
                        }
                        this.compareFromLocalisedName(localisedRef, toCompareWith, compareStruct.localisedStruct, langId, langName, isOmit);
                        _d.label = 5;
                    case 5:
                        _b = _a.next();
                        return [3 /*break*/, 2];
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        e_3_1 = _d.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 9];
                    case 8:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    Validation.prototype.compareFromLocalisedName = function (localisedRef, toCompareWith, compareStruct, langId, langName, isOmit) {
        var e_4, _a;
        var compareArray = [];
        for (var key in toCompareWith) {
            if (!toCompareWith.hasOwnProperty(key)) {
                continue;
            }
            var struct = toCompareWith[key]["struct"];
            var structNames = this.getStructNames(struct);
            var compareStructNames = this.getCompareStructNames(compareStruct);
            if (utils_1.utlis.containAll(structNames, compareStructNames).isTrue) {
                var localisedCompare = this.activeDocument.layers.findLayer(toCompareWith[key]["localise"]);
                var localisedCompareName = localisedCompare.layer.name;
                var localisedCompareId = localisedCompare.layer.id;
                if (localisedCompareName !== localisedRef.layer.name) {
                    compareArray.push({ isTrue: false });
                }
                else {
                    compareArray.push({ isTrue: true, id: localisedCompareId });
                }
            }
        }
        try {
            for (var compareArray_1 = __values(compareArray), compareArray_1_1 = compareArray_1.next(); !compareArray_1_1.done; compareArray_1_1 = compareArray_1.next()) {
                var item = compareArray_1_1.value;
                if (item.isTrue === true) {
                    console.log("Same Image Entered");
                    this.docEmitter.emit(constants_1.photoshopConstants.emitter.layersLocalised, {
                        toBeLocalised: [],
                        notToBeLocalised: [item.id]
                    });
                    return;
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (compareArray_1_1 && !compareArray_1_1.done && (_a = compareArray_1.return)) _a.call(compareArray_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
        this.checkImageStatus(localisedRef, compareStruct, langId, langName, isOmit);
    };
    Validation.prototype.getStructNames = function (struct) {
        var e_5, _a;
        var structNames = [];
        try {
            for (var struct_1 = __values(struct), struct_1_1 = struct_1.next(); !struct_1_1.done; struct_1_1 = struct_1.next()) {
                var item = struct_1_1.value;
                structNames.push(item.name);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (struct_1_1 && !struct_1_1.done && (_a = struct_1.return)) _a.call(struct_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return structNames;
    };
    Validation.prototype.getCompareStructNames = function (compareStruct) {
        var e_6, _a;
        var compareStructNames = [];
        try {
            for (var compareStruct_1 = __values(compareStruct), compareStruct_1_1 = compareStruct_1.next(); !compareStruct_1_1.done; compareStruct_1_1 = compareStruct_1.next()) {
                var item = compareStruct_1_1.value;
                var layerName = this.activeDocument.layers.findLayer(item).layer.name;
                compareStructNames.push(layerName);
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (compareStruct_1_1 && !compareStruct_1_1.done && (_a = compareStruct_1.return)) _a.call(compareStruct_1);
            }
            finally { if (e_6) throw e_6.error; }
        }
        return compareStructNames;
    };
    Validation.prototype.checkImageStatus = function (localisedRef, compareStruct, langId, langName, isOmit) {
        return __awaiter(this, void 0, void 0, function () {
            var localisedId, localisedObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        localisedId = localisedRef.layer.id;
                        if (!isOmit) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.showLocalisationWarning(compareStruct, langId, langName)];
                    case 1:
                        localisedObj = _a.sent();
                        this.docEmitter.emit(constants_1.photoshopConstants.emitter.layersLocalised, localisedObj);
                        return [2 /*return*/];
                    case 2:
                        if (this.isInvalidImage(compareStruct, langId, langName)) {
                            this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, "Can't enter new image without localising old ones");
                            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), { id: localisedId });
                        }
                        if (this.isLocalisationSafe(compareStruct, langId, langName)) {
                            console.log("add without any issues");
                        }
                        else {
                            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), { id: localisedId });
                            this.showLocalisationWarning(compareStruct, langId, langName);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Validation.prototype.isInvalidImage = function (compareStruct, langId, langName) {
        var localisedLayers = this.getLocalisedLayers(compareStruct, langId, langName).localisedLayers;
        var localisingLayers = this.getLocalisingLayers(compareStruct);
        return !utils_1.utlis.containAll(localisedLayers, localisingLayers).isTrue;
    };
    Validation.prototype.isLocalisationSafe = function (compareStruct, langId, langName) {
        var localisedLayers = this.getLocalisedLayers(compareStruct, langId, langName).localisedLayers;
        var localisingLayers = this.getLocalisingLayers(compareStruct);
        return utils_1.utlis.containAll(localisedLayers, localisingLayers).isTrue && (localisingLayers.length > localisedLayers.length);
    };
    Validation.prototype.showLocalisationWarning = function (compareStruct, langId, langName) {
        return __awaiter(this, void 0, void 0, function () {
            var localisedObj, localisingLayers, containObj, toBeLocalised, notToBeLocalised, delocalisedLayers, delocalisedLayers_1, delocalisedLayers_1_1, name_1, indexName, id, response, langStruct, langObj, deletionKey, item, deletedLayers, e_7_1;
            var e_7, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        localisedObj = this.getLocalisedLayers(compareStruct, langId, langName);
                        localisingLayers = this.getLocalisingLayers(compareStruct);
                        containObj = utils_1.utlis.containAll(localisedObj.localisedLayers, localisingLayers);
                        toBeLocalised = [];
                        notToBeLocalised = [];
                        if (!!containObj.isTrue) return [3 /*break*/, 8];
                        delocalisedLayers = containObj.delocalisedLayers;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        delocalisedLayers_1 = __values(delocalisedLayers), delocalisedLayers_1_1 = delocalisedLayers_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!delocalisedLayers_1_1.done) return [3 /*break*/, 5];
                        name_1 = delocalisedLayers_1_1.value;
                        indexName = localisedObj.localisedLayers.indexOf(name_1);
                        id = localisedObj.localisedLayersIds[indexName];
                        return [4 /*yield*/, this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/ShowOptionPanel.jsx"), { name: name_1 })];
                    case 3:
                        response = _b.sent();
                        if (response === "no") {
                            langStruct = this.modelFactory.getPhotoshopModel().docLocalisationStruct;
                            langObj = langStruct[langId][langName];
                            deletionKey = void 0;
                            for (item in langObj) {
                                if (!langObj.hasOwnProperty(item)) {
                                    continue;
                                }
                                if (langObj[item]["localise"] === id) {
                                    deletionKey = item;
                                    break;
                                }
                            }
                            delete langObj[deletionKey];
                            notToBeLocalised.push(id);
                            deletedLayers = [];
                            this.deleteLocalisedStructFromPhotoshop(compareStruct[compareStruct.length - 1], null, deletedLayers);
                            this.deleteLayersFromPhotoshop(deletedLayers);
                        }
                        else if (response === "yes") {
                            toBeLocalised.push(id);
                        }
                        _b.label = 4;
                    case 4:
                        delocalisedLayers_1_1 = delocalisedLayers_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_7_1 = _b.sent();
                        e_7 = { error: e_7_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (delocalisedLayers_1_1 && !delocalisedLayers_1_1.done && (_a = delocalisedLayers_1.return)) _a.call(delocalisedLayers_1);
                        }
                        finally { if (e_7) throw e_7.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/, {
                            toBeLocalised: toBeLocalised,
                            notToBeLocalised: notToBeLocalised
                        }];
                }
            });
        });
    };
    Validation.prototype.getLocalisingLayers = function (compareStruct) {
        var e_8, _a;
        var localisingLayers = [];
        var compLocalisedLength = compareStruct.length;
        var localisationContainerId = compareStruct[compLocalisedLength - 1];
        var containerRef = this.activeDocument.layers.findLayer(localisationContainerId);
        var localisingPhotoshopLayers = containerRef && containerRef.layer.layers;
        try {
            for (var localisingPhotoshopLayers_1 = __values(localisingPhotoshopLayers), localisingPhotoshopLayers_1_1 = localisingPhotoshopLayers_1.next(); !localisingPhotoshopLayers_1_1.done; localisingPhotoshopLayers_1_1 = localisingPhotoshopLayers_1.next()) {
                var item = localisingPhotoshopLayers_1_1.value;
                localisingLayers.push(item.name);
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (localisingPhotoshopLayers_1_1 && !localisingPhotoshopLayers_1_1.done && (_a = localisingPhotoshopLayers_1.return)) _a.call(localisingPhotoshopLayers_1);
            }
            finally { if (e_8) throw e_8.error; }
        }
        return localisingLayers;
    };
    Validation.prototype.getLocalisedLayers = function (compareStruct, langId, langName) {
        var localisedLayers = [];
        var localisedLayersIds = [];
        var localisationStructure = this.modelFactory.getPhotoshopModel().docLocalisationStruct;
        var langStruct = localisationStructure[langId][langName];
        for (var item in langStruct) {
            if (!langStruct.hasOwnProperty(item)) {
                continue;
            }
            var struct = langStruct[item]["struct"];
            var structNames = this.getStructNames(struct);
            var compareStructNames = this.getCompareStructNames(compareStruct);
            if (utils_1.utlis.containAll(structNames, compareStructNames).isTrue) {
                var localisedLayerId = langStruct[item]["localise"];
                var localisedLayerName = this.activeDocument.layers.findLayer(localisedLayerId).layer.name;
                localisedLayers.push(localisedLayerName);
                localisedLayersIds.push(localisedLayerId);
            }
        }
        return {
            localisedLayers: localisedLayers,
            localisedLayersIds: localisedLayersIds
        };
    };
    Validation.prototype.deleteLocalisedStructFromPhotoshop = function (lastId, previousId, deletedLayers) {
        var lastIdRef = this.activeDocument.layers.findLayer(lastId);
        if (~languagesJson.languages.indexOf(lastIdRef.layer.name)) {
            deletedLayers.push(lastIdRef.layer.id);
            return;
        }
        if (!(lastIdRef.layer.layers && lastIdRef.layer.layers.length)) {
            deletedLayers.push(lastId);
            lastIdRef.layer.group && this.deleteLocalisedStructFromPhotoshop(lastIdRef.layer.group.id, lastId, deletedLayers);
        }
        else {
            if (!utils_1.utlis.isLayerExists(lastIdRef, previousId)) {
                deletedLayers.push(lastId);
                previousId = lastId;
                lastIdRef.layer.group && this.deleteLocalisedStructFromPhotoshop(lastIdRef.layer.group.id, previousId, deletedLayers);
            }
        }
    };
    Validation.prototype.deleteLayersFromPhotoshop = function (deletedLayers) {
        var e_9, _a;
        try {
            for (var deletedLayers_1 = __values(deletedLayers), deletedLayers_1_1 = deletedLayers_1.next(); !deletedLayers_1_1.done; deletedLayers_1_1 = deletedLayers_1.next()) {
                var item = deletedLayers_1_1.value;
                this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), { id: item });
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (deletedLayers_1_1 && !deletedLayers_1_1.done && (_a = deletedLayers_1.return)) _a.call(deletedLayers_1);
            }
            finally { if (e_9) throw e_9.error; }
        }
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
                            .isInHTML(eventLayers[0].name, eventLayers[0].id, questArray, drawnQuestItems)
                            .isNumeric(eventLayers[0].name, eventLayers[0].id)
                            .renameSelfStructures(eventLayers[0].name, eventLayers[0].id);
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
            var selectedIdPrevName, layerId, layerRef, questItem;
            return __generator(this, function (_a) {
                selectedIdPrevName = this.modelFactory.getPhotoshopModel().selectedName;
                layerId = this.modelFactory.getPhotoshopModel().selectedNameId;
                if (this.modelFactory.getPhotoshopModel().isRemoval) {
                    if (this.modelFactory.getPhotoshopModel().lastRemovalId === Number(id)) {
                        this.modelFactory.getPhotoshopModel().isRemoval = false;
                    }
                    throw new Error("Validation Stop");
                }
                if (this.modelFactory.getPhotoshopModel().isRenamedFromLayout) {
                    if (this.modelFactory.getPhotoshopModel().lastRename === Number(id)) {
                        this.modelFactory.getPhotoshopModel().isRenamedFromLayout = false;
                    }
                    return [2 /*return*/, this];
                }
                layerRef = this.activeDocument.layers.findLayer(Number(layerId));
                questItem = drawnQuestItems.find(function (item) {
                    if (item.id === id && item.name !== name) {
                        return true;
                    }
                });
                if (questItem && questItem.name !== "generic") {
                    this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, "Not allowed to rename Quest Item, " + questItem.name + " with id = " + id);
                    this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/UndoRenamedLayer.jsx"), { id: questItem.id, name: questItem.name });
                    throw new Error("Validation Stop");
                }
                if (utils_1.utlis.getElementName(layerRef, constants_1.photoshopConstants.languages)) {
                    if (selectedIdPrevName != name) {
                        this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, "Can't rename an item inside languages");
                        this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/UndoRenamedLayer.jsx"), { id: layerRef.layer.id, name: selectedIdPrevName });
                    }
                    throw new Error("Validation Stop");
                }
                return [2 /*return*/, this];
            });
        });
    };
    Validation.prototype.isNumeric = function (name, id) {
        if (~name.search(/^[\W\d_]+/)) {
            var selectedIdPrevName = this.modelFactory.getPhotoshopModel().selectedName;
            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/UndoRenamedLayer.jsx"), { id: id, name: selectedIdPrevName });
            this.docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, "Names Starting with Special characters are not allowed");
            throw new Error("Validation Stop");
        }
        return this;
    };
    Validation.prototype.isErrorFree = function (eventLayers, callback) {
        var e_10, _a;
        var errorData = callback(eventLayers);
        try {
            for (var errorData_1 = __values(errorData), errorData_1_1 = errorData_1.next(); !errorData_1_1.done; errorData_1_1 = errorData_1.next()) {
                var errorElm = errorData_1_1.value;
                utils_1.utlis.spliceFrom(errorElm.id, this.layersErrorData);
                this.docEmitter.emit(constants_1.photoshopConstants.logger.removeError, errorElm.id);
            }
        }
        catch (e_10_1) { e_10 = { error: e_10_1 }; }
        finally {
            try {
                if (errorData_1_1 && !errorData_1_1.done && (_a = errorData_1.return)) _a.call(errorData_1);
            }
            finally { if (e_10) throw e_10.error; }
        }
    };
    Validation.prototype.errorFreeFromRename = function (eventLayers) {
        return this.layersErrorData.filter(function (item) {
            if (item.id === eventLayers[0].id && !~eventLayers[0].name.search(/(Error)/)) {
                return true;
            }
        });
    };
    Validation.prototype.errorFreeFromDeletion = function (eventLayers) {
        return this.layersErrorData.filter(function (item) {
            var isInDeletedLayers = utils_1.utlis.isIDExists(item.id, eventLayers);
            if (isInDeletedLayers) {
                return true;
            }
        });
    };
    Validation.prototype.renameSelfStructures = function (name, id) {
        var elementalMap = this.modelFactory.getPhotoshopModel().viewElementalMap;
        utils_1.utlis.renameElementalMap(elementalMap, name, id);
    };
    return Validation;
}());
exports.Validation = Validation;
//# sourceMappingURL=Validation.js.map