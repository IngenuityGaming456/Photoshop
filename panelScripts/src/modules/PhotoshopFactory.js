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
exports.PhotoshopFactory = void 0;
const path = require("path");
const JsonComponentsFactory_1 = require("./JsonComponentsFactory");
const JsonComponents_1 = require("./JsonComponents");
const constants_1 = require("../constants");
const PhotoshopFactoryHelpers_1 = require("./PhotoshopFactoryHelpers");
let packageJson = require("../../package.json");
class PhotoshopFactory {
    constructor(modelFactory) {
        this.photoshopModel = modelFactory.getPhotoshopModel();
    }
    execute(params) {
        this._generator = params.generator;
        this._pluginId = packageJson.name;
    }
    /**
     * function is responsible for creating eveery element
     * @param parserObject it is the object which is needed for creation, it contains every required info for creation like parent, id, x,y etc.
     * @param insertionPoint it is the point under which element is to be added
     * @param parentKey parent of the element
     * @param platform platform is like desktop, landscape and portrait
     * @param type type of element
     * @param assetsPath path of the images if any
     */
    makeStruct(parserObject, insertionPoint, parentKey, platform, type, assetsPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let layerType;
            this.platform = platform;
            for (let keys in parserObject) {
                let jsxParams = { parentId: "", childName: "", type: "" };
                if (!parserObject.hasOwnProperty(keys) || !(parserObject[keys] instanceof Object)) {
                    continue;
                }
                layerType = parserObject[keys].type;
                yield this.setParams(jsxParams, parserObject, keys, insertionPoint, assetsPath);
                if (!layerType && !jsxParams.childName) {
                    this.baseView = keys;
                    yield this.createBaseChild(jsxParams, keys, insertionPoint, parserObject, type, assetsPath);
                }
                else {
                    this.baseView = parentKey;
                    const mappedKey = this.getMappedKey();
                    if (mappedKey) {
                        this.photoshopModel.automationOn = true;
                    }
                    this.platform && this.modifyJSXParams(jsxParams, mappedKey, layerType);
                    yield this.createElementTree(jsxParams, layerType, parentKey, type);
                    this.photoshopModel.automationOn = false;
                }
            }
        });
    }
    getMappedKey() {
        var _a, _b;
        const mappedPlatform = this.photoshopModel.mappedPlatformObj;
        if (this.platform && (this.platform in mappedPlatform || "noConnection" in mappedPlatform)) {
            return (_b = (_a = mappedPlatform[this.platform]) === null || _a === void 0 ? void 0 : _a[this.baseView]["mapping"]) !== null && _b !== void 0 ? _b : mappedPlatform["noConnection"][this.baseView]["mapping"];
        }
        return null;
    }
    setParams(jsxParams, parserObject, keys, insertionPoint, assetsPath) {
        return __awaiter(this, void 0, void 0, function* () {
            PhotoshopFactoryHelpers_1.addDimensionsToParams(jsxParams, parserObject, keys);
            PhotoshopFactoryHelpers_1.addImageToParams(jsxParams, parserObject, keys, assetsPath);
            PhotoshopFactoryHelpers_1.addFramesToParams(jsxParams, parserObject, keys, assetsPath);
            PhotoshopFactoryHelpers_1.addTextToParams(jsxParams, parserObject, keys, assetsPath);
            jsxParams.leaf = parserObject[keys].leaf;
            jsxParams.childName = parserObject[keys].id;
            jsxParams.parentId = parserObject[keys].parent ? yield this.findParentId(parserObject[keys].parent, insertionPoint) : insertionPoint;
        });
    }
    createBaseChild(jsxParams, keys, insertionPoint, parserObject, type, assetsPath) {
        return __awaiter(this, void 0, void 0, function* () {
            jsxParams.childName = keys;
            jsxParams.type = "layerSection";
            insertionPoint = yield this.createBaseStruct(jsxParams);
            this.setBaseIds(keys, insertionPoint, type);
            yield this.insertBaseMetaData(insertionPoint);
            yield this.makeStruct(parserObject[keys], insertionPoint, keys, this.platform, type, assetsPath);
        });
    }
    setBaseIds(keys, insertionPoint, type) {
        if (!this.platform) {
            this.photoshopModel.setPlatformMenuIds(Number(insertionPoint), keys);
        }
        else {
            this.photoshopModel.setBaseMenuIds(this.platform, Number(insertionPoint), keys);
        }
        if (type === "quest") {
            this.photoshopModel.setDrawnQuestItems(Number(insertionPoint), keys);
        }
    }
    insertBaseMetaData(insertionPoint) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._generator.setLayerSettingsForPlugin(constants_1.photoshopConstants.generatorIds.view, insertionPoint, this._pluginId);
        });
    }
    findParentId(childName, parentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/parentId.jsx"), { childName: childName, parentId: parentId });
        });
    }
    createBaseStruct(jsxParams) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/InsertLayer.jsx"), jsxParams);
        });
    }
    createElementTree(jsxParams, layerType, parentKey, type) {
        return __awaiter(this, void 0, void 0, function* () {
            let jsonMap = JsonComponentsFactory_1.JsonComponentsFactory.makeJsonComponentsMap();
            let element = jsonMap.get(layerType);
            let childId;
            if (element instanceof JsonComponents_1.PhotoshopJsonComponent) {
                jsxParams.type = element.getType();
                jsxParams.subType = element.getSubType();
                childId = yield element.setJsx(this._generator, jsxParams);
            }
            if (element instanceof JsonComponents_1.QuestJsonComponent) {
                childId = yield element.setJsx(this._generator, jsxParams);
            }
            this.setChildIds(childId, jsxParams, layerType, parentKey, type);
        });
    }
    setChildIds(childId, jsxParams, layerType, parentKey, type) {
        if (!this.platform) {
            this.photoshopModel.setPlatformMenuIds(childId, jsxParams.childName);
        }
        else {
            this.photoshopModel.setChildMenuIds(this.platform, childId, jsxParams.childName, layerType, parentKey);
        }
        if (type === "quest") {
            this.photoshopModel.setDrawnQuestItems(childId, jsxParams.childName);
        }
    }
    modifyJSXParams(jsxParams, mappedView, layerType) {
        if (layerType === "container") {
            if (jsxParams.leaf) {
                this.setParamsMapping(jsxParams, mappedView, layerType);
            }
        }
        else {
            this.setParamsMapping(jsxParams, mappedView, layerType);
        }
    }
    setParamsMapping(jsxParams, mappedView, layerType) {
        const elementalMap = this.photoshopModel.viewElementalMap;
        for (let key in mappedView) {
            if (!mappedView.hasOwnProperty(key)) {
                continue;
            }
            const typeArray = key === "noConnection" ? elementalMap[this.platform][mappedView[key]][layerType] : elementalMap[key][mappedView[key]][layerType];
            const mappedLayer = typeArray.find(item => {
                if (item.name === jsxParams.childName) {
                    return true;
                }
            });
            if (mappedLayer) {
                jsxParams[constants_1.photoshopConstants.mappedItem] = mappedLayer;
                this.photoshopModel.setMappedIds(mappedLayer.id);
                return;
            }
        }
    }
}
exports.PhotoshopFactory = PhotoshopFactory;
//# sourceMappingURL=PhotoshopFactory.js.map