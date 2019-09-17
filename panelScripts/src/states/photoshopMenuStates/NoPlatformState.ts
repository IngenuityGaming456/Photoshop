import {IPhotoshopState} from "../../interfaces/IJsxParam";
import {UtilsPhotoshopState} from "../../utils/utilsPhotoshopState";
let menuLabel = require("../../res/menuLables.json");

export class NoPlatformState implements IPhotoshopState {

    private async checkMenuState(generator) {
        for(let menu in menuLabel) {
            if(menuLabel.hasOwnProperty(menu)) {
                if(!UtilsPhotoshopState.isPlatform(menuLabel[menu].displayName)) {
                    await generator.toggleMenu(menuLabel[menu].label, false, false,
                        menuLabel[menu].displayName);
                }
            }
        }
    }

    async onAllPlatformsDeletion(menuManager, generator) {
        await this.checkMenuState(generator);
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