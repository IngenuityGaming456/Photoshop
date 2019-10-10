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
    private io = require('socket.io')(8099);
    private openDocumentData;
    private docId;
    private docEmitter;
    private loggerEmitter;
    private htmlSocket;

    execute(params: IParams) {
        this.generator = params.generator;
        this.documentManager = params.storage.documentManager;
        this.startModel = params.storage.startModel;
        this.createDocumentEventListener();
        this.subscribeListenersBeforeDocument();
        this.createDependenciesBeforeSocket();
        this.createSocket();
    }

    private createDocumentEventListener() {
        this.docEmitter = new EventEmitter();
        this.loggerEmitter = new EventEmitter();
    }

    private createSocket() {
        console.log("making a socket connection");
        this.io.on("connection", (socket) => {
            this.applySocketListeners(socket);
        });
    }

    private applySocketListeners(socket) {
        socket.on("register", (name) => {
            this.handleSocketClients(name, socket);
        });
    }

    private handleSocketClients(name, socket) {
        if(name === "htmlPanel") {
            this.htmlSocket = socket;
            socket.on("getQuestJson", storage => {
                this.docEmitter.emit("getUpdatedHTMLSocket", socket);
                this.modelFactory.handleSocketStorage(storage);
                this.setViewMap();
            });
        }
        if(name === "validatorPanel") {
            this.loggerEmitter.emit("getUpdatedValidatorSocket", socket);
        }
        socket.on('disconnect', function(reason) {
            console.log(reason);
        });
    }

    private setViewMap() {
        const viewsMap = this.modelFactory.getMappingModel().getViewPlatformMap("desktop");
        this.structureMap.set(viewsMap, {
            ref: CreateViewStructure,
            dep: [CreateView, ModelFactory, PhotoshopFactory]
        });
    }

    private subscribeListenersBeforeDocument() {
        this.generator.on("openedDocument", (openId) => {
            this.onDocumentOpen(openId);
        });
        this.generator.onPhotoshopEvent("generatorMenuChanged", (event) => this.onButtonMenuClicked(event));
    }

    private onButtonMenuClicked(event) {
        const menu = event.generatorMenuChanged;
        const elementMap = this.getElementMap(menu.name);
        const classObj = this.structureMap.get(elementMap);
        if (classObj) {
            const factoryObj = inject({ref: classObj.ref, dep: classObj.dep, isNonSingleton: true});
            execute(factoryObj, {generator: this.generator, docEmitter: this.docEmitter, menuName: menu.name, activeDocument: this.activeDocument});
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

    private async onDocumentOpen(openId) {
        this.restorePhotoshop();
        this.activeDocument = await this.documentManager.getDocument(openId);
        execute(this.startModel, {generator: this.generator, activeDocument: this.activeDocument});
        this.openDocumentData = await this.startModel.onPhotoshopStart();
        await this.setDocumentMetaData();
        this.sendToHTMLSocket();
        this.instantiateStateEvent();
        this.instantiateDocumentModel();
        this.createObjects();
        this.createDependencies();
        await this.addMenuItems();
        this.addDocumentStatus();
    }

    private sendToHTMLSocket() {
        //this.htmlSocket.emit("messageRevert");
        this.htmlSocket.emit("docOpen", this.activeDocument.directory, this.docId);
    }

    private restorePhotoshop() {
        FactoryClass.factoryInstance = null;
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
    }

    private applyDocumentListeners() {
        this.docEmitter.on("logWarning", (key, id, loggerType) => {
            this.loggerEmitter.emit("logWarning", key, id, loggerType);
        });
        this.docEmitter.on("logError", (key, id, loggerType) => {
            this.loggerEmitter.emit("logError", key, id, loggerType);
        });
        this.docEmitter.on("logStatus", message => {
            this.loggerEmitter.emit("logStatus", message);
        });
        this.docEmitter.on("removeError", id => {
            this.loggerEmitter.emit("removeError", id);
        });
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
        const layerManager = inject({ref: LayerManager, dep: [ModelFactory]});
        execute(layerManager, {generator: this.generator, docEmitter: this.docEmitter, activeDocument: this.activeDocument});
        const validation = inject({ref: Validation, dep: [ModelFactory]});
        execute(validation, {generator: this.generator, docEmitter: this.docEmitter, activeDocument: this.activeDocument});
        this.menuManager = inject({ref: MenuProxyManager, dep: [ModelFactory]});
        const photoshopFactory = inject({ref: PhotoshopFactory, dep: [ModelFactory]});
        execute(photoshopFactory, {generator: this.generator, docEmitter: this.docEmitter});
        const containerResponse = inject({ref: ContainerPanelResponse, dep: [ModelFactory, PhotoshopFactory]});
        execute(containerResponse, {generator: this.generator, activeDocument: this.activeDocument, docEmitter: this.docEmitter});
    }

    private createDependenciesBeforeSocket() {
        const documentLogger = inject({ref: DocumentLogger, dep: []});
        execute(documentLogger, {generator: this.generator, loggerEmitter: this.loggerEmitter});
    }

    private async addMenuItems() {
        execute(this.menuManager, {generator: this.generator, docEmitter: this.docEmitter});
    }

    private addDocumentStatus() {
       this.loggerEmitter.emit("logStatus", "The document is ready to be worked with");
       this.loggerEmitter.emit("logStatus", "The document file id is " + this.docId);
    }

    private createObjects() {
        this.structureMap = new Map();
        this.mapFactory = this.modelFactory.getMappingModel();
        this.structureMap
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
                dep: []
            })
            .set(this.mapFactory.getTestingMap(), {
                ref: CreateTestingStructure,
                dep: []
            });
    }

    private instantiateStateEvent() {
        const eventSubject = inject({ref: PhotoshopEventSubject, dep: []});
        execute(eventSubject, {generator: this.generator, activeDocument: this.activeDocument, docEmitter: this.docEmitter});
    }

    private instantiateDocumentModel() {
        this.modelFactory = inject({ref: ModelFactory, dep:[]});
        execute(this.modelFactory, {generator: this.generator, activeDocument: this.activeDocument,
                                           docEmitter: this.docEmitter, storage: {openDocumentData: this.openDocumentData}});
    };

}
