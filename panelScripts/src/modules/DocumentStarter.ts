import {IFactory, IParams} from "../interfaces/IJsxParam";
import {CreateViewStructure} from "./CreateViewStructure";
import {ModelFactory} from "../models/ModelFactory";
import {CreateComponent} from "./CreateComponent";
import {CreateLocalisationStructure} from "./CreateLocalisationStructure";
import {execute, FactoryClass, inject} from "./FactoryClass";
import {CreatePlatform, CreateView} from "./CreateViewClasses";
import {CreateTestingStructure} from "./CreateTestingStructure";
import {PhotoshopEventSubject} from "../subjects/PhotoshopEventSubject";
import * as DocumentManager from "../../lib/documentManager.js"
import {LayerManager} from "./LayerManager";
import {Validation} from "./Validation";
import {ContainerPanelResponse} from "./ContainerPanelResponse";
import {MenuProxyManager} from "../modules/MenuManagers/MenuProxyManager";
import {DocumentLogger} from "../logger/DocumentLogger";
import {CreateProxyLayout} from "./LayoutStructure/CreateProxyLayout";
import {PhotoshopFactory} from "./PhotoshopFactory";
import {EventEmitter} from "events";
import {DocumentStabalizer} from "./DocumentStabalizer";
import {photoshopConstants as pc} from "../constants";
import * as fs from "fs";
import {SelfAddedStructures} from "./SelfAddedStructures";
import {CreateImport} from "./Import/CreateImport";
import {PhotoshopParser} from "./Import/PhotoshopParser";

let packageJson = require("../../package.json");

export class DocumentStarter implements IFactory {
    private modelFactory;
    private generator;
    private structureMap;
    private mapFactory;
    private startModel;
    private activeDocument;
    private documentManager: DocumentManager;
    private menuManager;
    private openDocumentData;
    private docId;
    private io;
    private docEmitter;
    private loggerEmitter;
    private htmlSocket;
    private checkedBoxes;
    private connectedSockets = {};
    private activeId = {id: null};
    private imageState = {
        state: false
    };

    execute(params: IParams) {
        this.generator = params.generator;
        this.documentManager = params.storage.documentManager;
        this.startModel = params.storage.startModel;
        this.createDocumentEventListener();
        this.subscribeListenersBeforeDocument();
        this.createDependenciesBeforeSocket();
    }

    private createDocumentEventListener() {
        this.docEmitter = new EventEmitter();
        this.loggerEmitter = new EventEmitter();
    }

    private subscribeListenersBeforeDocument() {
        this.generator.on(pc.generator.activeDocumentChanged, (changeId) => {
            this.activeId.id = changeId;
            this.onDocumentOpen(changeId);
        });
        this.documentManager.on(pc.generator.documentResolved, () => {
            this.generator.emit(pc.generator.documentResolved)
        });
        this.generator.onPhotoshopEvent(pc.photoshopEvents.generatorMenuChanged, (event) => this.onButtonMenuClicked(event));
    }

    private async onDocumentOpen(openId) {
        if (this.activeDocument && this.activeDocument.id !== openId) {
            this.generator.emit(pc.logger.newDocument);
            this.loggerEmitter.emit(pc.logger.newDocument);
            this.docEmitter.emit(pc.logger.newDocument);
            return;
        }
        if (this.activeDocument && this.activeDocument.id === openId) {
            this.generator.emit(pc.logger.currentDocument);
            this.loggerEmitter.emit(pc.logger.currentDocument);
            this.docEmitter.emit(pc.logger.currentDocument);
            return;
        }
        this.generator.on(pc.generator.closedDocument, (closeId) => this.onDocumentClose(closeId));
        this.generator.on(pc.generator.save, () => {
            this.start(openId);
        });
        this.stabalizeDocument();
    }

    private start(openId) {
        this.createSocket();
        this.generator.once(pc.generator.panelsConnected, () => {
            this.onPanelsConnected(openId);
        });
    }

