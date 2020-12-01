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
exports.QuestJsonComponent = exports.PhotoshopJsonComponent = void 0;
const path = require("path");
let packageJson = require("../../package.json");
class PhotoshopJsonComponent {
    constructor(type, path, subType) {
        this._type = type;
        this._path = path;
        this._subType = subType;
    }
    getType() {
        return this._type;
    }
    getSubType() {
        return this._subType;
    }
    setJsxPath() {
        return path.join(__dirname + this._path);
    }
    setJsx(generator, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield generator.evaluateJSXFile(this.setJsxPath(), params);
        });
    }
}
exports.PhotoshopJsonComponent = PhotoshopJsonComponent;
class QuestJsonComponent {
    constructor(type, path) {
        this._path = path;
        this._type = type;
        this._pluginId = packageJson.name;
    }
    setJsxPath() {
        return path.join(__dirname + this._path);
    }
    setJsx(generator, params) {
        return new Promise(resolve => {
            generator.evaluateJSXFile(this.setJsxPath(), params)
                .then(id => {
                this.setLayerMetaData(generator, this._type, id)
                    .then(() => resolve(id));
            });
        });
    }
    setLayerMetaData(generator, type, id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield generator.setLayerSettingsForPlugin(type, id, this._pluginId);
            return Promise.resolve();
        });
    }
}
exports.QuestJsonComponent = QuestJsonComponent;
//# sourceMappingURL=JsonComponents.js.map