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
exports.PhotoshopStartModel = void 0;
const fs = require("fs");
let packageJson = require("../../package.json");
const constants_1 = require("../constants");
class PhotoshopStartModel {
    constructor() {
        this.writeObj = {};
    }
    execute(params) {
        this.writeObj = {};
        this.docIdObj = null;
        this.openDocumentData = null;
        this.generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.subscribeListeners();
    }
    subscribeListeners() {
        this.generator.on(constants_1.photoshopConstants.generator.writeData, (data, isComplete) => this.onWriteData(data, isComplete));
        this.generator.on(constants_1.photoshopConstants.generator.docId, (docId) => {
            this.docIdObj.docId = docId;
        });
    }
    onWriteData(data, isComplete) {
        this.writeObj = Object.assign(this.writeObj, data);
        isComplete && this.writeDataAtPath();
    }
    writeDataAtPath() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = JSON.stringify(this.writeObj, null, "  ");
            fs.writeFile(this.activeDocument.directory + "\\" + this.docIdObj.docId + "/States.json", result, err => {
                if (err) {
                    console.log(err);
                }
            });
        });
    }
    onPhotoshopStart() {
        return __awaiter(this, void 0, void 0, function* () {
            this.docIdObj = yield this.generator.getDocumentSettingsForPlugin(this.activeDocument.id, packageJson.name + "Document");
            if (!Object.keys(this.docIdObj).length) {
                return null;
            }
            const data = fs.readFileSync(this.activeDocument.directory + "\\" + this.docIdObj.docId + "/States.json", { encoding: "utf8" });
            this.openDocumentData = JSON.parse(data);
            return this.openDocumentData;
        });
    }
    onPhotoshopClose() {
    }
}
exports.PhotoshopStartModel = PhotoshopStartModel;
//# sourceMappingURL=PhotoshopStartModel.js.map