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
exports.CreatePlatform = exports.CreateView = void 0;
const constants_1 = require("../constants");
const path = require("path");
class CreateView {
    shouldDrawStruct(generator, docEmitter, getPlatform, viewDeletionObj, menuName) {
        return __awaiter(this, void 0, void 0, function* () {
            let selectedLayers = yield generator.evaluateJSXFile(path.join(__dirname, "../../jsx/SelectedLayers.jsx"));
            let selectedLayerId = yield generator.evaluateJSXFile(path.join(__dirname, "../../jsx/SelectedLayersIds.jsx"));
            let selectedLayersArray = selectedLayers.split(",");
            let selectedLayersIdArray = selectedLayerId.toString().split(",");
            if (~selectedLayersArray.indexOf(constants_1.photoshopConstants.common) && selectedLayersArray.length === 1
                && (!this.isAlreadyMade(selectedLayersIdArray[0], getPlatform, menuName, viewDeletionObj))) {
                return Promise.resolve({ insertId: selectedLayersIdArray[0], platform: this.platform });
            }
            docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, `Need to select only common to make ${menuName}`);
            return Promise.reject("invalid");
        });
    }
    isAlreadyMade(selectedLayerId, getPlatform, menuName, viewDeletionObj) {
        const platform = getPlatform(Number(selectedLayerId));
        this.platform = platform;
        if (menuName === constants_1.photoshopConstants.views.genericView) {
            return false;
        }
        return !(viewDeletionObj[platform][menuName] === null || viewDeletionObj[platform][menuName]);
    }
}
exports.CreateView = CreateView;
class CreatePlatform {
    shouldDrawStruct(generator, docEmitter) {
        return __awaiter(this, void 0, void 0, function* () {
            let jsxPath = path.join(__dirname, "../../jsx/SelectedLayers.jsx");
            let selectedLayers = yield generator.evaluateJSXFile(jsxPath);
            if (!selectedLayers.length) {
                return Promise.resolve({ insertId: null, platform: null });
            }
            docEmitter.emit(constants_1.photoshopConstants.logger.logWarning, "No layer should be selected in order to make a platform");
            return Promise.reject("invalid");
        });
    }
}
exports.CreatePlatform = CreatePlatform;
//# sourceMappingURL=CreateViewClasses.js.map