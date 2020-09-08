"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataPhotoshopModel = /** @class */ (function () {
    function DataPhotoshopModel() {
    }
    DataPhotoshopModel.prototype.createElementData = function () {
        return this.openDocumentData.elementalMap;
    };
    DataPhotoshopModel.prototype.createPlatformDeletion = function () {
        return this.openDocumentData.platformDeletion;
    };
    DataPhotoshopModel.prototype.createViewDeletionObj = function () {
        return this.openDocumentData.viewDeletion;
    };
    DataPhotoshopModel.prototype.accessMenuState = function () {
        return this.openDocumentData.menuStates;
    };
    DataPhotoshopModel.prototype.accessCurrentState = function () {
        return this.openDocumentData.menuCurrentState;
    };
    DataPhotoshopModel.prototype.accessContainerResponse = function () {
        return this.openDocumentData.containerResponse;
    };
    DataPhotoshopModel.prototype.accessDrawnQuestItems = function () {
        return this.openDocumentData.drawnQuestItems;
    };
    DataPhotoshopModel.prototype.accessDocLocalisationStruct = function () {
        return this.openDocumentData.docLocalisationStruct;
    };
    DataPhotoshopModel.prototype.execute = function (params) {
        this.openDocumentData = params.storage.openDocumentData;
    };
    return DataPhotoshopModel;
}());
exports.DataPhotoshopModel = DataPhotoshopModel;
//# sourceMappingURL=DataPhotoshopModel.js.map