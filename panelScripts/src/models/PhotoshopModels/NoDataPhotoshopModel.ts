import {IDataSubModel, IParams} from "../../interfaces/IJsxParam";

export class NoDataPhotoshopModel implements IDataSubModel{
    private questComponents = ["button", "image", "label", "meter", "animation", "shape", "container", "slider"];
    private viewObjStorage;
    private questPlatforms;

    createElementData() {
        this.makeElementalObject();
        return this.createElementalViewStructure();
    }

    execute(params: IParams) {
        this.viewObjStorage = params.storage.viewObjStorage;
        this.questPlatforms = params.storage.questPlatforms;
    }

    private makeElementalObject() {
        const elementalObj = {};
        for (let item of this.questComponents) {
            elementalObj[item] = [];
        }
        return elementalObj;
    }

    private createElementalViewStructure() {
        const elementalMap = new Map();
        const elementalViewMap = new Map();
        this.questPlatforms.forEach(item => {
            elementalMap.set(item, this.createElementalView());
        });
        return elementalMap;
    }

    private createElementalView() {
        const elementalViewMap = new Map();
        this.viewObjStorage.forEach(viewObj => {
            for (let key in viewObj) {
                if (!viewObj.hasOwnProperty(key)) {
                    continue;
                }
                if (!viewObj[key].type) {
                    elementalViewMap.set(key, this.makeElementalObject());
                }
            }
        });
        return elementalViewMap;
    }

}