import {IPhotoshopState} from "../../interfaces/IJsxParam";

export class AddedViewState implements IPhotoshopState {

    onAllPlatformsDeletion(menuManager, menuName: string): void {
        menuManager.setCurrentState(menuManager.getNoPlatformState());
        menuManager.onAllPlatformsDeletion();
    }

    onPlatformAddition(menuManager, generator, menuName: string): void {
        menuManager.setCurrentState(menuManager.getPlatformAdditionState());
        menuManager.onPlatformAddition(menuName);
    }
    
    public async onViewAddition(menuManager, generator, menuName: string) {
        await generator.toggleMenu(menuName, false, false);
    }

    onViewDeletion(menuManager, generator, menuName: string): void {
        menuManager.setCurrentState(menuManager.getViewDeletionState());
        menuManager.onViewDeletion(menuName);
    }

    onPlatformDeletion(menuManager, generator, menuName: string) {
        menuManager.setCurrentState(menuManager.getDeletedPlatformState());
        menuManager.onPlatformDeletion(menuName);
    }

} 