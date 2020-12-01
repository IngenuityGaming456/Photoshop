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
exports.CreateViewStructure = void 0;
const constants_1 = require("../constants");
const path = require("path");
const utils_1 = require("../utils/utils");
let packageJson = require("../../package.json");
class CreateViewStructure {
    constructor(viewClass, modelFactory, photoshopFactory) {
        this.questComponents = ["button", "image", "label", "meter", "animation", "shape", "container", "slider"];
        this._viewClass = viewClass;
        this.modelFactory = modelFactory;
        this.viewDeletionObj = this.modelFactory.getPhotoshopModel().viewDeletion;
        this.photoshopFactory = photoshopFactory;
    }
    execute(params) {
        this.menuName = params.menuName;
        this._pluginId = packageJson.name;
        this._generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.currentMenu = params.menuName;
        this.docEmitter = params.docEmitter;
        this.drawStruct(params.menuName);
    }
    getElementMap() {
        return this.modelFactory.getMappingModel().getGenericViewMap();
    }
    drawStruct(menuName) {
        return __awaiter(this, void 0, void 0, function* () {
            let insertionObj = yield this._viewClass.shouldDrawStruct(this._generator, this.docEmitter, this.getPlatform.bind(this), this.viewDeletionObj, this.menuName);
            if (insertionObj !== "invalid") {
                this.platform = insertionObj.platform;
                this.emitValidCalls(menuName);
                const result = yield this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/CreateView.jsx"));
                utils_1.utlis.pushUniqueToArray(this.modelFactory.getPhotoshopModel().selfMadeViews, result);
                let params = {
                    [result]: {
                        [result]: {}
                    }
                };
                for (let keys in params) {
                    if (params.hasOwnProperty(keys)) {
                        this.modifyElementalMap(keys);
                        yield this.photoshopFactory.makeStruct(params[keys], insertionObj.insertId, null, this.platform);
                    }
                }
            }
        });
    }
    modifyElementalMap(view) {
        const elementalMap = this.modelFactory.getPhotoshopModel().viewElementalMap;
        this.addViewToElementalMap(elementalMap, view);
    }
    addViewToElementalMap(elementalMap, view) {
        for (let key in elementalMap) {
            if (!elementalMap.hasOwnProperty(key)) {
                continue;
            }
            if (view in elementalMap[key]) {
                return;
            }
            elementalMap[key][view] = this.makeElementalObject();
        }
    }
    makeElementalObject() {
        const elementalObj = {};
        for (let item of this.questComponents) {
            elementalObj[item] = [];
        }
        return elementalObj;
    }
    getPlatform(insertionPoint) {
        if (!insertionPoint) {
            return null;
        }
        else {
            const activeDocumentLayers = this.activeDocument.layers;
            const insertionRef = activeDocumentLayers.findLayer(Number(insertionPoint));
            return insertionRef.layer.group.name;
        }
    }
    emitValidCalls(menuName) {
        if (menuName != constants_1.photoshopConstants.views.genericView) {
            this.docEmitter.emit("validEntryStruct", this.currentMenu, this.platform);
        }
    }
}
exports.CreateViewStructure = CreateViewStructure;
//# sourceMappingURL=CreateViewStructure.js.map