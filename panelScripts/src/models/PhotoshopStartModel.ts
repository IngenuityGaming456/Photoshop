import {IModel, IParams} from "../interfaces/IJsxParam";
import * as fs from "fs";
let packageJson = require("../../package.json");
import {photoshopConstants as pc} from "../constants";

export class PhotoshopStartModel implements IModel {

    private generator;
    private activeDocument;
    private writeObj = {};
    private openDocumentData;
    private docIdObj;

    public execute(params: IParams) {
        this.writeObj = {};
        this.docIdObj = null;
        this.openDocumentData = null;
        this.generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.subscribeListeners();
    }

    private subscribeListeners() {
        this.generator.on(pc.generator.writeData, (data, isComplete?) => this.onWriteData(data, isComplete));
        this.generator.on(pc.generator.docId, (docId) => {
            this.docIdObj.docId = docId;
        });
    }

    private onWriteData(data, isComplete?) {
        this.writeObj = Object.assign(this.writeObj, data);
        isComplete && this.writeDataAtPath();
    }

    private async writeDataAtPath() {
        const result = JSON.stringify(this.writeObj, null, "  ");
        fs.writeFile(this.activeDocument.directory + "\\" + this.docIdObj.docId + "/States.json", result, err => {
            if(err) {
                console.log(err);
            }
        });
    }

    public async onPhotoshopStart() {
        this.docIdObj = await this.generator.getDocumentSettingsForPlugin(this.activeDocument.id,
            packageJson.name + "Document");
        if(!Object.keys(this.docIdObj).length) {
            return null;
        }
        const data = fs.readFileSync( this.activeDocument.directory + "\\" + this.docIdObj.docId + "/States.json", {encoding: "utf8"});
        this.openDocumentData = JSON.parse(data);
        return this.openDocumentData;
    }

    public onPhotoshopClose() {
    }

}