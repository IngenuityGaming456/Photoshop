import * as path from "path";
import * as fs from "fs";
import {IModel, IParams} from "../interfaces/IJsxParam";

export class PhotoshopModel implements IModel{
    private viewObjStorage = [];
    private baseMenuIds = [];
    private childMenuIds = [];
    private elementalMap = new Map();
    private elementalObj = [];
    private generator;
    private previousContainer = null;
    private clickedMenus = [];
    private prevContainerResponse = new Map();
    private containerResponse = new Map();
    private questComponents = ["button", "image", "label", "meter", "animation", "shape", "container", "slider"];

    private subscribeListeners() {
        this.generator.onPhotoshopEvent("generatorMenuChanged", (event) => this.onButtonMenuClicked(event));
    }

    private onButtonMenuClicked(event) {
        this.clickedMenus.push(event.generatorMenuChanged.name);
    }

    public handleSocketStorage(socketStorage) {
        this.prevContainerResponse = this.previousContainer;
        this.containerResponse = socketStorage;
        this.previousContainer = this.containerResponse;
    }

    private createStorage() {
        const folderPath = path.join(__dirname, "../viewRes");
        fs.readdirSync(folderPath).forEach(fileName => {
            const jsonObject = require(folderPath + "/" + fileName);
            this.viewObjStorage.push(jsonObject);
        });
    }
    
    private createElementalViewStructure() {
        this.viewObjStorage.forEach(item => {
            this.createElementalView(item, null);
        });
    }
    
    private createElementalView(viewObj, parent) {
        for(let key in viewObj) {
            if(viewObj.hasOwnProperty(key)) {
                if(!viewObj[key].type) {
                    this.elementalMap.set(key, this.elementObj);
                    this.createElementalView(viewObj[key], key);
                } else {
                    this.elementalMap.get(parent)[viewObj[key].type].push(key);
                }
            }
        }
    }

    private makeElementalObject() {
        for(let item of this.questComponents) {
            this.elementalObj[item] = [];
        }
    }

    get elementObj() {
        return Object.assign({}, this.elementalObj);
    }
    
    public setBaseMenuIds(id: number, key: string) {
        this.baseMenuIds.push({
            id: id,
            name: key
        });
    }
    
    get menuIds() {
        return this.baseMenuIds;
    }

    public setChildMenuIds(id:number, key:string) {
        this.childMenuIds.push({
            id: id,
            name: key
        });
    }

    get childIds() {
        return this.childMenuIds;
    }
    
    get viewStorage() {
        return this.viewObjStorage;
    }
    
    get viewElementalMap() {
        return this.elementalMap;
    }
    
    public setViewElementalMap(parent, key, type) {
        this.elementalMap.get(parent)[type].push(key);
    }

    get clickedMenuNames() {
        return this.clickedMenus;
    }

    get currentContainerResponse() {
        return this.containerResponse;
    }

    get previousContainerResponse() {
        return this.prevContainerResponse;
    }

    execute(params: IParams) {
        this.generator = params.generator;
        this.subscribeListeners();
        this.createStorage();
        this.makeElementalObject();
        this.createElementalViewStructure();
    }
    
}