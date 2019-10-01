import {IPhotoshopState} from "../../interfaces/IJsxParam";
import {UtilsPhotoshopState} from "../../utils/utilsPhotoshopState";
let menuLabel = require("../../res/menuLables.json");

export class AddedPlatformState implements IPhotoshopState {
    
    private async checkMenuState(generator) {
        for(let menu in menuLabel) {
            if(menuLabel.hasOwnProperty(menu)) {
                if(!UtilsPhotoshopState.isPlatform(menu)) {
                    await generator.toggleMenu(menuLabel[menu].label, true, false,
                        menuLabel[menu].displayName);
                }
            }
        }
    }

    onAllPlatformsDeletion(menuManager, menuName: string): void {
        menuManager.setCurrentState(menuManager.getNoPlatformState());
        menuManager.onAllPlatformsDeletion();
    }

    public async onPlatformAddition(menuManager, generator, menuName: string) {
        await this.checkMenuState(generator);
        await generator.toggleMenu(menuName, false, false);
    }
    
    onViewAddition(menuManager, generator, menuName: string): void {
        menuManager.setCurrentState(menuManager.getAddedViewState());
        menuManager.onViewAddition(menuName);
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