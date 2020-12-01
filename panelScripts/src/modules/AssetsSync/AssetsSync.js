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
exports.AssetsSync = void 0;
const utils_1 = require("../../utils/utils");
const assetsUtils_1 = require("./assetsUtils");
const path = require("path");
const constants_1 = require("../../constants");
const fs = require("fs");
let packageJson = require("../../../package.json");
class AssetsSync {
    constructor(modelFactory, pFactory) {
        this.artLayers = {};
        this.modelFactory = modelFactory;
        this.photoshopFactory = pFactory;
    }
    execute(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.activeDocument = params.activeDocument;
            this.generator = params.generator;
            this.activeDocument = yield params.storage.documentManager.getDocument(this.activeDocument.id);
            this.artLayers = {};
            utils_1.utlis.traverseObject(this.activeDocument.layers.layers, this.getAllArtLayers.bind(this));
            yield this.startAssetsChange();
        });
    }
    startAssetsChange() {
        return __awaiter(this, void 0, void 0, function* () {
            const { qAssetsPath } = utils_1.utlis.getAssetsAndJson("Photoshop", this.activeDocument);
            try {
                yield this.checkUpper(qAssetsPath);
                yield this.checkAllCommon(qAssetsPath);
                yield this.checkAllViews(qAssetsPath);
                yield this.checkAllLocals(qAssetsPath);
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    checkUpper(qAssetsPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const changePath = path.join(qAssetsPath, "change");
            if (fs.existsSync(changePath)) {
                const allFiles = assetsUtils_1.getAllFiles(changePath);
                for (let changeFile of allFiles) {
                    const allArtLayers = [];
                    assetsUtils_1.upperDispatch(this.artLayers, utils_1.utlis.removeExtensionFromFileName(changeFile), allArtLayers);
                    yield this.handleFileSyncProcedure(utils_1.utlis.removeExtensionFromFileName(changeFile), path.join(changePath, changeFile), allArtLayers);
                }
                throw new Error("Dispatch Done");
            }
        });
    }
    checkAllCommon(qAssetsPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const plats = assetsUtils_1.getAllDirectories(qAssetsPath);
            let flag = 0;
            for (let plat of plats) {
                const changePath = path.join(qAssetsPath, plat, "common", "change");
                if (fs.existsSync(changePath)) {
                    flag = 1;
                    const allFiles = assetsUtils_1.getAllFiles(changePath);
                    for (let changeFile of allFiles) {
                        const allArtLayers = [];
                        assetsUtils_1.allCommonDispatch(this.artLayers, plat, utils_1.utlis.removeExtensionFromFileName(changeFile), allArtLayers);
                        yield this.handleFileSyncProcedure(utils_1.utlis.removeExtensionFromFileName(changeFile), path.join(changePath, changeFile), allArtLayers);
                    }
                }
            }
            if (flag === 1) {
                throw new Error("Dispatch done");
            }
        });
    }
    checkAllViews(qAssetsPath) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkViews(qAssetsPath, "common");
        });
    }
    checkAllLocals(qAssetsPath) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkViews(qAssetsPath, "languages");
        });
    }
    checkViews(qAssetsPath, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const platPaths = constants_1.photoshopConstants.platformArray.map(plat => path.join(qAssetsPath, plat, key));
            let flag = 0;
            for (let platPath of platPaths) {
                const viewDirs = assetsUtils_1.getAllDirectories(platPath);
                for (let viewDir of viewDirs) {
                    const changePath = path.join(platPath, viewDir, "change");
                    if (fs.existsSync(changePath)) {
                        flag = 1;
                        const allFiles = assetsUtils_1.getAllFiles(changePath);
                        for (let changeFile of allFiles) {
                            const allArtLayers = [];
                            assetsUtils_1.allViewDispatch(this.artLayers, path.basename(path.dirname(platPath)), key, viewDir, utils_1.utlis.removeExtensionFromFileName(changeFile), allArtLayers);
                            yield this.handleFileSyncProcedure(utils_1.utlis.removeExtensionFromFileName(changeFile), path.join(changePath, changeFile), allArtLayers);
                        }
                    }
                }
            }
            if (flag === 1) {
                throw new Error("Dispatch Done");
            }
        });
    }
    handleFileSyncProcedure(file, assetsPath, artLayers) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let artLayer of artLayers) {
                const name = artLayer.name;
                let parentId = yield this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/getParentId.jsx"), { "childName": artLayer.id });
                let parentX = 0;
                let parentY = 0;
                let filePath = assetsPath;
                let dimension = {
                    parentX,
                    parentY,
                    x: artLayer.bounds.left,
                    y: artLayer.bounds.top,
                    w: (artLayer.bounds.right - artLayer.bounds.left),
                    h: (artLayer.bounds.bottom - artLayer.bounds.top),
                };
                let creationObj = {
                    dimensions: dimension,
                    type: "artLayer",
                    childName: name,
                    layerID: [artLayer.id],
                    image: file,
                    parentId: parentId,
                    file: filePath
                };
                const bufferPayload = yield this.generator.getLayerSettingsForPlugin(this.activeDocument.id, artLayer.id, packageJson.name);
                yield this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/DeleteErrorLayer.jsx"), { id: artLayer.id });
                const newLayerId = yield this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/InsertLayer.jsx"), creationObj);
                yield this.generator.setLayerSettingsForPlugin(bufferPayload, newLayerId, packageJson.name);
            }
        });
    }
    getAllArtLayers(artLayerRef) {
        if (!artLayerRef.generatorSettings) {
            return;
        }
        const platform = utils_1.utlis.findPlatform(artLayerRef, this.activeDocument);
        let view = utils_1.utlis.findView(artLayerRef, this.activeDocument, "common");
        let insertionKey;
        if (view) {
            insertionKey = "common";
        }
        else {
            view = utils_1.utlis.findView(artLayerRef, this.activeDocument, "languages");
            if (view) {
                insertionKey = "languages";
            }
        }
        const imageName = JSON.parse(artLayerRef.generatorSettings.PanelScriptsImage.json).image;
        utils_1.utlis.addKeyToObject(this.artLayers, platform);
        utils_1.utlis.addKeyToObject(this.artLayers[platform], insertionKey);
        utils_1.utlis.addKeyToObject(this.artLayers[platform][insertionKey], view);
        const viewObj = this.artLayers[platform][insertionKey][view];
        utils_1.utlis.addArrayKeyToObject(viewObj, imageName);
        viewObj[imageName].push(artLayerRef);
    }
}
exports.AssetsSync = AssetsSync;
//# sourceMappingURL=AssetsSync.js.map