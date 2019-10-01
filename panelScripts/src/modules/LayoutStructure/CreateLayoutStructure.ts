import {IFactory, IParams} from "../../interfaces/IJsxParam";
import {Generator} from "../../../../generator-core/lib/generator.js";
import * as fs from "fs";
import * as path from "path";
import {utlis} from "../../utils/utils";
let packageJson = require("../../../package.json");

export class CreateLayoutStructure implements IFactory {
    private _generator: Generator;
    private _pluginId;
    private _activeDocument;
    private bufferMap;
    //dirty hack for test
    public static listenerFn: Function;
    public static modifiedIds = [];

    public async execute(params: IParams) {
        this._generator = params.generator;
        this._pluginId = packageJson.name;
        this._activeDocument = params.activeDocument;
        this.bufferMap = params.storage.bufferMap;
        this.unsubscribeEventListener("imageChanged");
        await this.modifyPathNames();
        const result = await this.requestDocument();
        utlis.traverseObject(result.layers, this.filterResult.bind(this));
        this.writeJSON(result, this.getPath());
    }

    private async requestDocument() {
        return await this._generator.getDocumentInfo(undefined);
    }

    private getPath() {
        const path = this._activeDocument.file;
        const extIndex = path.search(/\.(psd)/);
        return path.substring(0, extIndex);
    }

    private unsubscribeEventListener(eventName: string) {
        const listeners = this._generator.photoshopEventListeners(eventName);
        // Just a hack, will write a very detailed code in later phase.
        CreateLayoutStructure.listenerFn = listeners[1];
        this._generator.removePhotoshopEventListener(eventName, CreateLayoutStructure.listenerFn);
    }

    private filterResult(artLayerRef) {
        artLayerRef.name = this.applySplitter(artLayerRef.name);
        delete artLayerRef["generatorSettings"][this._pluginId];
    }

    private applySplitter(artLayerName) {
        if(~artLayerName.search(/\.(png|jpg)/)) {
            const extensionIndex = artLayerName.indexOf(".");
            const slashIndex = artLayerName.lastIndexOf("/");
            if(slashIndex > -1) {
                return artLayerName.substring(slashIndex + 1, extensionIndex);
            } else {
                return artLayerName.substring(0, extensionIndex);
            }
        }
        return artLayerName;
    }

    private async writeJSON(result, modifiedPath) {
        fs.writeFile(modifiedPath + ".json", JSON.stringify(result, null, "  "), (err) => {
            if(err) {
                console.log(err);
            }else {
                console.log("File successfully written");
            }
        });
    }

    private async modifyPathNames() {
        const bufferKeys = this.bufferMap.keys();
        for(let key of bufferKeys) {
            const bufferValue = this.bufferMap[key];
            await this.handleBufferValue(bufferValue);
        }
    }

    private async handleBufferValue(bufferValue) {
        if(bufferValue.frequency === 1) {
            await this._generator.evaluateJSXFile(path.join(__dirname, "../../jsx/addPath.jsx"),
                {id: bufferValue.id});
        }
        await this.setDuplicateMetaData(this.applySplitter(bufferValue.parentName), bufferValue.id);
    }

    private async setDuplicateMetaData(parentName, key) {
        await this._generator.setLayerSettingsForPlugin({
            image: parentName
        }, key, this._pluginId + "Image");
    }

}