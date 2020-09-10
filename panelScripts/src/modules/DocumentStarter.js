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
exports.DocumentStarter = void 0;
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
var PhotoshopFactory_1 = require("./PhotoshopFactory");
var events_1 = require("events");
var DocumentStabalizer_1 = require("./DocumentStabalizer");
var constants_1 = require("../constants");
var fs = require("fs");
var SelfAddedStructures_1 = require("./SelfAddedStructures");
var CreateImport_1 = require("./Import/CreateImport");
var PhotoshopParser_1 = require("./Import/PhotoshopParser");
var packageJson = require("../../package.json");
var DocumentStarter = /** @class */ (function () {
    function DocumentStarter() {
        this.connectedSockets = {};
        this.activeId = { id: null };
        this.imageState = {
            state: false
        };
    }
    DocumentStarter.prototype.execute = function (params) {
        this.generator = params.generator;
        this.documentManager = params.storage.documentManager;
        this.startModel = params.storage.startModel;
        this.createDocumentEventListener();
        this.subscribeListenersBeforeDocument();
        this.createDependenciesBeforeSocket();
    };
    DocumentStarter.prototype.createDocumentEventListener = function () {
        this.docEmitter = new events_1.EventEmitter();
        this.loggerEmitter = new events_1.EventEmitter();
    };
    DocumentStarter.prototype.subscribeListenersBeforeDocument = function () {
        var _this = this;
        this.generator.on(constants_1.photoshopConstants.generator.activeDocumentChanged, function (changeId) {
            _this.activeId.id = changeId;
            _this.onDocumentOpen(changeId);
        });
        this.documentManager.on(constants_1.photoshopConstants.generator.documentResolved, function () {
            _this.generator.emit(constants_1.photoshopConstants.generator.documentResolved);
        });
        this.generator.onPhotoshopEvent(constants_1.photoshopConstants.photoshopEvents.generatorMenuChanged, function (event) { return _this.onButtonMenuClicked(event); });
    };
    DocumentStarter.prototype.onDocumentOpen = function (openId) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.activeDocument && this.activeDocument.id !== openId) {
                    this.generator.emit(constants_1.photoshopConstants.logger.newDocument);
                    this.loggerEmitter.emit(constants_1.photoshopConstants.logger.newDocument);
                    this.docEmitter.emit(constants_1.photoshopConstants.logger.newDocument);
                    return [2 /*return*/];
                }
                if (this.activeDocument && this.activeDocument.id === openId) {
                    this.generator.emit(constants_1.photoshopConstants.logger.currentDocument);
                    this.loggerEmitter.emit(constants_1.photoshopConstants.logger.currentDocument);
                    this.docEmitter.emit(constants_1.photoshopConstants.logger.currentDocument);
                    return [2 /*return*/];
                }
                this.generator.on(constants_1.photoshopConstants.generator.closedDocument, function (closeId) { return _this.onDocumentClose(closeId); });
                this.generator.on(constants_1.photoshopConstants.generator.save, function () {
                    _this.start(openId);
                });
                this.stabalizeDocument();
                return [2 /*return*/];
            });
        });
    };
    DocumentStarter.prototype.start = function (openId) {
        var _this = this;
        this.createSocket();
        this.generator.once(constants_1.photoshopConstants.generator.panelsConnected, function () {
            _this.onPanelsConnected(openId);
        });
    };
    DocumentStarter.prototype.onPanelsConnected = function (openId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.restorePhotoshop();
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
                        this.sendToHTMLSocket();
                        this.instantiateStateEvent();
                        this.instantiateDocumentModel();
                        this.createObjects();
                        return [4 /*yield*/, this.addMenuItems()];
                    case 4:
                        _c.sent();
                        this.createDependencies();
                        return [4 /*yield*/, this.addDocumentStatus()];
                    case 5:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DocumentStarter.prototype.createSocket = function () {
        var _this = this;
        if (this.io) {
            this.io.close();
            this.io = null;
            this.generator.removeAllListeners(constants_1.photoshopConstants.generator.panelsConnected);
        }
        this.io = require('socket.io')(8099);
        console.log("making a socket connection");
        this.io.on("connection", function (socket) {
            _this.applySocketListeners(socket);
        });
    };
    DocumentStarter.prototype.applySocketListeners = function (socket) {
        var _this = this;
        socket.on(constants_1.photoshopConstants.socket.register, function (name) {
            _this.handleSocketClients(name, socket);
            if (Object.keys(_this.connectedSockets).length === 3) {
                _this.generator.emit("PanelsConnected");
            }
        });
    };
    DocumentStarter.prototype.handleSocketClients = function (name, socket) {
        if (name === constants_1.photoshopConstants.htmlPanel) {
            this.createHTMLSocket(socket);
        }
        if (name === constants_1.photoshopConstants.validatorPanel) {
            this.createValidatorSocket(socket);
        }
        if (name === constants_1.photoshopConstants.selfHtmlPanel) {
            this.createSelfHTMLSocket(socket);
        }
        if (this.activeId.id && this.activeDocument && this.activeId.id !== this.activeDocument.id) {
            socket.emit(constants_1.photoshopConstants.socket.disablePage);
        }
        socket.on('disconnect', function (reason) {
            console.log(reason);
        });
        this.connectedSockets[name] = true;
    };
    DocumentStarter.prototype.createHTMLSocket = function (socket) {
        this.htmlSocket = socket;
        if (this.activeDocument) {
            this.docEmitter.emit(constants_1.photoshopConstants.logger.getUpdatedHTMLSocket, this.htmlSocket);
        }
        this.applyQuestListenerOnSocket(socket);
    };
    DocumentStarter.prototype.createValidatorSocket = function (socket) {
        socket.emit(constants_1.photoshopConstants.socket.getStorage, this.docId);
        this.loggerEmitter.emit(constants_1.photoshopConstants.logger.getUpdatedValidatorSocket, socket);
    };
    DocumentStarter.prototype.createSelfHTMLSocket = function (socket) {
        var _this = this;
        socket.on("getRefreshResponse", function (storage) {
            _this.modelFactory.getPhotoshopModel().setRefreshResponse(storage);
        });
        socket.on("getUpdatedDocument", function () { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.generator.getDocumentInfo(undefined)];
                    case 1:
                        result = _a.sent();
                        socket.emit("updatedDocument", result);
                        return [2 /*return*/];
                }
            });
        }); });
        this.applyQuestListenerOnSocket(socket);
    };
    DocumentStarter.prototype.applyQuestListenerOnSocket = function (socket) {
        var _this = this;
        socket.on(constants_1.photoshopConstants.socket.getQuestJson, function (storage, checkBoxes, type, mappingResponse) {
            _this.checkedBoxes = checkBoxes;
            _this.modelFactory.getPhotoshopModel().createPlatformMapping(mappingResponse);
            _this.modelFactory.handleSocketStorage(storage, type);
            _this.setViewMap();
        });
    };
    DocumentStarter.prototype.setViewMap = function () {
        var viewsMap = this.modelFactory.getMappingModel().getViewPlatformMap("desktop");
        this.structureMap.set(viewsMap, {
            ref: CreateViewStructure_1.CreateViewStructure,
            dep: [CreateViewClasses_1.CreateView, ModelFactory_1.ModelFactory, PhotoshopFactory_1.PhotoshopFactory]
        });
    };
    DocumentStarter.prototype.onButtonMenuClicked = function (event) {
        var menu = event.generatorMenuChanged;
        if (menu.name === "generator-assets") {
            this.imageState.state = this.generator.getMenuState(menu.name).checked;
        }
        else if (!this.activeId.id || this.activeId.id && this.activeId.id === this.activeDocument.id) {
            var elementMap = this.getElementMap(menu.name);
            var classObj = this.structureMap.get(elementMap);
            if (classObj) {
                var factoryObj = void 0;
                if (classObj.ref === CreateComponent_1.CreateComponent) {
                    factoryObj = FactoryClass_1.inject({ ref: classObj.ref, dep: classObj.dep });
                }
                else {
                    factoryObj = FactoryClass_1.inject({ ref: classObj.ref, dep: classObj.dep, isNonSingleton: true });
                }
                FactoryClass_1.execute(factoryObj, {
                    generator: this.generator,
                    docEmitter: this.docEmitter,
                    menuName: menu.name,
                    activeDocument: this.activeDocument,
                    storage: { factoryMap: elementMap, menuState: this.imageState, documentManager: this.documentManager }
                });
            }
        }
    };
    DocumentStarter.prototype.getElementMap = function (menuName) {
        var e_1, _a;
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
    };
    DocumentStarter.prototype.sendToHTMLSocket = function () {
        this.htmlSocket.emit(constants_1.photoshopConstants.socket.docOpen, this.activeDocument.directory, this.docId);
    };
    DocumentStarter.prototype.restorePhotoshop = function () {
        this.removeListeners();
        this.applyDocumentListeners();
    };
    DocumentStarter.prototype.removeListeners = function () {
        this.docEmitter.removeAllListeners();
        this.generator.removeAllListeners(constants_1.photoshopConstants.generator.layersAdded);
        this.generator.removeAllListeners(constants_1.photoshopConstants.generator.layerRenamed);
        this.generator.removeAllListeners(constants_1.photoshopConstants.generator.layersDeleted);
        this.generator.removeAllListeners(constants_1.photoshopConstants.generator.select);
        this.generator.removeAllListeners(constants_1.photoshopConstants.generator.copy);
        this.generator.removeAllListeners(constants_1.photoshopConstants.generator.paste);
        this.generator.removeAllListeners(constants_1.photoshopConstants.generator.save);
        this.generator.removeAllListeners(constants_1.photoshopConstants.generator.closedDocument);
        this.generator.removeAllListeners(constants_1.photoshopConstants.generator.panelsConnected);
        this.generator.removeAllListeners(constants_1.photoshopConstants.generator.copyToLayer);
        this.generator.removeAllListeners(constants_1.photoshopConstants.generator.duplicate);
        this.generator.removeAllListeners(constants_1.photoshopConstants.generator.writeData);
        this.generator.removeAllListeners(constants_1.photoshopConstants.generator.docId);
    };
    DocumentStarter.prototype.applyDocumentListeners = function () {
        var _this = this;
        this.docEmitter.on(constants_1.photoshopConstants.logger.logWarning, function (loggerType) {
            _this.loggerEmitter.emit(constants_1.photoshopConstants.logger.logWarning, loggerType);
        });
        this.docEmitter.on(constants_1.photoshopConstants.logger.logError, function (id, key, loggerType) {
            _this.loggerEmitter.emit(constants_1.photoshopConstants.logger.logError, id, key, loggerType);
        });
        this.docEmitter.on(constants_1.photoshopConstants.logger.logStatus, function (message) {
            _this.loggerEmitter.emit(constants_1.photoshopConstants.logger.logStatus, message);
        });
        this.docEmitter.on(constants_1.photoshopConstants.logger.removeError, function (id) {
            _this.loggerEmitter.emit(constants_1.photoshopConstants.logger.removeError, id);
        });
        this.docEmitter.on(constants_1.photoshopConstants.logger.containerPanelReady, function () {
            _this.docEmitter.emit(constants_1.photoshopConstants.logger.getUpdatedHTMLSocket, _this.htmlSocket);
        });
        this.generator.on(constants_1.photoshopConstants.generator.closedDocument, function (closeId) {
            _this.onDocumentClose(closeId);
        });
        this.generator.on(constants_1.photoshopConstants.generator.save, function () {
            _this.onSave();
        });
    };
    DocumentStarter.prototype.setDocumentMetaData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var docIdObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.openDocumentData) return [3 /*break*/, 2];
                        this.docId = Math.floor(Math.random() * 5000);
                        return [4 /*yield*/, this.generator.setDocumentSettingsForPlugin({ docId: this.docId }, packageJson.name + "Document")];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.generator.getDocumentSettingsForPlugin(this.activeDocument.id, packageJson.name + "Document")];
                    case 3:
                        docIdObj = _a.sent();
                        this.docId = docIdObj.docId;
                        _a.label = 4;
                    case 4:
                        this.generator.emit(constants_1.photoshopConstants.generator.docId, this.docId);
                        return [2 /*return*/];
                }
            });
        });
    };
    DocumentStarter.prototype.createDependencies = function () {
        var layerManager = FactoryClass_1.inject({ ref: LayerManager_1.LayerManager, dep: [ModelFactory_1.ModelFactory] });
        FactoryClass_1.execute(layerManager, {
            generator: this.generator,
            docEmitter: this.docEmitter,
            activeDocument: this.activeDocument
        });
        var validation = FactoryClass_1.inject({ ref: Validation_1.Validation, dep: [ModelFactory_1.ModelFactory] });
        FactoryClass_1.execute(validation, {
            generator: this.generator,
            docEmitter: this.docEmitter,
            activeDocument: this.activeDocument
        });
        var photoshopFactory = FactoryClass_1.inject({ ref: PhotoshopFactory_1.PhotoshopFactory, dep: [ModelFactory_1.ModelFactory] });
        FactoryClass_1.execute(photoshopFactory, { generator: this.generator, docEmitter: this.docEmitter });
        var containerResponse = FactoryClass_1.inject({ ref: ContainerPanelResponse_1.ContainerPanelResponse, dep: [ModelFactory_1.ModelFactory, PhotoshopFactory_1.PhotoshopFactory] });
        FactoryClass_1.execute(containerResponse, {
            generator: this.generator, activeDocument: this.activeDocument, docEmitter: this.docEmitter,
            storage: { documentManager: this.documentManager }
        });
        var selfAddedStructures = FactoryClass_1.inject({ ref: SelfAddedStructures_1.SelfAddedStructures, dep: [ModelFactory_1.ModelFactory] });
        FactoryClass_1.execute(selfAddedStructures, {
            generator: this.generator, activeDocument: this.activeDocument, docEmitter: this.docEmitter, storage: { documentManager: this.documentManager }
        });
        var psParser = FactoryClass_1.inject({ ref: PhotoshopParser_1.PhotoshopParser, dep: [] });
    };
    DocumentStarter.prototype.stabalizeDocument = function () {
        var documentStabalizer = FactoryClass_1.inject({ ref: DocumentStabalizer_1.DocumentStabalizer, dep: [] });
        FactoryClass_1.execute(documentStabalizer, { generator: this.generator });
    };
    DocumentStarter.prototype.createDependenciesBeforeSocket = function () {
        var documentLogger = FactoryClass_1.inject({ ref: DocumentLogger_1.DocumentLogger, dep: [] });
        FactoryClass_1.execute(documentLogger, { generator: this.generator, loggerEmitter: this.loggerEmitter });
    };
    DocumentStarter.prototype.addMenuItems = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.menuManager = FactoryClass_1.inject({ ref: MenuProxyManager_1.MenuProxyManager, dep: [ModelFactory_1.ModelFactory] });
                FactoryClass_1.execute(this.menuManager, { generator: this.generator, docEmitter: this.docEmitter });
                return [2 /*return*/];
            });
        });
    };
    DocumentStarter.prototype.addDocumentStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // const menuState = await this.generator.getMenuState("generator-assets");
                // this.imageState.state = menuState.checked;
                this.generator.emit(constants_1.photoshopConstants.generator.activeDocumentId, this.activeDocument.id);
                this.loggerEmitter.emit(constants_1.photoshopConstants.logger.activeDocument, this.docId);
                this.loggerEmitter.emit(constants_1.photoshopConstants.logger.logStatus, "Document is Saved");
                this.loggerEmitter.emit(constants_1.photoshopConstants.logger.logStatus, "The document file id is " + this.docId);
                return [2 /*return*/];
            });
        });
    };
    DocumentStarter.prototype.onSave = function () {
        if (!this.activeDocument || this.activeDocument && this.activeId.id && this.activeId.id !== this.activeDocument.id) {
            return;
        }
        this.loggerEmitter.emit(constants_1.photoshopConstants.logger.logStatus, "Document is Saved");
        if (!this.checkedBoxes) {
            return;
        }
        var filteredPath = this.activeDocument.directory + "\\" + this.docId;
        if (!fs.existsSync(filteredPath)) {
            fs.mkdirSync(filteredPath);
        }
        fs.writeFile(this.activeDocument.directory + "\\" + this.docId + "/CheckedBoxes.json", JSON.stringify({
            checkedBoxes: this.checkedBoxes,
        }), function (err) {
            if (err) {
                console.log("error creating/modifying json file");
            }
        });
    };
    DocumentStarter.prototype.createObjects = function () {
        this.structureMap = new Map();
        this.mapFactory = this.modelFactory.getMappingModel();
        this.structureMap
            .set(this.mapFactory.getImportMap(), {
            ref: CreateImport_1.CreateImport,
            dep: [PhotoshopParser_1.PhotoshopParser, PhotoshopFactory_1.PhotoshopFactory, ModelFactory_1.ModelFactory]
        })
            .set(this.mapFactory.getGenericViewMap(), {
            ref: CreateViewStructure_1.CreateViewStructure,
            dep: [CreateViewClasses_1.CreateView, ModelFactory_1.ModelFactory, PhotoshopFactory_1.PhotoshopFactory]
        })
            .set(this.mapFactory.getComponentsMap(), {
            ref: CreateComponent_1.CreateComponent,
            dep: [ModelFactory_1.ModelFactory]
        })
            .set(this.mapFactory.getPlatformMap(), {
            ref: CreateViewStructure_1.CreateViewStructure,
            dep: [CreateViewClasses_1.CreatePlatform, ModelFactory_1.ModelFactory, PhotoshopFactory_1.PhotoshopFactory],
        })
            .set(this.mapFactory.getLayoutMap(), {
            ref: CreateProxyLayout_1.CreateProxyLayout,
            dep: [ModelFactory_1.ModelFactory]
        })
            .set(this.mapFactory.getLocalisationMap(), {
            ref: CreateLocalisationStructure_1.CreateLocalisationStructure,
            dep: [ModelFactory_1.ModelFactory]
        })
            .set(this.mapFactory.getTestingMap(), {
            ref: CreateTestingStructure_1.CreateTestingStructure,
            dep: [ModelFactory_1.ModelFactory]
        });
    };
    DocumentStarter.prototype.instantiateStateEvent = function () {
        var eventSubject = FactoryClass_1.inject({ ref: PhotoshopEventSubject_1.PhotoshopEventSubject, dep: [] });
        FactoryClass_1.execute(eventSubject, {
            generator: this.generator, activeDocument: this.activeDocument, docEmitter: this.docEmitter,
            storage: { docId: this.docId, activeId: this.activeId }
        });
    };
    DocumentStarter.prototype.instantiateDocumentModel = function () {
        this.modelFactory = FactoryClass_1.inject({ ref: ModelFactory_1.ModelFactory, dep: [] });
        FactoryClass_1.execute(this.modelFactory, {
            generator: this.generator, activeDocument: this.activeDocument,
            docEmitter: this.docEmitter, storage: { openDocumentData: this.openDocumentData }
        });
    };
    ;
    DocumentStarter.prototype.onDocumentClose = function (closeId) {
        if (this.activeDocument && closeId === this.activeDocument.id) {
            this.activeDocument = null;
            this.docId = null;
            FactoryClass_1.FactoryClass.factoryInstance = null;
            this.checkedBoxes = null;
            this.connectedSockets = {};
            this.loggerEmitter.emit(constants_1.photoshopConstants.logger.destroy);
            this.docEmitter.emit(constants_1.photoshopConstants.logger.destroy);
            this.generator.emit(constants_1.photoshopConstants.generator.activeDocumentClosed);
            this.removeListeners();
            this.startModel.onPhotoshopClose();
            this.io && this.io.close();
            this.io = null;
        }
        if (!this.activeDocument) {
            this.generator.removeAllListeners(constants_1.photoshopConstants.generator.closedDocument);
            this.generator.removeAllListeners(constants_1.photoshopConstants.generator.save);
            this.io && this.io.close();
            this.io = null;
        }
    };
    return DocumentStarter;
}());
exports.DocumentStarter = DocumentStarter;
//# sourceMappingURL=DocumentStarter.js.map