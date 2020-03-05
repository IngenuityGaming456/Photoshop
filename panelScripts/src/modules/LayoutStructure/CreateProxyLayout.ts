import {IFactory, IParams} from "../../interfaces/IJsxParam";
import {utlis} from "../../utils/utils";
import * as path from "path";
import {ModelFactory} from "../../models/ModelFactory";
import {execute, inject} from "../FactoryClass";
import {CreateLayoutStructure} from "./CreateLayoutStructure";
import {photoshopConstants as pc} from "../../constants";
import {PhotoshopModelApp} from "../../../srcExtension/models/PhotoshopModels/PhotoshopModelApp";

let packageJson = require("../../../package.json");

export class CreateProxyLayout implements IFactory {
    private generator;
    private document;
    private activeDocument;
    private documentManager;
    private artLayers = [];
    private nameCache = [];
    private readonly errorData = [];
    private readonly modelFactory;
    private bufferMap = new Map();
    private docEmitter;
    private layerMap;
    private assetsPath;
    private imageState;

    public constructor(modelFactory: ModelFactory) {
         this.modelFactory = modelFactory;
         this.errorData = this.modelFactory.getPhotoshopModel().allLayersErrorData;
    }

    public async execute(params: IParams) {
        this.generator = params.generator;
        this.docEmitter = params.docEmitter;
        this.activeDocument = params.activeDocument;
        this.documentManager = params.storage.documentManager;
        this.imageState = params.storage.menuState;
        this.document = await this.generator.getDocumentInfo(undefined);
        await this.updateActiveDocument();
        await this.modifyParentNames();
        this.checkSymbols();
        this.checkImageFolder();
        await this.checkLocalisationStruct();
        this.checkIsLayoutSuccessful();
    }

    private async updateActiveDocument() {
        this.activeDocument = await this.documentManager.getDocument(this.activeDocument.id);
    }

    private async modifyParentNames() {
        utlis.traverseObject(this.document.layers, this.getAllArtLayers.bind(this));
        this.artLayers.reverse();
        await this.modifyPaths();
    }

    private async modifyPaths() {
        const noOfArtLayers = this.artLayers.length;
        const layerMap = new Map();
        let keyPixmap, generatorJson;
        for (let i = 0; i < noOfArtLayers; i++) {
            generatorJson = this.artLayers[i].generatorSettings[packageJson.name];
            if(!generatorJson) {
                continue;
            }
            keyPixmap = JSON.parse(generatorJson.json);
            const layerObj = {
                buffer: keyPixmap.pixels,
                frequency: 1,
                name: this.artLayers[i].name,
                parentName: ""
            };
            layerMap.set(this.artLayers[i].id, layerObj);
            this.bufferMap.set(layerObj.buffer, {
                freq: 0,
                parentName: "",
            });
        }
        await this.getBufferFrequency(layerMap);
    }

    private async getBufferFrequency(layerMap) {
        this.layerMap = layerMap;
        const layerMapKeys = layerMap.keys();
        for(let key of layerMapKeys) {
            const value = layerMap.get(key);
            let bufferObj = this.bufferMap.get(value.buffer);
            bufferObj.freq++;
            value.frequency = bufferObj.freq;
            await this.modifyPathNames(value, key, bufferObj);
        }
    }

    private getAllArtLayers(artLayerRef) {
        this.artLayers.push(artLayerRef);
    }

    async modifyPathNames(value, key, bufferObj) {
        if(value.frequency === 1) {
            bufferObj.parentName = value.name;
            await this.setToNameCache(value.name, key);
        }
    }

    private async setToNameCache(layerName, key) {
        if(!~this.nameCache.indexOf(layerName)) {
            this.nameCache.push(layerName);
        } else {
            const layerRef = this.activeDocument.layers.findLayer(key);
            if(utlis.getElementName(layerRef, pc.languages)) {
                return;
            }
            this.logError(key, layerName, `Error in name of ${layerName} with id ${key}`);
            await this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/addErrorPath.jsx"), {id: key});
        }
    }

    private checkSymbols() {
        utlis.traverseBaseFreeGame(this.document.layers, this.inspectSymbols.bind(this));
    }

    private inspectSymbols(viewLayer) {
        if(!viewLayer.layers) {
            return;
        }
        for(let item of viewLayer.layers) {
            if(item.name === pc.generatorButtons.symbols && item.layers) {
                item.layers.forEach(itemS => {
                    this.checkIfStaticEmpty(itemS);
                });
            }
        }
    }

    private checkIfStaticEmpty(item) {
        if(item.type === "layerSection") {
            item.layers && item.layers.forEach(itemS => {
                if(itemS.name === pc.static) {
                    if (!itemS.layers) {
                        this.logError(itemS.id, itemS.name, `Symbol with name ${item.name} has empty Static folder`);
                    } else {
                        this.removeError(itemS.id);
                    }
                }
            });
        }
    }

