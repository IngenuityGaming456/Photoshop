import * as path from "path";
import * as fs from "fs";
import {IModel, IParams} from "../interfaces/IJsxParam";

export class PhotoshopModel implements IModel{
    private viewObjStorage;
    private baseMenuIds = [];
    private childMenuIds = [];
    private elementalMap = new Map();
    private elementalObj;
    private questComponents = ["button", "image", "label", "meter", "animation", "shape", "container", "slider"];

    public handleSocketStorage(socketStorage) {
        ///Thinking what to do.
    }

    private createStorage() {
        const folderPath = path.join(__dirname, "viewRes");
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

    execute(params: IParams) {
        this.createStorage();
        this.makeElementalObject();
        this.createElementalViewStructure();
    }
    
}