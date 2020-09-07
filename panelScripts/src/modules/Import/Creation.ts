import {IFactory, IParams} from "../../interfaces/IJsxParam";
import {utlis} from "../../utils/utils";
import * as path from "path";

export class Creation implements IFactory{
    private generator;
    private storage;
    private diffObj;

    execute(params: IParams){
        this.diffObj = this.storage.result;
        this.generator = params.generator;
        this.handleChangesInPS();
    }

    private handleChangesInPS(){
        let diffObj = this.diffObj;
        if(diffObj.hasOwnProperty("delete")){
            this.handleDeleteComp(diffObj['delete']);
        }
        if(diffObj.hasOwnProperty("move")){
            this.handleOperationOverComp(diffObj['move'], "move");
        }
        if(diffObj.hasOwnProperty("rename")){
            this.handleOperationOverComp(diffObj['rename'], "rename");
        }
    }

    private async handleDeleteComp(deleteObj){
        if(deleteObj.hasOwnProperty('components')){
            for(let i in deleteObj['components']){
                await this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/DeleteErrorLayer.jsx"), {id: deleteObj['components'][i].id});
            }
        }
    }

    private handleOperationOverComp(obj, operation){
        if(obj.hasOwnProperty('container')){
            switch(operation){
                case "move": this.handleMoveComp(obj['container']);
                break;
                case "rename" : this.handleRenameComp(obj['container']);
                break;
            }
           
        }
        if(obj.hasOwnProperty('image')){
            switch(operation){
                case "move": this.handleMoveComp(obj['container']);
                break;
                case "rename" : this.handleRenameComp(obj['container']);
                break;
            }
        }
    }

    private async handleMoveComp(moveObj){
        for(let i in moveObj){
            let currentObj = moveObj[i];
            let currentMovedObj = JSON.parse(currentObj['moveObj']);
            await this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/move.jsx"), {"newParentId": currentMovedObj.newparentId, "childId": currentMovedObj.childId});
        }
    }

    private async handleRenameComp(renameObj){
       
        for(let i in renameObj){
            let currentObj = renameObj[i];
            let currentMovedObj = JSON.parse(currentObj['renamed']);
            await this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/rename.jsx"), {"elementId": currentMovedObj.elementId, "newName":currentMovedObj.newName});
        }
    }
    
}