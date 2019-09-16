import {IPhotoshopState} from "../../interfaces/IJsxParam";

export class AddedViewState implements IPhotoshopState {
    
    checkMenuState(generator): void {
        console.log("The menu state looks perfect, only the view menu needs to be disabled");
    }

    onAllPlatformsDeletion(menuManager, menuName: string): void {
        menuManager.setCurrentState(menuManager.getNoPlatformState());
        menuManager.onAllPlatformsDeletion();
    }

    onPlatformAddition(menuManager, menuName: string): void {
        menuManager.setCurrentState(menuManager.getPlatformAdditionState());
        menuManager.onPlatformAddition(menuName);
    }
    
    onViewAddition(menuManager, generator, menuName: string): void {
        this.checkMenuState(generator);
        generator.toggleMenu(menuName, false, false);
    }

    onViewDeletion(menuManager, menuName: string): void {
        menuManager.setCurrentState(menuManager.getViewDeletionState());
        menuManager.onViewDeletion(menuName);
    }

} 