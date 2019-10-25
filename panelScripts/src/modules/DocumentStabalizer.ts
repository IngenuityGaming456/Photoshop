import {IFactory, IParams} from "../interfaces/IJsxParam";
import * as path from "path";
import * as fs from "fs";
import {utlis} from "../utils/utils";

export class DocumentStabalizer implements IFactory {
    private openDocumentData;
    private generator;
    private docId;

    async execute(params: IParams) {
        this.openDocumentData = params.storage.openDocumentData;
        this.generator = params.generator;
        this.docId = params.storage.docId;
        if(!this.openDocumentData) {
            utlis.makeDir("D:\\PSDFromScripts");
            await this.removeBackgroundLayer();
        }
        await this.forceSave();
    }

    private async removeBackgroundLayer() {
        await this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), {level: 1});
    }

    private async forceSave() {
        const savePath = "D:/PSDFromScripts/" + this.docId + ".psd";
        const result = await this.generator.evaluateJSXString(`app.activeDocument.saveAs(File("${savePath}"))`);
    }

}