    private async onPanelsConnected(openId) {
        this.restorePhotoshop();
        this.activeDocument = await this.documentManager.getDocument(openId);
        execute(this.startModel, {generator: this.generator, activeDocument: this.activeDocument});
        this.openDocumentData = await this.startModel.onPhotoshopStart();
        await this.setDocumentMetaData();
        this.sendToHTMLSocket();
        this.instantiateStateEvent();
        this.instantiateDocumentModel();
        this.createObjects();
        await this.addMenuItems();
        this.createDependencies();
        await this.addDocumentStatus();
    }

    private createSocket() {
        if (this.io) {
            this.io.close();
            this.io = null;
            this.generator.removeAllListeners(pc.generator.panelsConnected);
        }
        this.io = require('socket.io')(8099);
        console.log("making a socket connection");
        this.io.on("connection", (socket) => {
            this.applySocketListeners(socket);
        });
    }

    private applySocketListeners(socket) {
        socket.on(pc.socket.register, (name) => {
            this.handleSocketClients(name, socket);
            if (Object.keys(this.connectedSockets).length === 3) {
                this.generator.emit("PanelsConnected");
            }
        });
    }

    private handleSocketClients(name, socket) {
        if (name === pc.htmlPanel) {
            this.createHTMLSocket(socket);
        }
        if (name === pc.validatorPanel) {
            this.createValidatorSocket(socket);
        }
        if (name === pc.selfHtmlPanel) {
            this.createSelfHTMLSocket(socket);
        }
        if (this.activeId.id && this.activeDocument && this.activeId.id !== this.activeDocument.id) {
            socket.emit(pc.socket.disablePage);
        }
        socket.on('disconnect', function (reason) {
            console.log(reason);
        });
        this.connectedSockets[name] = true;
    }

    private createHTMLSocket(socket) {
        this.htmlSocket = socket;
        if (this.activeDocument) {
            this.docEmitter.emit(pc.logger.getUpdatedHTMLSocket, this.htmlSocket);
        }
        this.applyQuestListenerOnSocket(socket);
    }

    private createValidatorSocket(socket) {
        socket.emit(pc.socket.getStorage, this.docId);
        this.loggerEmitter.emit(pc.logger.getUpdatedValidatorSocket, socket);
    }

    private createSelfHTMLSocket(socket) {
        socket.on("getRefreshResponse", storage => {
            this.modelFactory.getPhotoshopModel().setRefreshResponse(storage);
        });
        socket.on("getUpdatedDocument", async() => {
            const result = await this.generator.getDocumentInfo(undefined);
            socket.emit("updatedDocument", result);
        });
        this.applyQuestListenerOnSocket(socket);
    }

    private applyQuestListenerOnSocket(socket) {
        socket.on(pc.socket.getQuestJson, (storage, checkBoxes, type, mappingResponse) => {
            this.checkedBoxes = checkBoxes;
            this.modelFactory.getPhotoshopModel().createPlatformMapping(mappingResponse);
            this.modelFactory.handleSocketStorage(storage, type);
            this.setViewMap();
        });
    }

    private setViewMap() {
        const viewsMap = this.modelFactory.getMappingModel().getViewPlatformMap("desktop");
        this.structureMap.set(viewsMap, {
            ref: CreateViewStructure,
            dep: [CreateView, ModelFactory, PhotoshopFactory]
        });
    }

    private onButtonMenuClicked(event) {
        const menu = event.generatorMenuChanged;
        if (menu.name === "generator-assets") {
            this.imageState.state = this.generator.getMenuState(menu.name).checked;
        } else if (!this.activeId.id || this.activeId.id && this.activeId.id === this.activeDocument.id) {
            const elementMap = this.getElementMap(menu.name);
            const classObj = this.structureMap.get(elementMap);
            if (classObj) {
                let factoryObj;
                if (classObj.ref === CreateComponent) {
                    factoryObj = inject({ref: classObj.ref, dep: classObj.dep});
                } else {
                    factoryObj = inject({ref: classObj.ref, dep: classObj.dep, isNonSingleton: true});
                }
                execute(factoryObj, {
                    generator: this.generator,
                    docEmitter: this.docEmitter,
                    menuName: menu.name,
                    activeDocument: this.activeDocument,
                    storage: {factoryMap: elementMap, menuState: this.imageState, documentManager: this.documentManager}
                });
            }
        }
    }

