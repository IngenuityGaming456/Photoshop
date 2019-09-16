import {IPhotoshopState} from "../../interfaces/IJsxParam";
import {UtilsPhotoshopState} from "../../utils/utilsPhotoshopState";
let menuLabels = require("../../res/menuLables.json");

export class AddedPlatformState implements IPhotoshopState {
    
    checkMenuState(generator): void {
        Object.keys(menuLabels).forEach(menu => {
            if(!UtilsPhotoshopState.isPlatform(menu)) {
                generator.toggleMenu(menuLabels[menu].label, true, false,
                    menuLabels[menu].displayName);
            }
        });         
    }

    onAllPlatformsDeletion(menuManager, menuName: string): void {
        menuManager.setCurrentState(menuManager.getNoPlatformState());
        menuManager.onAllPlatformsDeletion();
    }

    onPlatformAddition(menuManager, generator, menuName: string): void {
        this.checkMenuState(generator);
        generator.toggleMenu(menuName, false, false);
    }
    
    onViewAddition(menuManager, generator, menuName: string): void {
        menuManager.setCurrentState(menuManager.getAddedViewState());
        menuManager.onViewAddition(menuName);
    }

    onViewDeletion(menuManager, menuName: string): void {
        menuManager.setCurrentState(menuManager.getViewDeletionState());
        menuManager.onViewDeletion(menuName);
    }
    
}