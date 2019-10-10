import {IDataSubModel, IParams} from "../../interfaces/IJsxParam";

export class DataPhotoshopModel implements IDataSubModel{
    private openDocumentData;

    createElementData() {
        return this.openDocumentData.elementalMap;
    }

    createPlatformDeletion() {
        return this.openDocumentData.platformDeletion;
    }

    createViewDeletionObj() {
        return this.openDocumentData.viewDeletion
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
    execute(params: IParams) {
        this.openDocumentData = params.storage.openDocumentData;
    }
}