import {IFactory, IJsxParam, IParams} from "../interfaces/IJsxParam";
import * as path from "path";
import {JsonComponentsFactory} from "./JsonComponentsFactory";
import {PhotoshopJsonComponent, QuestJsonComponent} from "./JsonComponents";
import {ModelFactory} from "../models/ModelFactory";
import {photoshopConstants as pc} from "../constants";
import {PhotoshopModelApp} from "../../srcExtension/models/PhotoshopModels/PhotoshopModelApp";

let packageJson = require("../../package.json");

export class PhotoshopFactory implements IFactory {
    private baseView;
    private platform;
    private photoshopModel;
    private _generator;
    private _pluginId;

    public constructor(modelFactory: ModelFactory) {
        this.photoshopModel = modelFactory.getPhotoshopModel();
    }

    execute(params: IParams) {
        this._generator = params.generator;
        this._pluginId = packageJson.name;
    }

    public async makeStruct(parserObject: Object, insertionPoint: string, parentKey: string, platform) {
        let layerType: string;
        this.platform = platform;
        for(let keys in parserObject) {
            let jsxParams: IJsxParam = {parentId: "", childName: "", type: ""};
            if(!parserObject.hasOwnProperty(keys) || keys === "base") {
                continue;
            }
            layerType = parserObject[keys].type;
            await this.setParams(jsxParams, parserObject, keys, insertionPoint);
            if(!layerType && !jsxParams.childName) {
                this.baseView = keys;
                await this.createBaseChild(jsxParams, keys, insertionPoint, parserObject);
            } else {
                this.baseView = parentKey;
                const mappedKey = this.getMappedKey();
                if(mappedKey) {
                    (this.photoshopModel as PhotoshopModelApp).automationOn = true;
                }
                this.platform && this.modifyJSXParams(jsxParams, mappedKey, layerType);
                await this.createElementTree(jsxParams, layerType, parentKey);
                (this.photoshopModel as PhotoshopModelApp).automationOn = false;
            }
        }
    }

    private getMappedKey() {
        const mappedPlatform = this.photoshopModel.mappedPlatformObj;
        if(this.platform) {
            return mappedPlatform[this.platform][this.baseView]["mapping"];
        }
        return null;
    }

    private async setParams(jsxParams, parserObject, keys, insertionPoint) {
        jsxParams.leaf = parserObject[keys].leaf;
        jsxParams.childName = parserObject[keys].id;
        jsxParams.parentId = parserObject[keys].parent ? await this.findParentId(parserObject[keys].parent, insertionPoint) : insertionPoint;
    }

    private async createBaseChild(jsxParams, keys, insertionPoint, parserObject) {
        jsxParams.childName = keys;
        jsxParams.type = "layerSection";
        insertionPoint = await this.createBaseStruct(jsxParams);
        this.setBaseIds(keys, insertionPoint);
        await this.insertBaseMetaData(insertionPoint);
        await this.makeStruct(parserObject[keys], insertionPoint, keys, this.platform);
    }

    private setBaseIds(keys, insertionPoint) {
        if(!this.platform) {
            this.photoshopModel.setPlatformMenuIds(Number(insertionPoint), keys);
        } else {
            this.photoshopModel.setBaseMenuIds(this.platform, Number(insertionPoint), keys);
        }
        this.photoshopModel.setDrawnQuestItems(Number(insertionPoint), keys);
    }

    private async insertBaseMetaData(insertionPoint) {
        await this._generator.setLayerSettingsForPlugin(pc.generatorIds.view, insertionPoint, this._pluginId);
    }

    private async findParentId(childName, parentId): Promise<string> {
        return await this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/parentId.jsx"),
            {childName: childName, parentId: parentId});
    }

    private async createBaseStruct(jsxParams: IJsxParam): Promise<string> {
        return await this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/InsertLayer.jsx"),
            jsxParams);
    }

    private async createElementTree(jsxParams: IJsxParam, layerType: string, parentKey: string) {
        let jsonMap = JsonComponentsFactory.makeJsonComponentsMap();
        let element = jsonMap.get(layerType);
        let childId;
        if (element instanceof PhotoshopJsonComponent) {
            jsxParams.type = element.getType();
            jsxParams.subType = element.getSubType();
            childId = await element.setJsx(this._generator, jsxParams);
        }
        if (element instanceof QuestJsonComponent) {
            childId = await element.setJsx(this._generator, jsxParams);
        }
        this.setChildIds(childId, jsxParams, layerType, parentKey);
    }

    private setChildIds(childId, jsxParams, layerType, parentKey) {
        if(!this.platform) {
            this.photoshopModel.setPlatformMenuIds(childId, jsxParams.childName);
        } else {
            this.photoshopModel.setChildMenuIds(this.platform, childId, jsxParams.childName, layerType, parentKey);
        }
        this.photoshopModel.setDrawnQuestItems(childId, jsxParams.childName);
    }

    private modifyJSXParams(jsxParams, mappedView, layerType) {
        if (layerType === "container") {
            if (jsxParams.leaf) {
                this.setParamsMapping(jsxParams, mappedView, layerType);
            }
        } else {
            this.setParamsMapping(jsxParams, mappedView, layerType);
        }
    }

    private setParamsMapping(jsxParams, mappedView, layerType) {
        const elementalMap = this.photoshopModel.viewElementalMap;
        for(let key in mappedView) {
            if(!mappedView.hasOwnProperty(key)) {
                continue;
            }
            const typeArray = elementalMap[key][mappedView[key]][layerType];
            const mappedLayer = typeArray.find(item => {
                if(item.name === jsxParams.childName) {
                    return true;
                }
            });
            if(mappedLayer) {
                jsxParams[pc.mappedItem] = mappedLayer;
                return;
            }
        }
    }

}