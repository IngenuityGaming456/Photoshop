import {IFactory, IParams} from "../interfaces/IJsxParam";
import {ModelFactory} from "../models/ModelFactory";
import {utlis} from "../utils/utils";
import * as path from "path";
import {PhotoshopModelApp} from "../../srcExtension/models/PhotoshopModels/PhotoshopModelApp";
import {photoshopConstants as pc} from "../constants";
let languagesJson = require("../res/languages.json");

export class Validation implements IFactory {
    private modelFactory: ModelFactory;
    private generator;
    private activeDocument;
    private readonly layersErrorData;
    private docEmitter;
    private alreadyRenamed = [];

    public constructor(modelFactory: ModelFactory) {
        this.modelFactory = modelFactory;
        this.layersErrorData = this.modelFactory.getPhotoshopModel().allLayersErrorData;
    };

    public execute(params: IParams) {
        this.generator = params.generator;
        this.docEmitter = params.docEmitter;
        this.activeDocument = params.activeDocument;
        this.subscribeListeners();
    }

    private subscribeListeners() {
        this.generator.on(pc.generator.layerRenamed, async eventLayers => await this.onLayersRename(eventLayers));
        this.generator.on(pc.generator.layersDeleted, eventLayers => this.onLayersDeleted(eventLayers));
        this.generator.on(pc.generator.layersAdded, eventLayers => this.waitForDocumentResolution(eventLayers));
        this.generator.on(pc.generator.layersAdded, eventLayers => this.checkForNumericName(eventLayers));
        this.generator.on(pc.generator.layersMoved, eventLayers => this.waitForDocumentResolution(eventLayers));
        this.docEmitter.on(pc.emitter.layersMovedMock, eventLayers => this.onLayersLocalised(eventLayers, true));
    }

    private checkForNumericName(eventLayers) {
        utlis.traverseAddedLayers(eventLayers, this.isNumericInAdded.bind(this));
    }