    private checkImageFolder() {
        this.assetsPath = this.getPath();
        // if(!this.isPluginEnabled()) {
        //     this.logError(1001, "", "Image Assets plugin is not on.");
        // } else {
        //     this.removeError(1001);
        // }
    }

    private isPluginEnabled() {
        return this.imageState.state;
    }

    private async checkLocalisationStruct() {
        const localisationStruct = (this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).docLocalisationStruct;
        if(!localisationStruct) {
            return;
        }
        const langIds = localisationStruct && Object.keys(localisationStruct);
        for(let id of langIds) {
            const idRef = this.activeDocument.layers.findLayer(Number(id));
            await this.createLocalisationResponse(idRef);
        }
    }

    private async createLocalisationResponse(idRef) {
        const platformId = idRef.layer.group.id;
        const wholeHierarchyStruct = [];
        this.getHierarchyStructure(idRef.layer.layers, [], wholeHierarchyStruct);
        await this.sendLocalisationResponse(platformId, idRef.layer.id, wholeHierarchyStruct);
    }

    private getHierarchyStructure(idLayers, hierarchyStruct, wholeHierarchy) {
        let hierarchyClone = [];
        for(let item of idLayers) {
            if(item.layers) {
                hierarchyClone = [...hierarchyStruct];
                hierarchyClone.push(item.id);
                if(!item.layers.length) {
                    hierarchyClone.push(100000);
                    hierarchyClone.push(true);
                    break;
                }
                this.getHierarchyStructure(item.layers, hierarchyClone, wholeHierarchy);
            } else {
                hierarchyClone.push(item.id);
                hierarchyClone.push(true);
            }
        }
        if(~hierarchyClone.indexOf(true)) {
            hierarchyClone = [...hierarchyStruct, ...hierarchyClone];
            if(!~hierarchyClone.indexOf(100000)) {
                hierarchyClone.push(100000);
                hierarchyClone.push(true);
            }
            wholeHierarchy.push(hierarchyClone);
        }
    }

    private async sendLocalisationResponse(platfromId, langId, wholeHierarchyStruct) {
        for(let hierarchyStruct of wholeHierarchyStruct) {
            const hierarchyArray = [platfromId, langId, ...hierarchyStruct];
            const trueIndex = hierarchyArray.indexOf(true);
            const responseObj = {};
            this.createObjectResponse(hierarchyArray, 0, trueIndex-2, responseObj);
            const response = [];
            response.push(responseObj);
            const isTrue = await this.sendResponse(response);
            if(!isTrue) {
                return;
            }
        }
    }

    private createObjectResponse(hierarchyArray, index, finalIndex, response) {
        response = response || {};
        if (index <= finalIndex) {
            response["id"] = hierarchyArray[index];
            response["layers"] = [];
            response["layers"][0] = {};
            if(index === finalIndex) {
                this.createObjectResponse(hierarchyArray, ++index, finalIndex, response["layers"]);
            } else {
                this.createObjectResponse(hierarchyArray, ++index, finalIndex, response["layers"][0]);
            }
        } else {
            let k=0;
            for(let i=index;i<hierarchyArray.length-1;i=i+2) {
                response[k] = {id: hierarchyArray[i]};
                k++;
            }
        }
    }

    private sendResponse(response) {
        return new Promise(resolve => {
            this.docEmitter.once(pc.emitter.layersLocalised, localisedLayers => {
                localisedLayers.toBeLocalised.forEach(id => {
                    this.logError(id, "local", "Need to localise the layer to continue");
                });
                localisedLayers.notToBeLocalised.forEach(id => {
                    this.removeError(id);
                });
                if(localisedLayers.toBeLocalised.length) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
            this.docEmitter.emit(pc.emitter.layersMovedMock, response);
        })
    }

    private checkIsLayoutSuccessful() {

        if(!this.errorData.length) {
            this.initializeLayout();
        }
    }

    private getPath() {
        const path = this.activeDocument.file;
        const extIndex = path.search(/\.(psd)/);
        return path.substring(0, extIndex);
    }

    private initializeLayout() {
        const layout = inject({ref: CreateLayoutStructure, dep: [ModelFactory], isNonSingleton: true});
        execute(layout, {storage: {
                layerMap: this.layerMap,
                bufferMap: this.bufferMap,
                assetsPath: this.assetsPath,
            }, generator: this.generator, activeDocument: this.activeDocument, docEmitter: this.docEmitter});
    }

    private logError(id, name, errorType) {
        if(!utlis.isIDExists(id, this.errorData)) {
            this.errorData.push({id: id, name: name});
            this.docEmitter.emit(pc.logger.logError, id, name, errorType);
        }
    }

    private removeError(id) {
        const beforeLength = this.errorData.length;
        utlis.spliceFrom(id, this.errorData);
        const afterLength = this.errorData.length;
        if (beforeLength > afterLength) {
            this.docEmitter.emit(pc.logger.removeError, id);
        }
    }

}