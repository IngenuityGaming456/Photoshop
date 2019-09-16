import {IPhotoshopState} from "../../interfaces/IJsxParam";
import {UtilsPhotoshopState} from "../../utils/utilsPhotoshopState";
let menuLabel = require("../../res/menuLables.json");

export class NoPlatformState implements IPhotoshopState {

    public checkMenuState(generator): void {
        Object.keys(menuLabel).forEach(menu => {
            if(!UtilsPhotoshopState.isPlatform(menuLabel[menu].displayName)) {
                generator.toggleMenu(menuLabel[menu].label, false, false,
                    menuLabel[menu].displayName);
            }
        });
    }

    onAllPlatformsDeletion(menuManager, generator): void {
        this.checkMenuState(generator);
    }

    onPlatformAddition(menuManager, menuName: string): void {
        menuManager.setCurrentState(menuManager.getPlatformAdditionState());
        menuManager.onPlatformAddition(menuName);
    }

    onViewAddition(menuManager, generator, menuName: string): void {
    }

    onViewDeletion(menuManager, menuName: string): void {
    }
}