    private isNumericInAdded(item) {
        if(~item.name.search(/^[\W\d_]+/)) {
            this.docEmitter.emit(pc.logger.logWarning, "Not allowed to add Items with special characters");
            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), {id: item.id});
        }
    }

    private isInHTML(key, id, questArray, drawnQuestItems) {
        if(~questArray.indexOf(key) && !utlis.isIDExists(id, drawnQuestItems) && !~this.alreadyRenamed.indexOf(id)) {
            this.docEmitter.emit(pc.logger.logWarning, `Not allowed to create HTML Container, ${key} with id = ${id}`);
            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), {id: id});
            throw new Error("Validation Stopped");
        }
        return this;
    }

    private async onLayersRename(eventLayers) {
        const questArray = this.modelFactory.getPhotoshopModel().allQuestItems;
        const drawnQuestItems = this.modelFactory.getPhotoshopModel().allDrawnQuestItems;
        await this.startValidationSequence(eventLayers, questArray, drawnQuestItems);
        this.isErrorFree(eventLayers, this.errorFreeFromRename.bind(this));
    }

    private onLayersDeleted(eventLayers) {
        this.isErrorFree(eventLayers, this.errorFreeFromDeletion.bind(this));
    }

    private waitForDocumentResolution(eventLayers, isOmit?) {
        this.generator.once(pc.generator.documentResolved, () => this.onLayersLocalised(eventLayers, isOmit));
    }

    private async onLayersLocalised(eventLayers, isOmit?) {
        const localisationStructure = (this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).docLocalisationStruct;
        const langIds = localisationStructure && Object.keys(localisationStructure);
        if(!langIds) {
            return;
        }
        for(let langId of langIds) {
            const langRef = utlis.isIDExistsRec(langId, eventLayers);
            if(langRef) {
                const langStructArray = [];
                this.createLangStructArray(langStructArray, eventLayers, langRef);
                const langStructArrays = utlis.breakArrayOnTrue(langStructArray);
                for(let langArray of langStructArrays) {
                    this.modifyLangArray(langArray);
                    const compareStruct = this.makeCompareStruct(langArray);
                    await this.compareLocalisation(compareStruct, localisationStructure, langRef.id, isOmit);
                }
            }
        }
    }

    private modifyLangArray(langArray) {
        const langId = langArray[0];
        const langIdRef = this.activeDocument.layers.findLayer(langId);
        if(!(~languagesJson["languages"].indexOf(langIdRef.layer.name))) {
            const actualLangId = langIdRef.layer.group.id;
            langArray.unshift(actualLangId);
        }
    }

    private createLangStructArray(langStructArray, eventLayers, langRef) {
        eventLayers.forEach(layer => {
            if(layer.id > langRef.id) {
                langStructArray.push(layer.id);
            }
            if(layer.layers) {
                this.createLangStructArray(langStructArray, layer.layers, langRef);
            } else {
                langStructArray.push(true);
            }
        })
    }

    private makeCompareStruct(langStructArray) {
        const localisedObj = this.interpretLocalisedStruct(langStructArray);
        const localisedLayers = localisedObj.localised;
        const localisedStruct = localisedObj.struct;
        return {
            langId: langStructArray[0],
            localisedLayers: localisedLayers,
            localisedStruct: localisedStruct
        }
    }

    private interpretLocalisedStruct(langStructArray) {
        const langStructLength = langStructArray.length;
        let trueIndex = langStructLength + 1;
        const localisedArray = [];
        const structArray = [];
        for(let index in langStructArray) {
            if(langStructArray[index] === true) {
                trueIndex = index;
                break;
            }
        }
        for(let i=trueIndex-1;i<langStructLength;i=i+2) {
            localisedArray.push(langStructArray[i]);
        }
        for(let i=1;i<=trueIndex-2;i++) {
            structArray.push(langStructArray[i]);
        }
        return {
            localised: localisedArray,
            struct: structArray
        }
    }

    private async compareLocalisation(compareStruct, localisationStructure, langId, isOmit?) {
        const langRef = this.activeDocument.layers.findLayer(compareStruct.langId);
        if(!langRef) {
            return;
        }
        const langName = langRef.layer.name;
        const toCompareWith = localisationStructure[langId][langName];
        for (let item of compareStruct.localisedLayers) {
            const localisedRef = this.activeDocument.layers.findLayer(item);
            if(!localisedRef && item === 100000) {
                const localisedObj = await this.showLocalisationWarning(compareStruct.localisedStruct, langId, langName);
                this.docEmitter.emit(pc.emitter.layersLocalised, localisedObj);
                return;
            }
            if(!localisedRef) {
                return;
            }
            this.compareFromLocalisedName(localisedRef, toCompareWith, compareStruct.localisedStruct, langId, langName, isOmit);
        }
    }

    private compareFromLocalisedName(localisedRef, toCompareWith, compareStruct, langId, langName, isOmit?) {
        const compareArray = [];
        for(let key in toCompareWith) {
            if(!toCompareWith.hasOwnProperty(key)) {
                continue;
            }
            const struct = toCompareWith[key]["struct"];
            const structNames = this.getStructNames(struct);
            const compareStructNames = this.getCompareStructNames(compareStruct);
            if(utlis.containAll(structNames, compareStructNames).isTrue) {
                const localisedCompare = this.activeDocument.layers.findLayer(toCompareWith[key]["localise"]);
                const localisedCompareName = localisedCompare.layer.name;
                const localisedCompareId = localisedCompare.layer.id;
                if(localisedCompareName !== localisedRef.layer.name) {
                    compareArray.push({isTrue: false});
                } else {
                    compareArray.push({isTrue: true, id: localisedCompareId});
                }
            }
        }
        for(let item of compareArray) {
            if(item.isTrue === true) {
                console.log("Same Image Entered");
                this.docEmitter.emit(pc.emitter.layersLocalised, {
                    toBeLocalised: [],
                    notToBeLocalised: [item.id]
                });
                return;
            }
        }
        this.checkImageStatus(localisedRef, compareStruct, langId, langName, isOmit);
    }

    private getStructNames(struct) {
        const structNames = [];
        for(let item of struct) {
            structNames.push(item.name);
        }
        return structNames;
    }

    private getCompareStructNames(compareStruct) {
        const compareStructNames = [];
        for(let item of compareStruct) {
            const layerName = this.activeDocument.layers.findLayer(item).layer.name;
            compareStructNames.push(layerName);
        }
        return compareStructNames;
    }

    private async checkImageStatus(localisedRef, compareStruct, langId, langName, isOmit?) {
        const localisedId = localisedRef.layer.id;
        if(isOmit) {
            const localisedObj = await this.showLocalisationWarning(compareStruct, langId, langName);
            this.docEmitter.emit(pc.emitter.layersLocalised, localisedObj);
            return;
        }
        if (this.isInvalidImage(compareStruct, langId, langName)) {
            this.docEmitter.emit(pc.logger.logWarning, "Can't enter new image without localising old ones");
            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"),
                {id: localisedId});
        }
        if(this.isLocalisationSafe(compareStruct, langId, langName)) {
            console.log("add without any issues");
        } else {
            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"),
                {id: localisedId});
            this.showLocalisationWarning(compareStruct, langId, langName);
        }
    }

    private isInvalidImage(compareStruct, langId, langName) {
        const localisedLayers = this.getLocalisedLayers(compareStruct, langId, langName).localisedLayers;
        const localisingLayers = this.getLocalisingLayers(compareStruct);
        return !utlis.containAll(localisedLayers, localisingLayers).isTrue;
    }
    
    private isLocalisationSafe(compareStruct, langId, langName) {
        const localisedLayers = this.getLocalisedLayers(compareStruct, langId, langName).localisedLayers;
        const localisingLayers = this.getLocalisingLayers(compareStruct);
        return utlis.containAll(localisedLayers, localisingLayers).isTrue && (localisingLayers.length > localisedLayers.length);
    }

    private async showLocalisationWarning(compareStruct, langId, langName) {
        const localisedObj = this.getLocalisedLayers(compareStruct, langId, langName);
        const localisingLayers = this.getLocalisingLayers(compareStruct);
        const containObj = utlis.containAll(localisedObj.localisedLayers, localisingLayers);
        const toBeLocalised = [];
        const notToBeLocalised = [];
        if(!containObj.isTrue) {
            const delocalisedLayers = containObj.delocalisedLayers;
            for(let name of delocalisedLayers) {
                const indexName = localisedObj.localisedLayers.indexOf(name);
                const id = localisedObj.localisedLayersIds[indexName];
                const response = await this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/ShowOptionPanel.jsx"),
                    {name: name});
                if(response === "no") {
                    const langStruct = (this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).docLocalisationStruct;
                    const langObj = langStruct[langId][langName];
                    let deletionKey;
                    for(let item in langObj) {
                        if(!langObj.hasOwnProperty(item)) {
                            continue;
                        }
                        if(langObj[item]["localise"] === id) {
                            deletionKey = item;
                            break;
                        }
                    }
                    delete langObj[deletionKey];
                    notToBeLocalised.push(id);
                    const deletedLayers = [];
                    this.deleteLocalisedStructFromPhotoshop(compareStruct[compareStruct.length - 1], null, deletedLayers);
                    this.deleteLayersFromPhotoshop(deletedLayers);
                } else if(response === "yes") {
                    toBeLocalised.push(id);
                }
            }
        }
        return {
            toBeLocalised: toBeLocalised,
            notToBeLocalised: notToBeLocalised
        }
    }
    
    private getLocalisingLayers(compareStruct) {
        const localisingLayers = [];
        const compLocalisedLength = compareStruct.length;
        const localisationContainerId = compareStruct[compLocalisedLength - 1];
        const containerRef = this.activeDocument.layers.findLayer(localisationContainerId);
        const localisingPhotoshopLayers = containerRef && containerRef.layer.layers;
        for(let item of localisingPhotoshopLayers) {
            localisingLayers.push(item.name);
        }
        return localisingLayers;
    }
    
    private getLocalisedLayers(compareStruct, langId, langName) {
        const localisedLayers = [];
        const localisedLayersIds = [];
        const localisationStructure = (this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).docLocalisationStruct;
        const langStruct = localisationStructure[langId][langName];
        for (let item in langStruct) {
            if (!langStruct.hasOwnProperty(item)) {
                continue;
            }
            const struct = langStruct[item]["struct"];
            const structNames = this.getStructNames(struct);
            const compareStructNames = this.getCompareStructNames(compareStruct);
            if (utlis.containAll(structNames, compareStructNames).isTrue) {
                const localisedLayerId = langStruct[item]["localise"];
                const localisedLayerName = this.activeDocument.layers.findLayer(localisedLayerId).layer.name;
                localisedLayers.push(localisedLayerName);
                localisedLayersIds.push(localisedLayerId);
            }
        }
        return {
            localisedLayers: localisedLayers,
            localisedLayersIds: localisedLayersIds
        }
    }

    private deleteLocalisedStructFromPhotoshop(lastId, previousId, deletedLayers) {
        const lastIdRef = this.activeDocument.layers.findLayer(lastId);
        if(~languagesJson.languages.indexOf(lastIdRef.layer.name)) {
            deletedLayers.push(lastIdRef.layer.id);
            return;
        }
        if(!(lastIdRef.layer.layers && lastIdRef.layer.layers.length)) {
            deletedLayers.push(lastId);
            lastIdRef.layer.group && this.deleteLocalisedStructFromPhotoshop(lastIdRef.layer.group.id, lastId, deletedLayers);
        } else {
            if(!utlis.isLayerExists(lastIdRef, previousId)) {
                deletedLayers.push(lastId);
                previousId = lastId;
                lastIdRef.layer.group && this.deleteLocalisedStructFromPhotoshop(lastIdRef.layer.group.id, previousId, deletedLayers);
            }
        }
    }

    private deleteLayersFromPhotoshop(deletedLayers) {
        for(let item of deletedLayers) {
            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"),
                {id: item});
        }
    }

    private async startValidationSequence(eventLayers, questArray, drawnQuestItems) {
        try {
            (await this.drawnQuestItemsRenamed(eventLayers[0].name, eventLayers[0].id, drawnQuestItems))
                .isInHTML(eventLayers[0].name, eventLayers[0].id, questArray, drawnQuestItems)
                .isNumeric(eventLayers[0].name, eventLayers[0].id)
                .renameSelfStructures(eventLayers[0].name, eventLayers[0].id)
        } catch(err) {
            console.log("Validation Stopped");
        }
    }

    private async drawnQuestItemsRenamed(name, id, drawnQuestItems) {
        const selectedIdPrevName = (this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).selectedName;
        const layerId = (this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).selectedNameId;

        if((this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).isRemoval) {
            if((this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).lastRemovalId === Number(id)) {
                (this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).isRemoval = false;
            }
            throw new Error("Validation Stop");
        }
        if((this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).isRenamedFromLayout) {
            if((this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).lastRename === Number(id)) {
                (this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).isRenamedFromLayout = false;
            }
            return this;
        }
        const layerRef = this.activeDocument.layers.findLayer(Number(layerId));
            const questItem = drawnQuestItems.find(item => {
                if(item.id === id && item.name !== name) {
                    return true;
                }
            });
            if (questItem && questItem.name !== "generic") {
                this.docEmitter.emit(pc.logger.logWarning, `Not allowed to rename Quest Item, ${questItem.name} with id = ${id}`);
                this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/UndoRenamedLayer.jsx"),
                    {id: questItem.id, name: questItem.name});
                throw new Error("Validation Stop");
            }
            if(utlis.getElementName(layerRef, pc.languages)) {
                if(selectedIdPrevName != name) {
                    this.docEmitter.emit(pc.logger.logWarning, `Can't rename an item inside languages`);
                    this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/UndoRenamedLayer.jsx"),
                        {id: layerRef.layer.id, name: selectedIdPrevName});
                }
                throw new Error("Validation Stop");
            }
            return this;
    }

    private isNumeric(name, id) {
        if(~name.search(/^[\W\d_]+/)) {
            const selectedIdPrevName = (this.modelFactory.getPhotoshopModel() as PhotoshopModelApp).selectedName;
            this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/UndoRenamedLayer.jsx"),
                {id: id, name: selectedIdPrevName});
            this.docEmitter.emit(pc.logger.logWarning, "Names Starting with Special characters are not allowed");
            throw new Error("Validation Stop");
        }
        return this;
    }

    private isErrorFree(eventLayers, callback) {
        const errorData = callback(eventLayers);
        for(let errorElm of errorData) {
            utlis.spliceFrom(errorElm.id, this.layersErrorData);
            this.docEmitter.emit(pc.logger.removeError, errorElm.id);
        }
    }

    private errorFreeFromRename(eventLayers) {
        return this.layersErrorData.filter(item => {
            if (item.id === eventLayers[0].id && !~eventLayers[0].name.search(/(Error)/)) {
                return true;
            }
        });
    }

    private errorFreeFromDeletion(eventLayers) {
        return this.layersErrorData.filter(item => {
            const isInDeletedLayers = utlis.isIDExists(item.id, eventLayers);
            if(isInDeletedLayers) {
                return true;
            }
        })
    }

    private renameSelfStructures(name, id) {
        const elementalMap = this.modelFactory.getPhotoshopModel().viewElementalMap;
        utlis.renameElementalMap(elementalMap, name, id);
    }
}