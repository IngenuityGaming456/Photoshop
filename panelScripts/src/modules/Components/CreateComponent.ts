import {Restructure} from "../Restructure";
import * as path from "path";
import {IFactory, IParams} from "../../interfaces/IJsxParam";
import * as layerClass from "../../../lib/dom/layer";
import {ModelFactory} from "../../models/ModelFactory";
import {utlis} from "../../utils/utils";
import {photoshopConstants as pc} from "../../constants";
let packageJson = require("../../../package.json");

export class CreateComponent implements IFactory {
    private _generator;
    private _pluginId;
    private modelFactory;
    private docEmitter;
    private isPaste = false;
    private componentsMap;
    private elementValue;
    private executeCalls = 1;
    private activeDocument;

    public constructor(modelFactory: ModelFactory) {
        this.modelFactory = modelFactory;
    }

    public async execute(params: IParams) {
        this._generator = params.generator;
        this._pluginId = packageJson.name;
        this.docEmitter = params.docEmitter;
        this.componentsMap = params.storage.factoryMap;
        this.activeDocument = params.activeDocument;
        await this.validate(params);
    }

    private async validate(params) {
        const isValid = await this.isValid();
        if(!isValid) {
            this.docEmitter.emit(pc.logger.logWarning, "A component should always be made inside a view");
            return Promise.resolve();
        }
        this.subscribeListeners(this.executeCalls++);
        await this.searchDocument();
        this.elementValue = this.modelFactory.getMappingModel().getComponentsMap().get(params.menuName);
        let sequenceId = Restructure.sequenceStructure(this.elementValue);
        let id = await this.callComponentJsx(sequenceId, params.menuName);
        await this.controlJSXReturn(id, this.elementValue);
        this.elementValue.elementArray.push({id: id, sequence: sequenceId});
    }

    private async isValid() {
        let selectedLayersString = await this._generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/SelectedLayersIds.jsx"));
        const selectedLayersIdArray = selectedLayersString.toString().split(",");
        const layers: layerClass.LayerGroup = this.activeDocument.layers;
        const selectedRef = layers.findLayer(Number(selectedLayersIdArray[0]));
        return this.isCorrectSelection(selectedRef);
    }

    private isCorrectSelection(selectedRef) {
        if(!selectedRef) {
            return false;
        }
        let layerRef;
        if(selectedRef.layer) {
            layerRef = selectedRef.layer;
        }
        if(selectedRef.name) {
            layerRef = selectedRef;
        }
        if(!layerRef) {
            return false;
        }
        if(layerRef.group && layerRef.group.name && ~layerRef.group.name.search((/common/))) {
            return true;
        }
        return this.isCorrectSelection(layerRef.group);
    }

    private subscribeListeners(executeCalls) {
        if(executeCalls === 1) {
            this._generator.on(pc.generator.layersDeleted, (eventLayers) => this.handleChange(eventLayers));
            this._generator.on(pc.generator.layerRenamed, (eventLayers) => this.handleChange(eventLayers));
            this._generator.on(pc.generator.paste, () => this.onPaste());
            this._generator.on(pc.generator.layersAdded, eventLayers => this.onLayersAddition(eventLayers));
        }
    }

    private async controlJSXReturn(id, elementValue) {
        try {
            await this.isID(id,elementValue);
            (await this.isBitmap(id, elementValue))
                .isInvalidSpecialItem(id)
                .isInvalidBitmap(id);
        } catch(err) {
            console.log("return controlled");
        }
    }

    private async isID(id, elementValue) {
        if(Number(id)) {
            await this.setGeneratorSettings(id, elementValue.label.toLowerCase(), this._pluginId);
            this.docEmitter.emit("componentAdded", elementValue.label.toLowerCase());
            throw new Error("Control Done");
        }
        const returnArray = id.split(",");
        if(returnArray[0] && returnArray[1] && ~returnArray[1].search(/(Paylines|Symbols|WinFrames)/)) {
            const returnCount = returnArray.length;
            for(let i=2;i<returnCount;i++) {
                await this.setGeneratorSettings(Number(returnArray[i]), elementValue.label.toLowerCase(), this._pluginId)
            }
        }
    }

