import * as path from "path";
let packageJson = require("../../package.json");

export class PhotoshopJsonComponent {
    private readonly _type: string;
    private readonly _path: string;
    private readonly _subType: string;

    public constructor(type: string, path: string, subType?: string) {
        this._type = type;
        this._path = path;
        this._subType = subType;
    }

    public getType(): string {
        return this._type;
    }

    public getSubType(): string {
        return this._subType;
    }

    public setJsxPath(): string {
        return path.join(__dirname + this._path);
    }

    public async setJsx(generator, params): Promise<any> {
        await generator.evaluateJSXFile(this.setJsxPath(), params);
        return Promise.resolve();
    }
}

export class QuestJsonComponent {
    private readonly _path;
    private readonly _type;
    private readonly _pluginId: string;

    public constructor(type: string, path: string) {
        this._path = path;
        this._type = type;
        this._pluginId = packageJson.name;
    }

    public setJsxPath(): string {
        return path.join(__dirname + this._path);
    }

    public setJsx(generator, params): Promise<any> {
        return new Promise(resolve => {
            generator.evaluateJSXFile(this.setJsxPath(), params)
                .then(id => {
                    this.setLayerMetaData(generator, this._type, id)
                        .then(() => resolve());
                })
        })
    }

    private async setLayerMetaData(generator, type: string, id): Promise<any> {
        await generator.setLayerSettingsForPlugin(type, id, this._pluginId);
        return Promise.resolve();
    }
}