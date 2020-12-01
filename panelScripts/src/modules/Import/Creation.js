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
exports.Creation = void 0;
const utils_1 = require("../../utils/utils");
const path = require("path");
const constants_1 = require("../../constants");
class Creation {
    constructor(modelFactory) {
        this.modelFactory = modelFactory;
    }
    execute(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.diffObj = params.storage.result;
            this.pFactory = params.storage.pFactory;
            this.generator = params.generator;
            this.activeDocument = params.activeDocument;
            this.qAssets = params.storage.qAssets;
            this.docEmitter = params.docEmitter;
            this.subscribeListeners();
            this.isReady();
            yield this.handleChangesInPS();
            this.controlQuestPanel();
        });
    }
    subscribeListeners() {
        this.docEmitter.on(constants_1.photoshopConstants.logger.getUpdatedHTMLSocket, socket => this.onSocketUpdate(socket));
    }
    isReady() {
        this.docEmitter.emit("creationReady");
    }
    onSocketUpdate(socket) {
        this.socket = socket;
    }
    handleChangesInPS() {
        return __awaiter(this, void 0, void 0, function* () {
            let diffObj = this.diffObj;
            if (diffObj.hasOwnProperty("move")) {
                yield this.handleOperationOverComp(diffObj['move'], "move");
            }
            if (diffObj.hasOwnProperty("delete")) {
                yield this.handleDeleteComp(diffObj['delete']);
            }
            if (diffObj.hasOwnProperty("rename")) {
                yield this.handleOperationOverComp(diffObj['rename'], "rename");
            }
            if (diffObj.hasOwnProperty("create")) {
                yield this.handleOperationOverComp(diffObj['create'], "create");
            }
            if (diffObj.hasOwnProperty("edit")) {
                yield this.handleOperationOverComp(diffObj['edit'], "edit");
            }
        });
    }
    handleDeleteComp(deleteObj) {
        return __awaiter(this, void 0, void 0, function* () {
            if (deleteObj.hasOwnProperty('components')) {
                for (let i in deleteObj['components']) {
                    yield this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/DeleteErrorLayer.jsx"), { id: deleteObj['components'][i].id });
                }
            }
        });
    }
    handleOperationOverComp(obj, operation) {
        return __awaiter(this, void 0, void 0, function* () {
            if (operation === "create") {
                yield this.handleCreation(obj);
            }
            if (operation === "edit") {
                yield this.handleEdit(obj);
            }
            if (obj.hasOwnProperty('container')) {
                console.log(operation);
                switch (operation) {
                    case "move":
                        yield this.handleMoveComp(obj['container']);
                        break;
                    case "rename":
                        yield this.handleRenameComp(obj['container']);
                        break;
                }
            }
            if (obj.hasOwnProperty('image')) {
                switch (operation) {
                    case "move":
                        yield this.handleMoveComp(obj['image']);
                        break;
                    case "rename":
                        yield this.handleRenameComp(obj['image']);
                        break;
                }
            }
        });
    }
    handleMoveComp(moveObj) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i in moveObj) {
                let currentObj = moveObj[i];
                let currentMovedObj = JSON.parse(currentObj['moveObj']);
                yield this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/move.jsx"), { newParentId: currentMovedObj.newparentId, childId: currentMovedObj.childId });
            }
        });
    }
    handleRenameComp(renameObj) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i in renameObj) {
                let currentObj = renameObj[i];
                let currentMovedObj = JSON.parse(currentObj['renamed']);
                yield this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/rename.jsx"), { elementId: currentMovedObj.elementId, newName: currentMovedObj.newName });
            }
        });
    }
    handleCreation(createObj) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.handleViewCreation(createObj["views"]);
            for (let key in createObj) {
                if (!createObj.hasOwnProperty(key)) {
                    continue;
                }
                key !== "views" && (yield this.handleComponentsCreation(createObj[key]));
            }
        });
    }
    handleViewCreation(views) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let view of views) {
                const platformRef = utils_1.utlis.getPlatformRef(view.platform, this.activeDocument);
                const commonId = utils_1.utlis.getCommonId(platformRef);
                /**quest assets paths are provided to handle the case of view has image layer */
                const viewName = Object.keys(view)[0];
                yield this.pFactory.makeStruct({ [viewName]: {} }, commonId, null, view.platform, "quest", this.qAssets);
            }
        });
    }
    handleComponentsCreation(comps) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            for (let comp of comps) {
                const compId = comp.key.id;
                if (!comp.viewId) {
                    const elementalMap = this.modelFactory.getPhotoshopModel().viewElementalMap;
                    const currentView = elementalMap[comp.platform][comp.view];
                    comp.viewId = (_a = currentView === null || currentView === void 0 ? void 0 : currentView.base) === null || _a === void 0 ? void 0 : _a.id;
                }
                yield this.pFactory.makeStruct({ [compId]: comp.key }, comp.viewId, comp.view, comp.platform, "quest", this.qAssets);
            }
        });
    }
    handleEdit(editObj) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.handleAssetEdit(editObj["image"]);
        });
    }
    handleAssetEdit(assetArr) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const assetObj of assetArr) {
                const cObj = Object.assign({}, assetObj);
                if (cObj.key.isAssetChange) {
                    yield this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/DeleteErrorLayer.jsx"), { id: cObj.key.layerID[0] });
                    const compId = cObj.key.id;
                    yield this.pFactory.makeStruct({ [compId]: cObj.key }, cObj.viewId, cObj.view, cObj.platform, "quest", this.qAssets);
                }
                else {
                    yield this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/editElement.jsx"), { obj: cObj.key });
                }
            }
        });
    }
    controlQuestPanel() {
        const layers = this.activeDocument.layers.layers;
        utils_1.utlis.traverseObject(layers, undefined, this.onLayerContainers.bind(this));
    }
    onLayerContainers(layerSection) {
        return __awaiter(this, void 0, void 0, function* () {
            const nameObj = utils_1.utlis.isNameExists(layerSection.name, this.modelFactory.getPhotoshopModel().allQuestItems);
            if (nameObj) {
                const elementView = utils_1.utlis.getElementView(layerSection, this.activeDocument.layers);
                const elementPlatform = utils_1.utlis.getElementPlatform(layerSection, this.activeDocument.layers);
                yield utils_1.utlis.sendResponseToPanel(elementView, elementPlatform, layerSection.name, "CheckIntoContainerPanel", "checkFinished", this.socket);
            }
        });
    }
}
exports.Creation = Creation;
//# sourceMappingURL=Creation.js.map