    private getElementMap(menuName) {
        let keysIterable = this.structureMap.keys();
        for (let keys of keysIterable) {
            if (keys.has(menuName)) {
                return keys;
            }
        }
    }

    private sendToHTMLSocket() {
        this.htmlSocket.emit(pc.socket.docOpen, this.activeDocument.directory, this.docId);
    }

    private restorePhotoshop() {
        this.removeListeners();
        this.applyDocumentListeners();
    }

    private removeListeners() {
        this.docEmitter.removeAllListeners();
        this.generator.removeAllListeners(pc.generator.layersAdded);
        this.generator.removeAllListeners(pc.generator.layerRenamed);
        this.generator.removeAllListeners(pc.generator.layersDeleted);
        this.generator.removeAllListeners(pc.generator.select);
        this.generator.removeAllListeners(pc.generator.copy);
        this.generator.removeAllListeners(pc.generator.paste);
        this.generator.removeAllListeners(pc.generator.save);
        this.generator.removeAllListeners(pc.generator.closedDocument);
        this.generator.removeAllListeners(pc.generator.panelsConnected);
        this.generator.removeAllListeners(pc.generator.copyToLayer);
        this.generator.removeAllListeners(pc.generator.duplicate);
        this.generator.removeAllListeners(pc.generator.writeData);
        this.generator.removeAllListeners(pc.generator.docId);
    }

    private applyDocumentListeners() {
        this.docEmitter.on(pc.logger.logWarning, loggerType => {
            this.loggerEmitter.emit(pc.logger.logWarning, loggerType);
        });
        this.docEmitter.on(pc.logger.logError, (id, key, loggerType) => {
            this.loggerEmitter.emit(pc.logger.logError, id, key, loggerType);
        });
        this.docEmitter.on(pc.logger.logStatus, message => {
            this.loggerEmitter.emit(pc.logger.logStatus, message);
        });
        this.docEmitter.on(pc.logger.removeError, id => {
            this.loggerEmitter.emit(pc.logger.removeError, id);
        });
        this.docEmitter.on(pc.logger.containerPanelReady, () => {
            this.docEmitter.emit(pc.logger.getUpdatedHTMLSocket, this.htmlSocket);
        });
        this.generator.on(pc.generator.closedDocument, (closeId) => {
            this.onDocumentClose(closeId);
        });
        this.generator.on(pc.generator.save, () => {
            this.onSave()
        });
    }

    private async setDocumentMetaData() {
        if (!this.openDocumentData) {
            this.docId = Math.floor(Math.random() * 5000);
            await this.generator.setDocumentSettingsForPlugin({docId: this.docId}, packageJson.name + "Document");
        } else {
            const docIdObj = await this.generator.getDocumentSettingsForPlugin(this.activeDocument.id,
                packageJson.name + "Document");
            this.docId = docIdObj.docId;
        }
        this.generator.emit(pc.generator.docId, this.docId);
    }

    private createDependencies() {
        const layerManager = inject({ref: LayerManager, dep: [ModelFactory]});
        execute(layerManager, {
            generator: this.generator,
            docEmitter: this.docEmitter,
            activeDocument: this.activeDocument
        });
        const validation = inject({ref: Validation, dep: [ModelFactory]});
        execute(validation, {
            generator: this.generator,
            docEmitter: this.docEmitter,
            activeDocument: this.activeDocument
        });
        const photoshopFactory = inject({ref: PhotoshopFactory, dep: [ModelFactory]});
        execute(photoshopFactory, {generator: this.generator, docEmitter: this.docEmitter});
        const containerResponse = inject({ref: ContainerPanelResponse, dep: [ModelFactory, PhotoshopFactory]});
        execute(containerResponse, {
            generator: this.generator, activeDocument: this.activeDocument, docEmitter: this.docEmitter,
            storage: {documentManager: this.documentManager}
        });
        const selfAddedStructures = inject({ref: SelfAddedStructures, dep: [ModelFactory]});
        execute(selfAddedStructures, {
            generator: this.generator, activeDocument: this.activeDocument, docEmitter: this.docEmitter, storage: {documentManager: this.documentManager}
        });
    }

