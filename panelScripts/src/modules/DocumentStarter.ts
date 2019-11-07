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
import {HandleUndo} from "./HandleUndo";
import {DocumentStabalizer} from "./DocumentStabalizer";
import * as path from "path";
import * as fs from "fs";
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
    private activeId = { id: null};
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
        this.generator.on("activeDocumentChanged", (changeId) => {
            this.activeId.id = changeId;
            this.onDocumentOpen(changeId);
        });
        this.generator.onPhotoshopEvent("generatorMenuChanged", (event) => this.onButtonMenuClicked(event));
    }

    private async onDocumentOpen(openId) {
        if(this.activeDocument && this.activeDocument.id !== openId) {
            this.loggerEmitter.emit("newDocument");
            this.docEmitter.emit("newDocument");
            return;
        }
        if(this.activeDocument && this.activeDocument.id === openId) {
            this.loggerEmitter.emit("currentDocument");
            this.docEmitter.emit("currentDocument");
            return;
        }
        this.generator.on("save", () =>  {
            this.start(openId);
        });
        this.stabalizeDocument();
    }

    private start(openId) {
        this.createSocket();
        this.generator.once("PanelsConnected", () => {
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
        this.io = require('socket.io')(8099);
        console.log("making a socket connection");
        this.io.on("connection", (socket) => {
            this.applySocketListeners(socket);
        });
    }

    private applySocketListeners(socket) {
        socket.on("register", (name) => {
            this.handleSocketClients(name, socket);
            if(Object.keys(this.connectedSockets).length === 2) {
                this.generator.emit("PanelsConnected");
            }
        });
    }

    private handleSocketClients(name, socket) {
        if(name === "htmlPanel") {
            this.htmlSocket = socket;
            if(this.activeDocument) {
                this.docEmitter.emit("getUpdatedHTMLSocket", this.htmlSocket);
                this.htmlSocket.emit("docOpen", this.activeDocument.directory, this.docId);
            }
            socket.on("getQuestJson", (storage, checkBoxes) => {
                this.checkedBoxes = checkBoxes;
                this.modelFactory.handleSocketStorage(storage);
                this.setViewMap();
            });
        }
        if(name === "validatorPanel") {
            socket.emit("getStorage", this.docId);
            this.loggerEmitter.emit("getUpdatedValidatorSocket", socket);
        }
        if(this.activeId.id && this.activeDocument && this.activeId.id !== this.activeDocument.id) {
            socket.emit("disablePage");
        }
        socket.on('disconnect', function(reason) {
            console.log(reason);
        });
        this.connectedSockets[name] = true;
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
        if(menu.name === "generator-assets") {
            this.imageState.state = this.generator.getMenuState(menu.name).checked;
        } else if(!this.activeId.id || this.activeId.id && this.activeId.id === this.activeDocument.id){
            const elementMap = this.getElementMap(menu.name);
            const classObj = this.structureMap.get(elementMap);
            if (classObj) {
                let factoryObj;
                if(classObj.ref === CreateComponent) {
                    factoryObj = inject({ref: classObj.ref, dep: classObj.dep});
                } else {
                    factoryObj = inject({ref: classObj.ref, dep: classObj.dep, isNonSingleton: true});
                }
                execute(factoryObj, {generator: this.generator, docEmitter: this.docEmitter, menuName: menu.name, activeDocument: this.activeDocument,
                    storage: {factoryMap: elementMap, menuState: this.imageState}});
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
        this.htmlSocket.emit("docOpen", this.activeDocument.directory, this.docId);
    }

    private restorePhotoshop() {
        FactoryClass.factoryInstance = null;
        this.checkedBoxes = null;
        this.connectedSockets = {};
        this.removeListeners();
        this.applyDocumentListeners();
    }

    private removeListeners() {
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
    }

    private applyDocumentListeners() {
        this.docEmitter.on("logWarning", loggerType => {
            this.loggerEmitter.emit("logWarning", loggerType);
        });
        this.docEmitter.on("logError", (id, key, loggerType) => {
            this.loggerEmitter.emit("logError", id, key, loggerType);
        });
        this.docEmitter.on("logStatus", message => {
            this.loggerEmitter.emit("logStatus", message);
        });
        this.docEmitter.on("removeError", id => {
            this.loggerEmitter.emit("removeError", id);
        });
        this.docEmitter.on("containerPanelReady", () => {
            this.docEmitter.emit("getUpdatedHTMLSocket", this.htmlSocket);
        });
        this.generator.on("closedDocument", (closeId) =>{
            this.onDocumentClose(closeId);
        });
        this.generator.on("save", () => {this.onSave()});
    }

    private async setDocumentMetaData() {
        if(!this.openDocumentData) {
            this.docId = Math.floor(Math.random() * 5000);
            await this.generator.setDocumentSettingsForPlugin({docId: this.docId}, packageJson.name + "Document");
        } else {
            const docIdObj = await this.generator.getDocumentSettingsForPlugin(this.activeDocument.id,
                packageJson.name + "Document");
            this.docId = docIdObj.docId;
        }
    }

    private createDependencies() {
        const undoHandle = inject({ref: HandleUndo, dep: [ModelFactory]});
        execute(undoHandle, {generator: this.generator});
        const layerManager = inject({ref: LayerManager, dep: [ModelFactory]});
        execute(layerManager, {generator: this.generator, docEmitter: this.docEmitter, activeDocument: this.activeDocument});
        const validation = inject({ref: Validation, dep: [ModelFactory]});
        execute(validation, {generator: this.generator, docEmitter: this.docEmitter, activeDocument: this.activeDocument});
        const photoshopFactory = inject({ref: PhotoshopFactory, dep: [ModelFactory]});
        execute(photoshopFactory, {generator: this.generator, docEmitter: this.docEmitter});
        const containerResponse = inject({ref: ContainerPanelResponse, dep: [ModelFactory, PhotoshopFactory]});
        execute(containerResponse, {generator: this.generator, activeDocument: this.activeDocument, docEmitter: this.docEmitter,
                                            storage: {documentManager: this.documentManager}});
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
       this.loggerEmitter.emit("activeDocument", this.docId);
       this.loggerEmitter.emit("logStatus", "Document is Saved");
       this.loggerEmitter.emit("logStatus", "The document file id is " + this.docId);
    }

    private onSave() {
        if(!this.activeDocument || this.activeDocument && this.activeId.id && this.activeId.id !== this.activeDocument.id) {
            return;
        }
        this.loggerEmitter.emit("logStatus", "Document is Saved");
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
        execute(eventSubject, {generator: this.generator, activeDocument: this.activeDocument, docEmitter: this.docEmitter,
                                      storage: {docId: this.docId, activeId: this.activeId}});
    }

    private instantiateDocumentModel() {
        this.modelFactory = inject({ref: ModelFactory, dep:[]});
        execute(this.modelFactory, {generator: this.generator, activeDocument: this.activeDocument,
                                           docEmitter: this.docEmitter, storage: {openDocumentData: this.openDocumentData}});
    };

    private onDocumentClose(closeId) {
        if(closeId === this.activeDocument.id) {
            this.activeDocument = null;
            this.docId = null;
            this.loggerEmitter.emit("destroy");
            this.docEmitter.emit("destroy");
            if(this.io) {
                this.io.close();
                this.io = null;
            }
        }
    }

}