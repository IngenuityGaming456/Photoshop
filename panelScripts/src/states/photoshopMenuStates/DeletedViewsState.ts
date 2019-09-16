import {IPhotoshopState} from "../../interfaces/IJsxParam";

export class DeletedViewState implements IPhotoshopState {
    
    public checkMenuState(generator): void {
        console.log("The menu seems perfect");
    }

    onAllPlatformsDeletion(menuManager, menuName: string): void {
        menuManager.setCurrentState(menuManager.getNoPlatformState());
        menuManager.onAllPlatformsDeletion();
    }

    onPlatformAddition(menuManager, menuName: string): void {
        menuManager.setCurrentState(menuManager.getPlatformAdditionState());
        menuManager.onPlatformAddition(menuName);
    }
    
    onViewDeletion(menuManager, generator, menuName: string): void {
        this.checkMenuState(generator);
        generator.toggleMenu(menuName,  false, false);
    }

    onViewAddition(menuManager, generator, menuName: string): void {
        menuManager.setCurrentState(menuManager.getAddedViewState());
        menuManager.onViewAddition(menuName);
    }

}