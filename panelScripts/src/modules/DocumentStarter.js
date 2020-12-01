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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentStarter = void 0;
const CreateViewStructure_1 = require("./CreateViewStructure");
const ModelFactory_1 = require("../models/ModelFactory");
const CreateComponent_1 = require("./Components/CreateComponent");
const CreateLocalisationStructure_1 = require("./CreateLocalisationStructure");
const FactoryClass_1 = require("./FactoryClass");
const CreateViewClasses_1 = require("./CreateViewClasses");
const CreateTestingStructure_1 = require("./CreateTestingStructure");
const PhotoshopEventSubject_1 = require("../subjects/PhotoshopEventSubject");
const LayerManager_1 = require("./LayerManager");
const Validation_1 = require("./Validation");
const ContainerPanelResponse_1 = require("./ContainerPanelResponse");
const MenuProxyManager_1 = require("../modules/MenuManagers/MenuProxyManager");
const DocumentLogger_1 = require("../logger/DocumentLogger");
const CreateProxyLayout_1 = require("./LayoutStructure/CreateProxyLayout");
const PhotoshopFactory_1 = require("./PhotoshopFactory");
const events_1 = require("events");
const DocumentStabalizer_1 = require("./DocumentStabalizer");
const constants_1 = require("../constants");
const fs = require("fs");
const SelfAddedStructures_1 = require("./SelfAddedStructures");
const CreateImport_1 = require("./Import/CreateImport");
const PhotoshopParser_1 = require("./Import/PhotoshopParser");
const AssetsSync_1 = require("./AssetsSync/AssetsSync");
const utils_1 = require("../utils/utils");
const ManageComponents_1 = require("./Components/ManageComponents");
let packageJson = require("../../package.json");
class DocumentStarter {
    constructor() {
        this.connectedSockets = {};
        this.activeId = { id: null };
        this.imageState = {
            state: false
        };
    }
    execute(params) {
        this.generator = params.generator;
        this.documentManager = params.storage.documentManager;
        this.startModel = params.storage.startModel;
        this.createDocumentEventListener();
        this.subscribeListenersBeforeDocument();
        this.createDependenciesBeforeSocket();
    }
    createDocumentEventListener() {
        this.docEmitter = new events_1.EventEmitter();
        this.loggerEmitter = new events_1.EventEmitter();
    }
    subscribeListenersBeforeDocument() {
        this.generator.on(constants_1.photoshopConstants.generator.activeDocumentChanged, (changeId) => {
            this.activeId.id = changeId;
            this.onDocumentOpen(changeId);
        });
        this.documentManager.on(constants_1.photoshopConstants.generator.documentResolved, () => {
            this.generator.emit(constants_1.photoshopConstants.generator.documentResolved);
        });
        this.generator.onPhotoshopEvent(constants_1.photoshopConstants.photoshopEvents.generatorMenuChanged, (event) => this.onButtonMenuClicked(event));
    }
    onDocumentOpen(openId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.activeDocument && this.activeDocument.id !== openId) {
                this.generator.emit(constants_1.photoshopConstants.logger.newDocument);
                this.loggerEmitter.emit(constants_1.photoshopConstants.logger.newDocument);
                this.docEmitter.emit(constants_1.photoshopConstants.logger.newDocument);
                return;
            }
            if (this.activeDocument && this.activeDocument.id === openId) {
                this.generator.emit(constants_1.photoshopConstants.logger.currentDocument);
                this.loggerEmitter.emit(constants_1.photoshopConstants.logger.currentDocument);
                this.docEmitter.emit(constants_1.photoshopConstants.logger.currentDocument);
                return;
            }
            this.generator.on(constants_1.photoshopConstants.generator.closedDocument, (closeId) => this.onDocumentClose(closeId));
            this.generator.on(constants_1.photoshopConstants.generator.save, () => {
                this.start(openId);
            });
            this.stabalizeDocument();
        });
    }
    start(openId) {
        this.createSocket();
        this.generator.once(constants_1.photoshopConstants.generator.panelsConnected, () => {
            this.onPanelsConnected(openId);
        });
    }
    onPanelsConnected(openId) {
        return __awaiter(this, void 0, void 0, function* () {
            /**it will remove all the listeners and apply all the listeners again */
            this.restorePhotoshop();
            this.activeDocument = yield this.documentManager.getDocument(openId);
            FactoryClass_1.execute(this.startModel, { generator: this.generator, activeDocument: this.activeDocument });
            this.openDocumentData = yield this.startModel.onPhotoshopStart();
            yield this.setDocumentMetaData();
            utils_1.utlis.sendToSocket(this.htmlSocket, [this.activeDocument.directory, this.docId], constants_1.photoshopConstants.socket.docOpen);
            this.instantiateStateEvent();
            this.instantiateDocumentModel();
            this.createObjects();
            yield this.addMenuItems();
            this.createDependencies();
            yield this.addDocumentStatus();
            utils_1.utlis.sendToSocket(this.selfHtmlSocket, [this.modelFactory.getPhotoshopModel().allQuestItems], "questItems");
        });
    }
    createSocket() {
        if (this.io) {
            this.io.close();
            this.io = null;
            this.generator.removeAllListeners(constants_1.photoshopConstants.generator.panelsConnected);
        }
        this.io = require('socket.io')(8099);
        console.log("making a socket connection");
        this.io.on("connection", (socket) => {
            this.applySocketListeners(socket);
        });
    }
    applySocketListeners(socket) {
        socket.on(constants_1.photoshopConstants.socket.register, (name) => {
            this.handleSocketClients(name, socket);
            if (Object.keys(this.connectedSockets).length === 3) {
                this.generator.emit("PanelsConnected");
            }
        });
    }
    handleSocketClients(name, socket) {
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
    }
    createHTMLSocket(socket) {
        this.htmlSocket = socket;
        if (this.activeDocument) {
            this.docEmitter.emit(constants_1.photoshopConstants.logger.getUpdatedHTMLSocket, this.htmlSocket);
        }
        this.applyQuestListenerOnSocket(socket);
    }
    createValidatorSocket(socket) {
        socket.emit(constants_1.photoshopConstants.socket.getStorage, this.docId);
        this.loggerEmitter.emit(constants_1.photoshopConstants.logger.getUpdatedValidatorSocket, socket);
    }
    createSelfHTMLSocket(socket) {
        this.selfHtmlSocket = socket;
        socket.on("getRefreshResponse", storage => {
            this.modelFactory.getPhotoshopModel().setRefreshResponse(storage);
        });
        socket.on("getUpdatedDocument", () => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.generator.getDocumentInfo(undefined);
            socket.emit("updatedDocument", result);
        }));
        this.applyQuestListenerOnSocket(socket);
    }
    applyQuestListenerOnSocket(socket) {
        socket.on(constants_1.photoshopConstants.socket.getQuestJson, (storage, checkBoxes, type, mappingResponse) => {
            this.checkedBoxes = checkBoxes;
            this.modelFactory.getPhotoshopModel().createPlatformMapping(mappingResponse);
            this.modelFactory.handleSocketStorage(storage, type);
            this.setViewMap();
        });
    }
    setViewMap() {
        const viewsMap = this.modelFactory.getMappingModel().getViewPlatformMap("desktop");
        this.structureMap.set(viewsMap, {
            ref: CreateViewStructure_1.CreateViewStructure,
            dep: [CreateViewClasses_1.CreateView, ModelFactory_1.ModelFactory, PhotoshopFactory_1.PhotoshopFactory]
        });
    }
    onButtonMenuClicked(event) {
        const menu = event.generatorMenuChanged;
        if (menu.name === "generator-assets") {
            this.imageState.state = this.generator.getMenuState(menu.name).checked;
        }
        else if (!this.activeId.id || this.activeId.id && this.activeId.id === this.activeDocument.id) {
            const elementMap = this.getElementMap(menu.name);
            const classObj = this.structureMap.get(elementMap);
            if (classObj) {
                let factoryObj;
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
    }
    getElementMap(menuName) {
        let keysIterable = this.structureMap.keys();
        for (let keys of keysIterable) {
            if (keys.has(menuName)) {
                return keys;
            }
        }
    }
    sendToHTMLSocket() {
        this.htmlSocket.emit(constants_1.photoshopConstants.socket.docOpen, this.activeDocument.directory, this.docId);
    }
    restorePhotoshop() {
        this.removeListeners();
        this.applyDocumentListeners();
    }
    removeListeners() {
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
    }
    applyDocumentListeners() {
        this.docEmitter.on(constants_1.photoshopConstants.logger.logWarning, loggerType => {
            this.loggerEmitter.emit(constants_1.photoshopConstants.logger.logWarning, loggerType);
        });
        this.docEmitter.on(constants_1.photoshopConstants.logger.logError, (id, key, loggerType) => {
            this.loggerEmitter.emit(constants_1.photoshopConstants.logger.logError, id, key, loggerType);
        });
        this.docEmitter.on(constants_1.photoshopConstants.logger.logStatus, message => {
            this.loggerEmitter.emit(constants_1.photoshopConstants.logger.logStatus, message);
        });
        this.docEmitter.on(constants_1.photoshopConstants.logger.removeError, id => {
            this.loggerEmitter.emit(constants_1.photoshopConstants.logger.removeError, id);
        });
        this.docEmitter.on(constants_1.photoshopConstants.logger.containerPanelReady, () => {
            this.docEmitter.emit(constants_1.photoshopConstants.logger.getUpdatedHTMLSocket, this.htmlSocket);
        });
        this.docEmitter.on("creationReady", () => {
            this.docEmitter.emit(constants_1.photoshopConstants.logger.getUpdatedHTMLSocket, this.htmlSocket);
        });
        this.generator.on(constants_1.photoshopConstants.generator.closedDocument, (closeId) => {
            this.onDocumentClose(closeId);
        });
        this.generator.on(constants_1.photoshopConstants.generator.save, () => {
            this.onSave();
        });
    }
    getOriginalFileName() {
        return this.activeDocument.name;
    }
    checkIfDuplicateDocument() {
        return __awaiter(this, void 0, void 0, function* () {
            const file = yield this.generator.getDocumentSettingsForPlugin(this.activeDocument.id, packageJson.name + "New" + "Document");
            return this.activeDocument.name !== file.originalFile;
        });
    }
    setDocId() {
        this.docId = Math.floor(Math.random() * 5000);
    }
    /**it sets the doc id with which psd data folder is created */
    setDocumentMetaData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.openDocumentData) {
                this.setDocId();
                let originalFileName = this.getOriginalFileName();
                yield this.setDocGeneratorSettings(originalFileName);
            }
            else {
                let ifCopiedDoc = yield this.checkIfDuplicateDocument();
                const docIdObj = yield this.generator.getDocumentSettingsForPlugin(this.activeDocument.id, packageJson.name + "Document");
                this.docId = docIdObj.docId;
                if (ifCopiedDoc) {
                    this.setDocId();
                    let originalFileName = this.getOriginalFileName();
                    yield this.setDocGeneratorSettings(originalFileName);
                    yield utils_1.utlis.copyFolder(this.activeDocument.directory, docIdObj.docId, this.docId);
                }
            }
            this.generator.emit(constants_1.photoshopConstants.generator.docId, this.docId);
        });
    }
    setDocGeneratorSettings(originalFileName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.generator.setDocumentSettingsForPlugin({ docId: this.docId }, packageJson.name + "Document");
            yield this.generator.setDocumentSettingsForPlugin({ originalFile: originalFileName }, packageJson.name + "New" + "Document");
        });
    }
    createDependencies() {
        const layerManager = FactoryClass_1.inject({ ref: LayerManager_1.LayerManager, dep: [ModelFactory_1.ModelFactory] });
        FactoryClass_1.execute(layerManager, {
            generator: this.generator,
            docEmitter: this.docEmitter,
            activeDocument: this.activeDocument
        });
        const validation = FactoryClass_1.inject({ ref: Validation_1.Validation, dep: [ModelFactory_1.ModelFactory] });
        FactoryClass_1.execute(validation, {
            generator: this.generator,
            docEmitter: this.docEmitter,
            activeDocument: this.activeDocument
        });
        const photoshopFactory = FactoryClass_1.inject({ ref: PhotoshopFactory_1.PhotoshopFactory, dep: [ModelFactory_1.ModelFactory] });
        FactoryClass_1.execute(photoshopFactory, { generator: this.generator, docEmitter: this.docEmitter });
        const containerResponse = FactoryClass_1.inject({ ref: ContainerPanelResponse_1.ContainerPanelResponse, dep: [ModelFactory_1.ModelFactory, PhotoshopFactory_1.PhotoshopFactory] });
        FactoryClass_1.execute(containerResponse, {
            generator: this.generator, activeDocument: this.activeDocument, docEmitter: this.docEmitter,
            storage: { documentManager: this.documentManager }
        });
        const selfAddedStructures = FactoryClass_1.inject({ ref: SelfAddedStructures_1.SelfAddedStructures, dep: [ModelFactory_1.ModelFactory] });
        FactoryClass_1.execute(selfAddedStructures, {
            generator: this.generator, activeDocument: this.activeDocument, docEmitter: this.docEmitter, storage: { documentManager: this.documentManager }
        });
        const manageComponents = FactoryClass_1.inject({ ref: ManageComponents_1.ManageComponents, dep: [] });
        FactoryClass_1.execute(manageComponents, { generator: this.generator, activeDocument: this.activeDocument });
        FactoryClass_1.inject({ ref: PhotoshopParser_1.PhotoshopParser, dep: [] });
    }
    stabalizeDocument() {
        const documentStabalizer = FactoryClass_1.inject({ ref: DocumentStabalizer_1.DocumentStabalizer, dep: [] });
        FactoryClass_1.execute(documentStabalizer, { generator: this.generator });
    }
    createDependenciesBeforeSocket() {
        const documentLogger = FactoryClass_1.inject({ ref: DocumentLogger_1.DocumentLogger, dep: [] });
        FactoryClass_1.execute(documentLogger, { generator: this.generator, loggerEmitter: this.loggerEmitter });
    }
    addMenuItems() {
        return __awaiter(this, void 0, void 0, function* () {
            this.menuManager = FactoryClass_1.inject({ ref: MenuProxyManager_1.MenuProxyManager, dep: [ModelFactory_1.ModelFactory] });
            FactoryClass_1.execute(this.menuManager, { generator: this.generator, docEmitter: this.docEmitter });
        });
    }
    addDocumentStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            // const menuState = await this.generator.getMenuState("generator-assets");
            // this.imageState.state = menuState.checked;
            this.generator.emit(constants_1.photoshopConstants.generator.activeDocumentId, this.activeDocument.id);
            this.loggerEmitter.emit(constants_1.photoshopConstants.logger.activeDocument, this.docId);
            this.loggerEmitter.emit(constants_1.photoshopConstants.logger.logStatus, "Document is Saved");
            this.loggerEmitter.emit(constants_1.photoshopConstants.logger.logStatus, "The document file id is " + this.docId);
        });
    }
    onSave() {
        if (!this.activeDocument || this.activeDocument && this.activeId.id && this.activeId.id !== this.activeDocument.id) {
            return;
        }
        this.loggerEmitter.emit(constants_1.photoshopConstants.logger.logStatus, "Document is Saved");
        if (!this.checkedBoxes) {
            return;
        }
        const filteredPath = this.activeDocument.directory + "\\" + this.docId;
        if (!fs.existsSync(filteredPath)) {
            fs.mkdirSync(filteredPath);
        }
        fs.writeFile(this.activeDocument.directory + "\\" + this.docId + "/CheckedBoxes.json", JSON.stringify({
            checkedBoxes: this.checkedBoxes,
        }), err => {
            if (err) {
                console.log("error creating/modifying json file");
            }
        });
    }
    createObjects() {
        this.structureMap = new Map();
        this.mapFactory = this.modelFactory.getMappingModel();
        this.structureMap
            .set(this.mapFactory.getSyncAssetsMap(), {
            ref: AssetsSync_1.AssetsSync,
            dep: [ModelFactory_1.ModelFactory, PhotoshopFactory_1.PhotoshopFactory]
        })
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
    }
    instantiateStateEvent() {
        const eventSubject = FactoryClass_1.inject({ ref: PhotoshopEventSubject_1.PhotoshopEventSubject, dep: [] });
        FactoryClass_1.execute(eventSubject, {
            generator: this.generator, activeDocument: this.activeDocument, docEmitter: this.docEmitter,
            storage: { docId: this.docId, activeId: this.activeId }
        });
    }
    instantiateDocumentModel() {
        this.modelFactory = FactoryClass_1.inject({ ref: ModelFactory_1.ModelFactory, dep: [] });
        FactoryClass_1.execute(this.modelFactory, {
            generator: this.generator, activeDocument: this.activeDocument,
            docEmitter: this.docEmitter, storage: { openDocumentData: this.openDocumentData }
        });
    }
    ;
    onDocumentClose(closeId) {
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
    }
}
exports.DocumentStarter = DocumentStarter;
//# sourceMappingURL=DocumentStarter.js.map