import {IDataSubModel, IParams} from "../../interfaces/IJsxParam";
let menuLabels = require("../../res/menuLables");
import {photoshopConstants as pc} from "../../constants";

export class NoDataPhotoshopModel implements IDataSubModel{
    private questComponents = ["button", "image", "label", "meter", "animation", "shape", "container", "slider"];
    private viewObjStorage;
    private questPlatforms;
    private viewDeletion = {};


    execute(params: IParams) {
        this.viewObjStorage = params.storage.viewObjStorage;
        this.questPlatforms = params.storage.questPlatforms;
    }

    createElementData() {
        this.makeElementalObject();
        return this.createElementalViewStructure();
    }

    createPlatformDeletion() {
        return {desktop: false, portrait: false, landscape: false};
    }

    createViewDeletionObj() {
        this.questPlatforms.forEach(platformKey => {
            this.viewDeletion[platformKey] = {};
            for(let menu in menuLabels) {
                if(!menuLabels.hasOwnProperty(menu)) {
                    continue;
                }
                if(menuLabels[menu].menuGroup === pc.menu.menuView) {
                    this.viewDeletion[platformKey][menuLabels[menu].label] = null;
                }
            }
        });
        return this.viewDeletion;
    }

    accessMenuState() {
        return [];
    }

    accessCurrentState() {
        return null;
    }

    accessContainerResponse() {
        return null;
    }

    accessDrawnQuestItems() {
        return [];
    }

    accessDocLocalisationStruct() {
        return null;
    }

    accessModifiedIds() {
        return [];
    }

    public makeElementalObject() {
        const elementalObj = {};
        for (let item of this.questComponents) {
            elementalObj[item] = [];
        }
        return elementalObj;
    }

    private createElementalViewStructure() {
        const elementalMap = {};
        this.questPlatforms.forEach(item => {
            elementalMap[item] = this.createElementalView();
        });
        return elementalMap;
    }

    private createElementalView() {
        const elementalViewMap = {};
        this.viewObjStorage.forEach(viewObj => {
            for (let key in viewObj) {
                if (!viewObj.hasOwnProperty(key)) {
                    continue;
                }
                if (!viewObj[key].type) {
                    elementalViewMap[key] = this.makeElementalObject();
                }
            }
        });
        return elementalViewMap;
    }

}