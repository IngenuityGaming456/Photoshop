import {IFactory, IParams} from "../interfaces/IJsxParam";
import {utlis} from "../utils/utils";
import * as fs from "fs";
import * as path from "path";
import {PhotoshopFactory} from "./PhotoshopFactory";
import {ModelFactory} from "../models/ModelFactory";
let packageJson = require("../../package.json");

export class AssetsSync implements IFactory{
    private generator;
    private psAssetsPath;
    private photoshopFactory;
    private psObj;
    private activeDocument
    private document;
    private artLayers = new Map();
    private modelFactory;
    
    constructor(modelFactory: ModelFactory, pFactory:PhotoshopFactory){
        this.modelFactory = modelFactory;
        this.photoshopFactory = pFactory;
    }

    async execute(params:IParams){
        this.activeDocument = params.activeDocument;
        this.generator = params.generator;
        this.document = await this.generator.getDocumentInfo(undefined);
       
        this.getAssetsAndJson();
        this.assetsSyncDriver();
    }

    private getAssetsAndJson() {
        const stats =  utlis.getAssetsAndJson("Photoshop", this.activeDocument);
        this.psAssetsPath = stats.qAssetsPath;
        this.psObj = stats.qObj;
 
    }

    private assetsSyncDriver(){
        const assetsPath = this.psAssetsPath;
        /**as we are at the root of the assets folder */
        let level = 0;
        utlis.traverseObject(this.psObj.layers, this.getAllArtLayers.bind(this));
        // this.artLayers.reverse();
        this.searchForChangedAssets(level, assetsPath, null, 'common', null);
    }

    private async searchForChangedAssets(level, assetsPath, platform, common, view){
        const files = fs.readdirSync(assetsPath);

        for(const file of files){
            switch(level){
                case 0 : platform = file;
                break;
                case 1 : common = file;
                break;
                case 2 : view = file;
            }
            const filePath = path.join(assetsPath, file);
            const stats = fs.statSync(filePath);

            if(stats.isDirectory() && level <= 3){
                this.searchForChangedAssets(level+1, filePath, platform, common, view);
            }

            if(level === 4){
                const currentFile = this.removeExtensionFromFileName(file);
                await this.handleFileSyncProcedure(currentFile, assetsPath, platform, common, view);

                fs.unlinkSync(filePath);
            }
        }

        
    }

    private async handleFileSyncProcedure(file, assetsPath, platform, common, view){

        const artLayer = this.artLayers.get(file);
            
            if( artLayer && artLayer.type == "layer"){
                const imageName = JSON.parse(artLayer.generatorSettings.PanelScriptsImage.json).image;
                const name = artLayer.name;
                // const name = this.removeExtensionFromFileName(file);
                const type = artLayer.type;
                let viewId = this.getParentId(view, platform);
                let parentId = await this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/getParentId.jsx"), {"childName":artLayer.id, "parentId": viewId});
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
                    image:imageName,
                    parentId:parentId,
                    file:filePath
                };
                const bufferPayload = await this.generator.getLayerSettingsForPlugin(this.activeDocument.id, artLayer.id, packageJson.name);
                await this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), {id: artLayer.id});
                const newLayerId = await this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/InsertLayer.jsx"), creationObj);
                await this.generator.setLayerSettingsForPlugin(bufferPayload, newLayerId, packageJson.name);
            }
     
        // for(const artLayer of this.artLayers){

        //     const imageName = JSON.parse(artLayer.generatorSettings.PanelScriptsImage.json).image;
        //     if( imageName === file && artLayer.type == "layer"){
        //         const name = artLayer.name;
        //         // const name = this.removeExtensionFromFileName(file);
        //         const type = artLayer.type;
        //         let viewId = this.getParentId(view, platform);
        //         let parentId = await this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/getParentId.jsx"), {"childName":artLayer.id, "parentId": viewId});
        //         let parentX = 0;
        //         let parentY = 0;
        //         let filePath = path.join(assetsPath, file+".png")
        //         let dimension = {
        //             parentX,
        //             parentY,
        //             x:artLayer.bounds.left,
        //             y:artLayer.bounds.top,
        //             w: (artLayer.bounds.right - artLayer.bounds.left),
        //             h: (artLayer.bounds.bottom - artLayer.bounds.top),
        //         }
        //         let creationObj = {
        //             dimensions:dimension,
        //             type:"artLayer",
        //             childName:name,
        //             layerID:[artLayer.id],
        //             image:imageName,
        //             parentId:parentId,
        //             file:filePath
        //         };
        //         const bufferPayload = await this.generator.getLayerSettingsForPlugin(this.activeDocument.id, artLayer.id, packageJson.name);
        //         await this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), {id: artLayer.id});
        //         const newLayerId = await this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/InsertLayer.jsx"), creationObj);
        //         await this.generator.setLayerSettingsForPlugin(bufferPayload, newLayerId, packageJson.name);
        //     }
        // }
    }

    private getAllArtLayers(artLayerRef) {
        // this.artLayers.push(artLayerRef);
        this.artLayers.set(JSON.parse(artLayerRef.generatorSettings.PanelScriptsImage.json).image,artLayerRef)
    }

    private getParentId(view, platform) {
        const elementalMap = this.modelFactory.getPhotoshopModel().viewElementalMap;
        const currentView = elementalMap[platform][view];
        return currentView.base.id;
    }

    private removeExtensionFromFileName(file){
        return file.split('.').slice(0, -1).join('.')
    }
}

