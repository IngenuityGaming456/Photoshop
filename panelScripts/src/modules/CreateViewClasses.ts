import {IViewStructure} from "../interfaces/IJsxParam";
import * as path from "path";

export class CreateView implements IViewStructure {
    private readonly _viewKey;
    private readonly _viewMap;
    private readonly _generator;

    public constructor(generator, viewKey, viewMap) {
        this._viewKey = viewKey;
        this._viewMap = viewMap;
        this._generator = generator;
    }

    public getElement(): Object {
        return this._viewMap.get(this._viewKey);
    }

    public async shouldDrawStruct(): Promise<string> {
        let jsxPath = path.join(__dirname, "../../jsx/SelectedLayers.jsx");
        let selectedLayers = await this._generator.evaluateJSXFile(jsxPath);
        let selectedLayersArray = selectedLayers.split(",");
        if(~selectedLayersArray.indexOf("common") && selectedLayersArray.length === 1) {
            return Promise.resolve("common");
        }
        return Promise.reject("invalid");
    }
}

export class CreatePlatform implements IViewStructure {
    private readonly _platformKey;
    private readonly _platformMap;
    private readonly _generator;

    public constructor(generator, platformKey, platformMap) {
        this._platformKey = platformKey;
        this._platformMap = platformMap;
        this._generator = generator;
    }

    public getElement(): Object {
        return this._platformMap.get(this._platformKey);
    }

    public async shouldDrawStruct(): Promise<string> {
        let jsxPath = path.join(__dirname, "../../jsx/SelectedLayers.jsx");
        let selectedLayers = await this._generator.evaluateJSXFile(jsxPath);
        if(!selectedLayers.length) {
            return Promise.resolve(null);
        }
        return Promise.reject("invalid");
    }
}