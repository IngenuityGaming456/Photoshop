import {IFactory, IModel, IParams, ISubjectEvent} from "../interfaces/IJsxParam";
import * as fs from "fs";
let packageJson = require("../../package.json");

export class PhotoshopEventSubject implements ISubjectEvent, IFactory {
 
    private observerList: Array<IModel> = [];
    private generator;
    private activeDocument;
    private isState: Function;

    public execute(params: IParams) {
        this.generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.subscribeListeners();
    }

    public subscribeListeners() {
        this.generator.on("observerAdd", observer => this.add(observer));
        this.generator.on("observerRemove", observer => this.remove(observer));
        this.generator.on("save", () => this.onPhotoshopClose());
        this.generator.on("xyz", () => this.onPhotoshopOpen());
    }

    private async onPhotoshopClose() {
        const docId = await this.generator.getDocumentSettingsForPlugin(this.activeDocument.id,
            packageJson.name + "Document");
        this.createFolder(docId);
        this.isState = this.photoshopCloseCallback;
        this.notify();
    }

    private onPhotoshopOpen() {
        this.isState = this.photoshopStartCallback;
        this.notify();
    }

    public createFolder(docId) {
        if(this.activeDocument.directory) {
            const filteredPath = this.activeDocument.directory + "\\" + docId;
            if (!fs.existsSync(filteredPath)) {
                fs.mkdirSync(filteredPath);
            }
        }
    }

    private photoshopCloseCallback(observer: IModel) {
        observer.onPhotoshopClose();
    }

    private photoshopStartCallback(observer: IModel) {
        observer.onPhotoshopStart();
    }

    public add(observer: IModel) {
        this.observerList.push(observer);
    }

    public notify() {
        this.observerList.forEach(factoryItem => {
            this.isState(factoryItem);
        });
    }

    public remove(observer: IModel) {
        //remove an observer
    }
    
}