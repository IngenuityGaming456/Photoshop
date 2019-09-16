import {IFactory, IParams} from "../interfaces/IJsxParam";
import * as fs from "fs";

export class HandleStates implements IFactory {
    private clickedMenus: Array<string> = [];

    public execute(params: IParams) {

    }

    public setLocalStorage(storage) {
        fs.writeFile("D:/clickedMenus.json", JSON.stringify(storage), err => {
            if(err) {
                console.log("unable to write file");
            }
        });
    }

    public handleChanges(responseMap, viewsMap) {
        try {
            const data = fs.readFileSync("D:/clickedMenus.json", {encoding: "utf8"});
            this.getChanges(new Map(JSON.parse(data)), responseMap, viewsMap);
        } catch(err) {
            console.log("There is no previous response");
        }
    }

    private getChanges(previousResponseMap, responseMap, viewsMap) {
        this.clickedMenus.forEach(item => {
            const viewObj = viewsMap.get(item);
            const viewKeys = Object.keys(viewObj);
           this.handleViewKeys(viewKeys, previousResponseMap, responseMap);
        });
    }

    private handleViewKeys(viewKeys, previousResponseMap, responseMap) {
        viewKeys.forEach(item => {
            this.sendJsonChanges(previousResponseMap.get(item), responseMap.get(item));
        });
    }

    private sendJsonChanges(previousJson, currentJson) {
        const previousBaseChild = previousJson[Object.keys(previousJson)[0]];
        const currentBaseChild = currentJson[Object.keys(currentJson)[0]];

        for (let key in currentBaseChild) {
            if(currentBaseChild.hasOwnProperty(key)) {
                if(!previousBaseChild[key]) {
                    this.sendAdditionRequest(Object.keys(previousJson)[0], currentBaseChild[key]);
                }
            }
        }

        for(let key in previousBaseChild) {
            if(previousBaseChild.hasOwnProperty(key)) {
                if(!currentBaseChild[key]) {
                    this.sendDeletionRequest(Object.keys(previousJson)[0], previousBaseChild[key]);
                }
            }
        }
    }

    private sendAdditionRequest(baseKey: string, currentObj) {
         console.log(baseKey, currentObj);
    }

    private sendDeletionRequest(baseKey: string, previousObj) {
        console.log(baseKey, previousObj);
    }

    set menuClicked(pressedMenu: string) {
        this.clickedMenus.push(pressedMenu);
    }

}