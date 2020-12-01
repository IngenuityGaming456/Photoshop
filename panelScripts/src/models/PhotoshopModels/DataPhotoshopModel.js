"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataPhotoshopModel = void 0;
class DataPhotoshopModel {
    createElementData() {
        return this.openDocumentData.elementalMap;
    }
    createPlatformDeletion() {
        return this.openDocumentData.platformDeletion;
    }
    createViewDeletionObj() {
        return this.openDocumentData.viewDeletion;
    }
    accessMenuState() {
        return this.openDocumentData.menuStates;
    }
    accessCurrentState() {
        return this.openDocumentData.menuCurrentState;
    }
    accessContainerResponse() {
        return this.openDocumentData.containerResponse;
    }
    accessDrawnQuestItems() {
        return this.openDocumentData.drawnQuestItems;
    }
    accessDocLocalisationStruct() {
        return this.openDocumentData.docLocalisationStruct;
    }
    accessModifiedIds() {
        return this.openDocumentData.modifiedIds;
    }
    execute(params) {
        this.openDocumentData = params.storage.openDocumentData;
    }
}
exports.DataPhotoshopModel = DataPhotoshopModel;
//# sourceMappingURL=DataPhotoshopModel.js.map