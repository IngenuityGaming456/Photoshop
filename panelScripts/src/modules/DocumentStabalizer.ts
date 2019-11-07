import {IFactory, IParams} from "../interfaces/IJsxParam";
import * as path from "path";
import {utlis} from "../utils/utils";

export class DocumentStabalizer implements IFactory {
    private generator;

    async execute(params: IParams) {
        this.generator = params.generator;
        await this.forceSave();
    }

    private async removeBackgroundLayer() {
        await this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), {level: 1});
    }

    private async forceSave() {
        await this.generator.evaluateJSXString(`app.activeDocument.artLayers.add()`);
        await this.generator.evaluateJSXString(`app.activeDocument.activeLayer.remove()`);
            const response = await this.generator.evaluateJSXString(`try {
                                                                        app.activeDocument.save();
                                                                        }catch(err) {
                                                                         false;
                                                                        }`);
            if (!response) {
                await this.removeBackgroundLayer();
                this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/ShowInterruptionPanel.jsx"), {
                    panelName: "Status",
                    text: "Save Document To Start Working"
                });
            }
    }
}