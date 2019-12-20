import {IPhotoshopState} from "../../interfaces/IJsxParam";

export class DeletedPlatformState implements IPhotoshopState {

    onAllPlatformsDeletion(menuManager, menuName: string): void {
        menuManager.setCurrentState(menuManager.getNoPlatformState());
        menuManager.onAllPlatformsDeletion();
    }

    onPlatformAddition(menuManager, generator, menuName: string): void {
        menuManager.setCurrentState(menuManager.getPlatformAdditionState());
        menuManager.onPlatformAddition(menuName);
    }

    public onViewDeletion(menuManager, generator, menuName: string) {
        menuManager.setCurrentState(menuManager.getViewDeletionState());
        menuManager.onViewDeletion(menuName);
    }

    onViewAddition(menuManager, generator, menuName: string): void {
        menuManager.setCurrentState(menuManager.getAddedViewState());
        menuManager.onViewAddition(menuName);
    }

    async onPlatformDeletion(menuManager, generator, menuName: string) {
        await generator.toggleMenu(menuName,  true, false);
    }

}