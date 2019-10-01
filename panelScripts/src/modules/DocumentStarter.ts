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
    private socket;
    private io = require('socket.io')(8099);
    private openDocumentData;

    execute(params: IParams) {
        this.generator = params.generator;
        this.documentManager = params.storage.documentManager;
        this.startModel = params.storage.startModel;
        this.subscribeListeners();
        this.createDependenciesBeforeSocket();
        this.createSocket();
    }

    private createSocket() {
        console.log("making a socket connection");
        this.io.on("connection", (socket) => {
            this.socket = socket;
            this.generator.emit("getUpdatedSocket", this.socket);
            this.applySocketListeners();
        });
    }

    private applySocketListeners() {
        this.socket.on("getQuestJson", storage => {
            this.modelFactory.handleSocketStorage(storage);
            this.setViewMap();
        });
        this.socket.on('disconnect', function(reason) {
            console.log(reason);
        });
    }

    private setViewMap() {
        const viewsMap = this.modelFactory.getMappingModel().getViewMap();
        this.structureMap.set(viewsMap, {
            ref: CreateViewStructure,
            dep: [CreateView, ModelFactory]
        });
    }

    private subscribeListeners() {
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
            execute(factoryObj, {generator: this.generator, menuName: menu.name, activeDocument: this.activeDocument});
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
        FactoryClass.factoryInstance = null;
        this.startModel.allDocumentsMap.set(openId, {});
        this.activeDocument = await this.documentManager.getDocument(openId);
        execute(this.startModel, {generator: this.generator, activeDocument: this.activeDocument});
        this.openDocumentData = await this.startModel.onPhotoshopStart();
        await this.setDocumentMetaData();
        this.instantiateStateEvent();
        this.instantiateDocumentModel();
        this.createObjects();
        this.createDependencies();
        await this.addMenuItems();
    }

    private async setDocumentMetaData() {
        if(!this.openDocumentData) {
            const docId = Math.floor(Math.random() * 5000);
            await this.generator.setDocumentSettingsForPlugin({docId: docId}, packageJson.name + "Document");
        }
    }

    private createDependencies() {
        const layerManager = inject({ref: LayerManager, dep: []});
        execute(layerManager, {generator: this.generator, activeDocument: this.activeDocument});
        const containerResponse = inject({ref: ContainerPanelResponse, dep: [ModelFactory]});
        execute(containerResponse, {generator: this.generator, activeDocument: this.activeDocument});
        const validation = inject({ref: Validation, dep: [ModelFactory]});
        execute(validation, {generator: this.generator, activeDocument: this.activeDocument});
        this.menuManager = inject({ref: MenuProxyManager, dep: [ModelFactory]});
    }

    private createDependenciesBeforeSocket() {
        const documentLogger = inject({ref: DocumentLogger, dep: []});
        execute(documentLogger, {generator: this.generator});
    }

    private async addMenuItems() {
        execute(this.menuManager, {generator: this.generator});
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
                dep: [CreatePlatform, ModelFactory],
            })
            .set(this.mapFactory.getLayoutMap(), {
                ref: CreateProxyLayout,
                dep: []
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
        execute(eventSubject, {generator: this.generator});
    }

    private instantiateDocumentModel() {
        this.modelFactory = inject({ref: ModelFactory, dep:[]});
        execute(this.modelFactory, {generator: this.generator, activeDocument: this.activeDocument,
                                            storage: {openDocumentData: this.openDocumentData}});
    };

}