    private stabalizeDocument() {
        const documentStabalizer = inject({ref: DocumentStabalizer, dep: []});
        execute(documentStabalizer, {generator: this.generator});
    }

    private createDependenciesBeforeSocket() {
        const documentLogger = inject({ref: DocumentLogger, dep: []});
        execute(documentLogger, {generator: this.generator, loggerEmitter: this.loggerEmitter});
    }

    private async addMenuItems() {
        this.menuManager = inject({ref: MenuProxyManager, dep: [ModelFactory]});
        execute(this.menuManager, {generator: this.generator, docEmitter: this.docEmitter});
    }

    private async addDocumentStatus() {
        // const menuState = await this.generator.getMenuState("generator-assets");
        // this.imageState.state = menuState.checked;
        this.generator.emit(pc.generator.activeDocumentId, this.activeDocument.id);
        this.loggerEmitter.emit(pc.logger.activeDocument, this.docId);
        this.loggerEmitter.emit(pc.logger.logStatus, "Document is Saved");
        this.loggerEmitter.emit(pc.logger.logStatus, "The document file id is " + this.docId);
    }

    private onSave() {
        if (!this.activeDocument || this.activeDocument && this.activeId.id && this.activeId.id !== this.activeDocument.id) {
            return;
        }
        this.loggerEmitter.emit(pc.logger.logStatus, "Document is Saved");
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

    private createObjects() {
        this.structureMap = new Map();
        this.mapFactory = this.modelFactory.getMappingModel();
        this.structureMap
            .set(this.mapFactory.getImportMap(), {
                ref: CreateImport,
                dep: [ModelFactory]
            })
            .set(this.mapFactory.getGenericViewMap(), {
                ref: CreateViewStructure,
                dep: [CreateView, ModelFactory, PhotoshopFactory]
            })
            .set(this.mapFactory.getComponentsMap(), {
                ref: CreateComponent,
                dep: [ModelFactory]
            })
            .set(this.mapFactory.getPlatformMap(), {
                ref: CreateViewStructure,
                dep: [CreatePlatform, ModelFactory, PhotoshopFactory],
            })
            .set(this.mapFactory.getLayoutMap(), {
                ref: CreateProxyLayout,
                dep: [ModelFactory]
            })
            .set(this.mapFactory.getLocalisationMap(), {
                ref: CreateLocalisationStructure,
                dep: [ModelFactory]
            })
            .set(this.mapFactory.getTestingMap(), {
                ref: CreateTestingStructure,
                dep: [ModelFactory]
            });
    }

    private instantiateStateEvent() {
        const eventSubject = inject({ref: PhotoshopEventSubject, dep: []});
        execute(eventSubject, {
            generator: this.generator, activeDocument: this.activeDocument, docEmitter: this.docEmitter,
            storage: {docId: this.docId, activeId: this.activeId}
        });
    }

    private instantiateDocumentModel() {
        this.modelFactory = inject({ref: ModelFactory, dep: []});
        execute(this.modelFactory, {
            generator: this.generator, activeDocument: this.activeDocument,
            docEmitter: this.docEmitter, storage: {openDocumentData: this.openDocumentData}
        });
    };

    private onDocumentClose(closeId) {
        if (this.activeDocument && closeId === this.activeDocument.id) {
            this.activeDocument = null;
            this.docId = null;
            FactoryClass.factoryInstance = null;
            this.checkedBoxes = null;
            this.connectedSockets = {};
            this.loggerEmitter.emit(pc.logger.destroy);
            this.docEmitter.emit(pc.logger.destroy);
            this.generator.emit(pc.generator.activeDocumentClosed);
            this.removeListeners();
            this.startModel.onPhotoshopClose();
            this.io && this.io.close();
            this.io = null;
        }
        if (!this.activeDocument) {
            this.generator.removeAllListeners(pc.generator.closedDocument);
            this.generator.removeAllListeners(pc.generator.save);
            this.io && this.io.close();
            this.io = null;
        }
    }

}