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
var PhotoshopFactory_1 = require("./PhotoshopFactory");
var events_1 = require("events");
var HandleUndo_1 = require("./HandleUndo");
var DocumentStabalizer_1 = require("./DocumentStabalizer");
var fs = require("fs");
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
        this.generator.on("activeDocumentChanged", function (changeId) {
            _this.activeId.id = changeId;
            _this.onDocumentOpen(changeId);
        });
        this.documentManager.on("documentResolved", function () {
            _this.generator.emit("documentResolved");
        });
        this.generator.onPhotoshopEvent("generatorMenuChanged", function (event) { return _this.onButtonMenuClicked(event); });
    };
    DocumentStarter.prototype.onDocumentOpen = function (openId) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.activeDocument && this.activeDocument.id !== openId) {
                    this.loggerEmitter.emit("newDocument");
                    this.docEmitter.emit("newDocument");
                    return [2 /*return*/];
                }
                if (this.activeDocument && this.activeDocument.id === openId) {
                    this.loggerEmitter.emit("currentDocument");
                    this.docEmitter.emit("currentDocument");
                    return [2 /*return*/];
                }
                this.generator.on("closedDocument", function (closeId) { return _this.onDocumentClose(closeId); });
                this.generator.on("save", function () {
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
        this.generator.once("PanelsConnected", function () {
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
            this.io = null;
            this.generator.removeAllListeners("PanelsConnected");
        }
        this.io = require('socket.io')(8099);
        console.log("making a socket connection");
        this.io.on("connection", function (socket) {
            _this.applySocketListeners(socket);
        });
    };
    DocumentStarter.prototype.applySocketListeners = function (socket) {
        var _this = this;
        socket.on("register", function (name) {
            _this.handleSocketClients(name, socket);
            if (Object.keys(_this.connectedSockets).length === 2) {
                _this.generator.emit("PanelsConnected");
            }
        });
    };
    DocumentStarter.prototype.handleSocketClients = function (name, socket) {
        var _this = this;
        if (name === "htmlPanel") {
            this.htmlSocket = socket;
            if (this.activeDocument) {
                this.docEmitter.emit("getUpdatedHTMLSocket", this.htmlSocket);
                this.htmlSocket.emit("docOpen", this.activeDocument.directory, this.docId);
            }
            socket.on("getQuestJson", function (storage, checkBoxes) {
                _this.checkedBoxes = checkBoxes;
                _this.modelFactory.handleSocketStorage(storage);
                _this.setViewMap();
            });
        }
        if (name === "validatorPanel") {
            socket.emit("getStorage", this.docId);
            this.loggerEmitter.emit("getUpdatedValidatorSocket", socket);
        }
        if (this.activeId.id && this.activeDocument && this.activeId.id !== this.activeDocument.id) {
            socket.emit("disablePage");
        }
        socket.on('disconnect', function (reason) {
            console.log(reason);
        });
        this.connectedSockets[name] = true;
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
                FactoryClass_1.execute(factoryObj, { generator: this.generator, docEmitter: this.docEmitter, menuName: menu.name, activeDocument: this.activeDocument,
                    storage: { factoryMap: elementMap, menuState: this.imageState } });
            }
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
    DocumentStarter.prototype.sendToHTMLSocket = function () {
        this.htmlSocket.emit("docOpen", this.activeDocument.directory, this.docId);
    };
    DocumentStarter.prototype.restorePhotoshop = function () {
        this.removeListeners();
        this.applyDocumentListeners();
    };
    DocumentStarter.prototype.removeListeners = function () {
        this.docEmitter.removeAllListeners();
        this.generator.removeAllListeners("layersAdded");
        this.generator.removeAllListeners("layerRenamed");
        this.generator.removeAllListeners("layersDeleted");
        this.generator.removeAllListeners("select");
        this.generator.removeAllListeners("copy");
        this.generator.removeAllListeners("paste");
        this.generator.removeAllListeners("save");
        this.generator.removeAllListeners("closedDocument");
        this.generator.removeAllListeners("PanelsConnected");
        this.generator.removeAllListeners("copyToLayer");
        this.generator.removeAllListeners("duplicate");
        this.generator.removeAllListeners("writeData");
    };
    DocumentStarter.prototype.applyDocumentListeners = function () {
        var _this = this;
        this.docEmitter.on("logWarning", function (loggerType) {
            _this.loggerEmitter.emit("logWarning", loggerType);
        });
        this.docEmitter.on("logError", function (id, key, loggerType) {
            _this.loggerEmitter.emit("logError", id, key, loggerType);
        });
        this.docEmitter.on("logStatus", function (message) {
            _this.loggerEmitter.emit("logStatus", message);
        });
        this.docEmitter.on("removeError", function (id) {
            _this.loggerEmitter.emit("removeError", id);
        });
        this.docEmitter.on("containerPanelReady", function () {
            _this.docEmitter.emit("getUpdatedHTMLSocket", _this.htmlSocket);
        });
        this.generator.on("closedDocument", function (closeId) {
            _this.onDocumentClose(closeId);
        });
        this.generator.on("save", function () { _this.onSave(); });
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
                        this.generator.emit("docId", this.docId);
                        return [2 /*return*/];
                }
            });
        });
    };
    DocumentStarter.prototype.createDependencies = function () {
        var undoHandle = FactoryClass_1.inject({ ref: HandleUndo_1.HandleUndo, dep: [ModelFactory_1.ModelFactory] });
        FactoryClass_1.execute(undoHandle, { generator: this.generator });
        var layerManager = FactoryClass_1.inject({ ref: LayerManager_1.LayerManager, dep: [ModelFactory_1.ModelFactory] });
        FactoryClass_1.execute(layerManager, { generator: this.generator, docEmitter: this.docEmitter, activeDocument: this.activeDocument });
        var validation = FactoryClass_1.inject({ ref: Validation_1.Validation, dep: [ModelFactory_1.ModelFactory] });
        FactoryClass_1.execute(validation, { generator: this.generator, docEmitter: this.docEmitter, activeDocument: this.activeDocument });
        var photoshopFactory = FactoryClass_1.inject({ ref: PhotoshopFactory_1.PhotoshopFactory, dep: [ModelFactory_1.ModelFactory] });
        FactoryClass_1.execute(photoshopFactory, { generator: this.generator, docEmitter: this.docEmitter });
        var containerResponse = FactoryClass_1.inject({ ref: ContainerPanelResponse_1.ContainerPanelResponse, dep: [ModelFactory_1.ModelFactory, PhotoshopFactory_1.PhotoshopFactory] });
        FactoryClass_1.execute(containerResponse, { generator: this.generator, activeDocument: this.activeDocument, docEmitter: this.docEmitter,
            storage: { documentManager: this.documentManager } });
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
                this.loggerEmitter.emit("activeDocument", this.docId);
                this.loggerEmitter.emit("logStatus", "Document is Saved");
                this.loggerEmitter.emit("logStatus", "The document file id is " + this.docId);
                return [2 /*return*/];
            });
        });
    };
    DocumentStarter.prototype.onSave = function () {
        if (!this.activeDocument || this.activeDocument && this.activeId.id && this.activeId.id !== this.activeDocument.id) {
            return;
        }
        this.loggerEmitter.emit("logStatus", "Document is Saved");
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
        FactoryClass_1.execute(eventSubject, { generator: this.generator, activeDocument: this.activeDocument, docEmitter: this.docEmitter,
            storage: { docId: this.docId, activeId: this.activeId } });
    };
    DocumentStarter.prototype.instantiateDocumentModel = function () {
        this.modelFactory = FactoryClass_1.inject({ ref: ModelFactory_1.ModelFactory, dep: [] });
        FactoryClass_1.execute(this.modelFactory, { generator: this.generator, activeDocument: this.activeDocument,
            docEmitter: this.docEmitter, storage: { openDocumentData: this.openDocumentData } });
    };
    ;
    DocumentStarter.prototype.onDocumentClose = function (closeId) {
        if (this.activeDocument && closeId === this.activeDocument.id) {
            this.activeDocument = null;
            this.docId = null;
            FactoryClass_1.FactoryClass.factoryInstance = null;
            this.checkedBoxes = null;
            this.connectedSockets = {};
            this.removeListeners();
            if (this.io) {
                this.io.close();
                this.io = null;
            }
            this.loggerEmitter.emit("destroy");
            this.docEmitter.emit("destroy");
        }
        if (!this.activeDocument) {
            this.generator.removeAllListeners("closedDocument");
            this.generator.removeAllListeners("save");
        }
    };
    return DocumentStarter;
}());
exports.DocumentStarter = DocumentStarter;
//# sourceMappingURL=DocumentStarter.js.map