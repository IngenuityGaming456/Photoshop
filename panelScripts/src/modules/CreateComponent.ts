import {Restructure} from "./Restructure";
import * as path from "path";
import {IFactory, IParams} from "../interfaces/IJsxParam";
import * as layerClass from "../../lib/dom/layer";
import {ModelFactory} from "../models/ModelFactory";
let packageJson = require("../../package.json");

export class CreateComponent implements IFactory{
    private _generator;
    private _pluginId;
    private modelFactory;

    public constructor(modelFactory: ModelFactory) {
        this.modelFactory = modelFactory;
    }

    public async execute(params: IParams) {
        this._generator = params.generator;
        this._pluginId = packageJson.name;
        let elementValue = this.modelFactory.getMappingModel().getComponentsMap().get(params.menuName);
        let sequenceId = Restructure.sequenceStructure(elementValue);
        let id = await this.callComponentJsx(sequenceId, params.menuName);
        await this.setGeneratorSettings(id, elementValue);
        // const docLayers: layerClass.LayerGroup = params.activeDocument.layers;
        // const parentRef = docLayers.findLayer(id);
        // parentRef.layer._setGeneratorSettings({
        //     [this._pluginId] : elementValue.label
        // });
        let controlledArray = elementValue.elementArray;
        controlledArray.push({id: id, sequence: sequenceId});
    }

    private async callComponentJsx(sequenceId: number, jsxName: string): Promise<number> {
        let jsxPath = path.join(__dirname, "../../jsx/" + jsxName + ".jsx");
        return await this._generator.evaluateJSXFile(jsxPath, {clicks: sequenceId});
    }

    private async setGeneratorSettings(id, elementValue) {
        await this._generator.setLayerSettingsForPlugin(elementValue.label, id, this._pluginId)
    }

}