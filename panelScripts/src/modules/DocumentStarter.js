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
var CreateViewStructure_1 = require("./CreateViewStructure");
var ModelFactory_1 = require("../models/ModelFactory");
var CreateComponent_1 = require("./CreateComponent");
var CreateLocalisationStructure_1 = require("./CreateLocalisationStructure");
var FactoryClass_1 = require("./FactoryClass");
var CreateViewClasses_1 = require("./CreateViewClasses");
var CreateTestingStructure_1 = require("./CreateTestingStructure");
var PhotoshopEventSubject_1 = require("../subjects/PhotoshopEventSubject");
var LayerManager_1 = require("./LayerManager");
var Validation_1 = require("./Validation");
var ContainerPanelResponse_1 = require("./ContainerPanelResponse");
var MenuProxyManager_1 = require("../modules/MenuManagers/MenuProxyManager");
var DocumentLogger_1 = require("../logger/DocumentLogger");
var CreateProxyLayout_1 = require("./LayoutStructure/CreateProxyLayout");
var packageJson = require("../../package.json");
var DocumentStarter = /** @class */ (function () {
    function DocumentStarter() {
        this.io = require('socket.io')(8099);
    }
    DocumentStarter.prototype.execute = function (params) {
        this.generator = params.generator;
        this.documentManager = params.storage.documentManager;
        this.startModel = params.storage.startModel;
        this.subscribeListeners();
        this.createDependenciesBeforeSocket();
        this.createSocket();
    };
    DocumentStarter.prototype.createSocket = function () {
        var _this = this;
        console.log("making a socket connection");
        this.io.on("connection", function (socket) {
            _this.socket = socket;
            _this.generator.emit("getUpdatedSocket", _this.socket);
            _this.applySocketListeners();
        });
    };
    DocumentStarter.prototype.applySocketListeners = function () {
        var _this = this;
        this.socket.on("getQuestJson", function (storage) {
            _this.modelFactory.handleSocketStorage(storage);
            _this.setViewMap();
        });
        this.socket.on('disconnect', function (reason) {
            console.log(reason);
        });
    };
    DocumentStarter.prototype.setViewMap = function () {
        var viewsMap = this.modelFactory.getMappingModel().getViewMap();
        this.structureMap.set(viewsMap, {
            ref: CreateViewStructure_1.CreateViewStructure,
            dep: [CreateViewClasses_1.CreateView, ModelFactory_1.ModelFactory]
        });
    };
    DocumentStarter.prototype.subscribeListeners = function () {
        var _this = this;
        this.generator.on("openedDocument", function (openId) {
            _this.onDocumentOpen(openId);
        });
        this.generator.onPhotoshopEvent("generatorMenuChanged", function (event) { return _this.onButtonMenuClicked(event); });
    };
    DocumentStarter.prototype.onButtonMenuClicked = function (event) {
        var menu = event.generatorMenuChanged;
        var elementMap = this.getElementMap(menu.name);
        var classObj = this.structureMap.get(elementMap);
        if (classObj) {
            var factoryObj = FactoryClass_1.inject({ ref: classObj.ref, dep: classObj.dep, isNonSingleton: true });
            FactoryClass_1.execute(factoryObj, { generator: this.generator, menuName: menu.name, activeDocument: this.activeDocument });
        }
    };
    DocumentStarter.prototype.getElementMap = function (menuName) {
        var keysIterable = this.structureMap.keys();
        try {
            for (var keysIterable_1 = __values(keysIterable), keysIterable_1_1 = keysIterable_1.next(); !keysIterable_1_1.done; keysIterable_1_1 = keysIterable_1.next()) {
                var keys = keysIterable_1_1.value;
                if (keys.has(menuName)) {
                    return keys;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (keysIterable_1_1 && !keysIterable_1_1.done && (_a = keysIterable_1.return)) _a.call(keysIterable_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var e_1, _a;
    };
    DocumentStarter.prototype.onDocumentOpen = function (openId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        FactoryClass_1.FactoryClass.factoryInstance = null;
                        this.startModel.allDocumentsMap.set(openId, {});
                        _a = this;
                        return [4 /*yield*/, this.documentManager.getDocument(openId)];
                    case 1:
                        _a.activeDocument = _c.sent();
                        FactoryClass_1.execute(this.startModel, { generator: this.generator, activeDocument: this.activeDocument });
                        _b = this;
                        return [4 /*yield*/, this.startModel.onPhotoshopStart()];
                    case 2:
                        _b.openDocumentData = _c.sent();
                        return [4 /*yield*/, this.setDocumentMetaData()];
                    case 3:
                        _c.sent();
                        this.instantiateStateEvent();
                        this.instantiateDocumentModel();
                        this.createObjects();
                        this.createDependencies();
                        return [4 /*yield*/, this.addMenuItems()];
                    case 4:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DocumentStarter.prototype.setDocumentMetaData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var docId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.openDocumentData) return [3 /*break*/, 2];
                        docId = Math.floor(Math.random() * 5000);
                        return [4 /*yield*/, this.generator.setDocumentSettingsForPlugin({ docId: docId }, packageJson.name + "Document")];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    DocumentStarter.prototype.createDependencies = function () {
        var layerManager = FactoryClass_1.inject({ ref: LayerManager_1.LayerManager, dep: [] });
        FactoryClass_1.execute(layerManager, { generator: this.generator, activeDocument: this.activeDocument });
        var containerResponse = FactoryClass_1.inject({ ref: ContainerPanelResponse_1.ContainerPanelResponse, dep: [ModelFactory_1.ModelFactory] });
        FactoryClass_1.execute(containerResponse, { generator: this.generator, activeDocument: this.activeDocument });
        var validation = FactoryClass_1.inject({ ref: Validation_1.Validation, dep: [ModelFactory_1.ModelFactory] });
        FactoryClass_1.execute(validation, { generator: this.generator, activeDocument: this.activeDocument });
        this.menuManager = FactoryClass_1.inject({ ref: MenuProxyManager_1.MenuProxyManager, dep: [ModelFactory_1.ModelFactory] });
    };
    DocumentStarter.prototype.createDependenciesBeforeSocket = function () {
        var documentLogger = FactoryClass_1.inject({ ref: DocumentLogger_1.DocumentLogger, dep: [] });
        FactoryClass_1.execute(documentLogger, { generator: this.generator });
    };
    DocumentStarter.prototype.addMenuItems = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                FactoryClass_1.execute(this.menuManager, { generator: this.generator });
                return [2 /*return*/];
            });
        });
    };
    DocumentStarter.prototype.createObjects = function () {
        this.structureMap = new Map();
        this.mapFactory = this.modelFactory.getMappingModel();
        this.structureMap
            .set(this.mapFactory.getComponentsMap(), {
            ref: CreateComponent_1.CreateComponent,
            dep: [ModelFactory_1.ModelFactory]
        })
            .set(this.mapFactory.getPlatformMap(), {
            ref: CreateViewStructure_1.CreateViewStructure,
            dep: [CreateViewClasses_1.CreatePlatform, ModelFactory_1.ModelFactory],
        })
            .set(this.mapFactory.getLayoutMap(), {
            ref: CreateProxyLayout_1.CreateProxyLayout,
            dep: []
        })
            .set(this.mapFactory.getLocalisationMap(), {
            ref: CreateLocalisationStructure_1.CreateLocalisationStructure,
            dep: []
        })
            .set(this.mapFactory.getTestingMap(), {
            ref: CreateTestingStructure_1.CreateTestingStructure,
            dep: []
        });
    };
    DocumentStarter.prototype.instantiateStateEvent = function () {
        var eventSubject = FactoryClass_1.inject({ ref: PhotoshopEventSubject_1.PhotoshopEventSubject, dep: [] });
        FactoryClass_1.execute(eventSubject, { generator: this.generator });
    };
    DocumentStarter.prototype.instantiateDocumentModel = function () {
        this.modelFactory = FactoryClass_1.inject({ ref: ModelFactory_1.ModelFactory, dep: [] });
        FactoryClass_1.execute(this.modelFactory, { generator: this.generator, activeDocument: this.activeDocument,
            storage: { openDocumentData: this.openDocumentData } });
    };
    ;
    return DocumentStarter;
}());
exports.DocumentStarter = DocumentStarter;
//# sourceMappingURL=DocumentStarter.js.map