import {IFactory, IParams} from "../interfaces/IJsxParam";
import {utlis} from "../utils/utils";
import {getAllDirectories, getAllFiles} from "../utils/assetsUtils";
import * as path from "path";
import {PhotoshopFactory} from "./PhotoshopFactory";
import {ModelFactory} from "../models/ModelFactory";
import * as fs from "fs";
let packageJson = require("../../package.json");

export class AssetsSync implements IFactory{
    private generator;
    private photoshopFactory;
    private activeDocument
    private artLayers = {};
    private modelFactory;
    private document;
    
    constructor(modelFactory: ModelFactory, pFactory:PhotoshopFactory){
        this.modelFactory = modelFactory;
        this.photoshopFactory = pFactory;
    }

    async execute(params:IParams){
        this.activeDocument = params.activeDocument;
        this.generator = params.generator;
        this.document = await this.generator.getDocumentInfo(undefined);
        this.artLayers = {};
        utlis.traverseObject(this.document.layers, this.getAllArtLayers.bind(this));
        await this.startAssestsChange();
    }

    private async startAssestsChange() {
        const {qAssetsPath} = utlis.getAssetsAndJson("Photoshop", this.activeDocument);

        if(fs.existsSync(changePath)) {
            const changeFiles = getAllFiles(changePath);
            for(const changeFile of changeFiles) {
                await this.handleFileSyncProcedure(utlis.removeExtensionFromFileName(changeFile), changePath);
                fs.unlinkSync(path.join(changePath, changeFile));
            }
        }
    }

    private async handleFileSyncProcedure(file, assetsPath){
        const artLayers = this.artLayers[file];
        for(let artLayer of artLayers) {
            const name = artLayer.name;
            let parentId = await this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/getParentId.jsx"), {"childName":artLayer.id});
            let parentX = 0;
            let parentY = 0;
            let filePath = path.join(assetsPath, file+".png")
            let dimension = {
                parentX,
                parentY,
                x:artLayer.bounds.left,
                y:artLayer.bounds.top,
                w: (artLayer.bounds.right - artLayer.bounds.left),
                h: (artLayer.bounds.bottom - artLayer.bounds.top),
            }
            let creationObj = {
                dimensions:dimension,
                type:"artLayer",
                childName:name,
                layerID:[artLayer.id],
                image:file,
                parentId:parentId,
                file:filePath
            };
            const bufferPayload = await this.generator.getLayerSettingsForPlugin(this.activeDocument.id, artLayer.id, packageJson.name);
            await this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), {id: artLayer.id});
            const newLayerId = await this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/InsertLayer.jsx"), creationObj);
            await this.generator.setLayerSettingsForPlugin(bufferPayload, newLayerId, packageJson.name);
        }
    }

    private getAllArtLayers(artLayerRef) {
        if(!artLayerRef.generatorSettings) {
            return;
        }
        const platform = utlis.findPlatform(artLayerRef, this.document);
        const view = utlis.findView(artLayerRef, this.document);
        const imageName = JSON.parse(artLayerRef.generatorSettings.PanelScriptsImage.json).image;
        utlis.addKeyToObject(this.artLayers, platform);
        utlis.addKeyToObject(this.artLayers[platform], view);
        const viewObj = this.artLayers[platform][view];
        utlis.addArrayKeyToObject(viewObj, imageName);
        viewObj[imageName].push(artLayerRef);
    }
}