import {IFactory, IParams} from "../../interfaces/IJsxParam";
import {utlis} from "../../utils/utils";
import {allCommonDispatch, allViewDispatch, getAllDirectories, getAllFiles, upperDispatch} from "./assetsUtils";
import * as path from "path";
import {PhotoshopFactory} from "../PhotoshopFactory";
import {ModelFactory} from "../../models/ModelFactory";
import {photoshopConstants as pc} from "../../constants";
import * as fs from "fs";
let packageJson = require("../../../package.json");

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
        await this.startAssetsChange();
    }

    private async startAssetsChange() {
        const {qAssetsPath} = utlis.getAssetsAndJson("Photoshop", this.activeDocument);
        try{
            await this.checkUpper(qAssetsPath);
            await this.checkAllCommon(qAssetsPath);
            await this.checkAllViews(qAssetsPath);
            await this.checkAllLocals(qAssetsPath);
        } catch(err) {console.log(err)}
    }

    private async checkUpper(qAssetsPath) {
        const changePath = path.join(qAssetsPath, "change");
        if(fs.existsSync(changePath)) {
            const allFiles = getAllFiles(changePath);
            for(let changeFile of allFiles) {
                const allArtLayers = [];
                upperDispatch(this.artLayers, changeFile, allArtLayers);
                await this.handleFileSyncProcedure(changeFile, path.join(changePath, changeFile), allArtLayers);
            }
            throw new Error("Dispatch Done");
        }
    }

    private async checkAllCommon(qAssetsPath) {
        const plats = getAllDirectories(qAssetsPath);
        let flag = 0;
        for(let plat of plats) {
            const changePath = path.join(qAssetsPath, plat, "common", "change");
            if(fs.existsSync(changePath)) {
                flag = 1;
                const allFiles = getAllFiles(changePath);
                for(let changeFile of allFiles) {
                    const allArtLayers = [];
                    allCommonDispatch(this.artLayers, plat, changeFile, allArtLayers);
                    await this.handleFileSyncProcedure(changeFile, path.join(changePath, changeFile), allArtLayers);
                }
            }
        }
        if(flag === 1) {
            throw new Error("Dispatch done");
        }
    }

    private async checkAllViews(qAssetsPath) {
        await this.checkViews(qAssetsPath, "common");
    }

    private async checkAllLocals(qAssetsPath) {
        await this.checkViews(qAssetsPath, "languages");
    }

    private async checkViews(qAssetsPath, key) {
        const platPaths = pc.platformArray.map(plat => path.join(qAssetsPath, plat, key));
        let flag = 0;
        for (let platPath of platPaths) {
            const viewDirs = getAllDirectories(platPath);
            for (let viewDir of viewDirs) {
                const changePath = path.join(platPath, viewDir, "change");
                if (fs.existsSync(changePath)) {
                    flag = 1;
                    const allFiles = getAllFiles(changePath);
                    for (let changeFile of allFiles) {
                        const allArtLayers = [];
                        allViewDispatch(this.artLayers, path.dirname(platPath), viewDir, changeFile, allArtLayers);
                        await this.handleFileSyncProcedure(changeFile, path.join(changePath, changeFile), allArtLayers);
                    }
                }
            }
        }
        if (flag === 1) {
            throw new Error("Dispatch Done");
        }
    }

    private async handleFileSyncProcedure(file, assetsPath, artLayers){
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
        let view = utlis.findView(artLayerRef, this.document, "common");
        let insertionKey;
        if(view) {
            utlis.addKeyToObject(this.artLayers[platform], "common");
            insertionKey = "common";
        } else {
            view = utlis.findView(artLayerRef, this.document, "languages");
            if(view) {
                utlis.addKeyToObject(this.artLayers[platform], "common");
                insertionKey = "languages";
            }
        }
        const imageName = JSON.parse(artLayerRef.generatorSettings.PanelScriptsImage.json).image;
        utlis.addKeyToObject(this.artLayers, platform);
        utlis.addKeyToObject(this.artLayers[platform], insertionKey)
        utlis.addKeyToObject(this.artLayers[platform][insertionKey], view);
        const viewObj = this.artLayers[platform][insertionKey][view];
        utlis.addArrayKeyToObject(viewObj, imageName);
        viewObj[imageName].push(artLayerRef);
    }
}