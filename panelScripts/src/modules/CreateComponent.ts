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
        this.subscribeListeners();
        let elementValue = this.modelFactory.getMappingModel().getComponentsMap().get(params.menuName);
        let sequenceId = Restructure.sequenceStructure(elementValue);
        let id = await this.callComponentJsx(sequenceId, params.menuName);
        await this.setGeneratorSettings(id, elementValue);
        elementValue.elementArray.push({id: id, sequence: sequenceId});
    }

    private subscribeListeners() {
        this._generator.on("layersDeleted", (eventLayers) => this.handleChange(eventLayers));
        this._generator.on("layerRenamed", (eventLayers) => this.handleChange(eventLayers));
    }

    private handleChange(eventLayers) {
        const componentsMap = this.modelFactory.getMappingModel().getComponentsMap();
        componentsMap.forEach(item => {
            Restructure.searchAndModifyControlledArray(eventLayers, item);
        });
    }

    private async callComponentJsx(sequenceId: number, jsxName: string): Promise<number> {
        let jsxPath = path.join(__dirname, "../../jsx/" + jsxName + ".jsx");
        return await this._generator.evaluateJSXFile(jsxPath, {clicks: sequenceId});
    }

    private async setGeneratorSettings(id, elementValue) {
        await this._generator.setLayerSettingsForPlugin(elementValue.label, id, this._pluginId)
    }

}