"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageComponents = void 0;
const constants_1 = require("../../constants");
const path = require("path");
let packageJson = require("../../../package.json");
class ManageComponents {
    execute(params) {
        this.generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.subscribeListeners();
    }
    subscribeListeners() {
        this.generator.on(constants_1.photoshopConstants.generator.layerRenamed, (eventLayers) => this.handleRename(eventLayers));
    }
    handleRename(eventLayers) {
        this.handleAnimationRename(eventLayers);
    }
    handleAnimationRename(eventLayers) {
        return __awaiter(this, void 0, void 0, function* () {
            const renamedLayer = eventLayers[0];
            const genSettings = yield this.generator.getLayerSettingsForPlugin(this.activeDocument.id, renamedLayer.id, packageJson.name);
            if (genSettings !== "animation") {
                return;
            }
            const structRef = this.activeDocument.layers.findLayer(renamedLayer.id);
            if (structRef.layer.layers) {
                const structRefNestedLayers = structRef.layer.layers.length;
                for (let i = 0; i < structRefNestedLayers; i++) {
                    yield this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/addSpecialPath.jsx"), { id: structRef.layer.layers[i].id, parentName: renamedLayer.name,
                        subLayerName: renamedLayer.name });
                }
            }
        });
    }
}
exports.ManageComponents = ManageComponents;
//# sourceMappingURL=ManageComponents.js.map