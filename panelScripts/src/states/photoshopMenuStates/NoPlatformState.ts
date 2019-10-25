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
                } else if(menuLabel[menu].enabled !== false) {
                    await generator.toggleMenu(menuLabel[menu].label, true, false,
                        menuLabel[menu].displayName);
                }
            }
        }
    }

    async onAllPlatformsDeletion(menuManager, generator) {
        await this.checkMenuState(generator);
    }

    onPlatformAddition(menuManager, generator, menuName: string): void {
        menuManager.setCurrentState(menuManager.getPlatformAdditionState());
        menuManager.onPlatformAddition(menuName);
    }

    onViewAddition(menuManager, generator, menuName: string): void {
    }

    onViewDeletion(menuManager, generator, menuName: string): void {
    }

    onPlatformDeletion(menuManager, generator, menuName: string) {
        menuManager.setCurrentState(menuManager.getDeletedPlatformState());
        menuManager.onPlatformDeletion(menuName);
    }
}