    private async isBitmap(id, elementValue) {
        const returnArray = id.split(",");
        if(Number(returnArray[0])) {
            await this.setGeneratorSettings(returnArray[0], elementValue.label.toLowerCase(), this._pluginId);
            await this.setGeneratorSettings(returnArray[0], returnArray[1], this._pluginId + "Bitmap");
            throw new Error("Control Done");
        }
        return this;
    }

    private isInvalidSpecialItem(id) {
        const returnArray = id.split(",");
        if(returnArray[0] === pc.jsxReturn.falseType) {
            this.docEmitter.emit(pc.logger.logWarning, `Need to select ${returnArray[1]} from the document tree`);
            throw new Error("Control Done");
        }
        return this;
    }

    private isInvalidBitmap(id) {
        const returnArray = id.split(",");
        if(returnArray[0] === pc.jsxReturn.bitmapType) {
            this.docEmitter.emit(pc.logger.logWarning, `No bitmap font is found at "others/Bitmaps"`);
            throw new Error("Control Done");
        }
        if(returnArray[0] === pc.jsxReturn.bitmapTypeExtra) {
            this.docEmitter.emit(pc.logger.logWarning, `png file corresponding to bitmap is not found`);
        }
    }

    private handleChange(eventLayers) {
        if(this.isPaste) {
            this.isPaste = false;
            return;
        }
        const componentsMap = this.modelFactory.getMappingModel().getComponentsMap();
        componentsMap.forEach(item => {
            Restructure.searchAndModifyControlledArray(eventLayers, item);
        });
    }

    private async callComponentJsx(sequenceId: number, jsxName: string): Promise<number> {
        let jsxPath = path.join(__dirname, "../../../jsx/" + jsxName + ".jsx");
        await this._generator.evaluateJSXString(`alert({jsxPath})`);
        return await this._generator.evaluateJSXFile(jsxPath, {clicks: sequenceId});
    }

    private async setGeneratorSettings(id, insertion, pluginId) {
        await this._generator.setLayerSettingsForPlugin(insertion, id, pluginId);
    }

    private onPaste() {
        this.isPaste = true;
    }

    private onLayersAddition(eventLayers) {
        if(this.isPaste) {
            utlis.traverseAddedLayers(eventLayers, this.onAddition.bind(this));
        }
    }

    private onAddition(addedLayer) {
        this._generator.once(pc.generator.documentResolved, () => {
            const component = this.isComponent(addedLayer.name);
            if(component) {
                if(this.isInLanguage(addedLayer)) {
                    return;
                }
                const sequenceId = Restructure.sequenceStructure(this.elementValue);
                this._generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/RenameErrorLayer.jsx"), {
                    id: addedLayer.id,
                    level: 1,
                    index: component.index,
                    sequence: sequenceId
                });
                this.elementValue.elementArray.push({id: addedLayer.id, sequence: sequenceId});
            }
        });
    }

    private isInLanguage(addedLayer) {
        const addedLayerRef = this.activeDocument.layers.findLayer(addedLayer.id);
        return !!utlis.getElementName(addedLayerRef, pc.languages);
    }

    private isComponent(layerName) {
        const componentValues = this.componentsMap.values();
        for(let key of componentValues) {
            const labelName = key.label;
            const labelIndex = layerName.search(labelName);
            if(labelIndex === 0) {
                const sequence = layerName.substring(labelName.length);
                if(Number(sequence)) {
                    return {
                        sequence: Number(sequence),
                        index: labelName.length
                    }
                }
            }
        }
        return null;
    }

    private async searchDocument() {
        if (this.executeCalls !== 2) {
            return;
        }
        const componentValues = this.componentsMap.values();
        for (let value of componentValues) {
            this.searchInDocument(value, this.activeDocument.layers.layers);
        }
    }
    
    private searchInDocument(value, activeLayers) {
        const layersCount = activeLayers.length;
        for(let i=0;i<layersCount;i++) {
            const layerRef = activeLayers[i];
            const layerName = layerRef.name;
            const position = layerName.search(value.label);
            if (position === 0) {
                const sequenceId = layerName.slice(value.label.length);
                if(Number(sequenceId)) {
                    value.elementArray.push({
                        id: layerRef.id,
                        sequence: Number(sequenceId)
                    });
                }
            }
            if(layerRef.layers) {
                this.searchInDocument(value, layerRef.layers);
            }
        }
    }

}