"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoDataPhotoshopModel = void 0;
let menuLabels = require("../../res/menuLables");
const constants_1 = require("../../constants");
class NoDataPhotoshopModel {
    constructor() {
        this.questComponents = ["button", "image", "label", "meter", "animation", "shape", "container", "slider"];
        this.viewDeletion = {};
    }
    execute(params) {
        this.viewObjStorage = params.storage.viewObjStorage;
        this.questPlatforms = params.storage.questPlatforms;
    }
    createElementData() {
        this.makeElementalObject();
        return this.createElementalViewStructure();
    }
    createPlatformDeletion() {
        return { desktop: false, portrait: false, landscape: false };
    }
    createViewDeletionObj() {
        this.questPlatforms.forEach(platformKey => {
            this.viewDeletion[platformKey] = {};
            for (let menu in menuLabels) {
                if (!menuLabels.hasOwnProperty(menu)) {
                    continue;
                }
                if (menuLabels[menu].menuGroup === constants_1.photoshopConstants.menu.menuView) {
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
    makeElementalObject() {
        const elementalObj = {};
        for (let item of this.questComponents) {
            elementalObj[item] = [];
        }
        return elementalObj;
    }
    createElementalViewStructure() {
        const elementalMap = {};
        this.questPlatforms.forEach(item => {
            elementalMap[item] = this.createElementalView();
        });
        return elementalMap;
    }
    createElementalView() {
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
exports.NoDataPhotoshopModel = NoDataPhotoshopModel;
//# sourceMappingURL=NoDataPhotoshopModel.js.map