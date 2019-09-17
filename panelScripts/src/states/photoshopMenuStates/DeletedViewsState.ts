import {IPhotoshopState} from "../../interfaces/IJsxParam";

export class DeletedViewState implements IPhotoshopState {

    onAllPlatformsDeletion(menuManager, menuName: string): void {
        menuManager.setCurrentState(menuManager.getNoPlatformState());
        menuManager.onAllPlatformsDeletion();
    }

    onPlatformAddition(menuManager, menuName: string): void {
        menuManager.setCurrentState(menuManager.getPlatformAdditionState());
        menuManager.onPlatformAddition(menuName);
    }
    
    public async onViewDeletion(menuManager, generator, menuName: string) {
        await generator.toggleMenu(menuName,  false, false);
    }

    onViewAddition(menuManager, generator, menuName: string): void {
        menuManager.setCurrentState(menuManager.getAddedViewState());
        menuManager.onViewAddition(menuName);
    }

}