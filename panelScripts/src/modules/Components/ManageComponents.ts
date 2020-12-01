import {IFactory} from "../../interfaces/IJsxParam";
import {photoshopConstants as pc} from "../../constants";
import * as path from "path"
let packageJson = require("../../../package.json");

export class ManageComponents implements IFactory {

    private generator;
    private activeDocument;

    public execute(params) {
        this.generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.subscribeListeners();
    }

    private subscribeListeners() {
        this.generator.on(pc.generator.layerRenamed, (eventLayers) => this.handleRename(eventLayers));
    }

    private handleRename(eventLayers) {
        this.handleAnimationRename(eventLayers);
    }

    private async handleAnimationRename(eventLayers) {
        const renamedLayer = eventLayers[0];
        const genSettings = await this.generator.getLayerSettingsForPlugin(this.activeDocument.id, renamedLayer.id, packageJson.name);
        if(genSettings !== "animation") {
            return;
        }
        const structRef = this.activeDocument.layers.findLayer(renamedLayer.id);
        if(structRef.layer.layers) {
            const structRefNestedLayers = structRef.layer.layers.length;
            for(let i=0;i<structRefNestedLayers;i++) {
                await this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/addSpecialPath.jsx"),
                    {id: structRef.layer.layers[i].id, parentName: renamedLayer.name,
                        subLayerName: renamedLayer.name});
            }
        }
    }
}