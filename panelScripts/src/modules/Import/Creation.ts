import {IFactory, IParams} from "../../interfaces/IJsxParam";
import {utlis} from "../../utils/utils";
import * as path from "path";

export class Creation implements IFactory{
    private generator;
    private storage;
    private diffObj;
    private activeDocument;
    private pFactory;
    private qAssets;

    execute(params: IParams){
        this.diffObj = this.storage.result;
        this.pFactory = this.storage.pFactory;
        this.generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.qAssets = this.storage.qAssets;
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
        if(diffObj.hasOwnProperty("create")){
            this.handleOperationOverComp(diffObj['create'], "create");
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
                case "move" : this.handleMoveComp(obj['container']);
                break;
                case "rename" : this.handleRenameComp(obj['container']);
                break;
                case "create" : this.handleCreation(obj);
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

    private async handleCreation(createObj) {
            await this.handleViewCreation(createObj["views"]);
            await this.handleComponentsCreation(createObj["containers"]);
            await this.handleComponentsCreation(createObj["images"]);
    }

    private async handleViewCreation(views) {
        for(let view of views) {
            const platformRef = utlis.getPlatformRef(view.platform, this.activeDocument);
            const commonId = utlis.getCommonId(platformRef);
            await this.pFactory.makeStruct(view.view, commonId, null, view.platform, "quest");
        }
    }

    private async handleComponentsCreation(comps) {
        for(let comp of comps) {
            await this.pFactory.makeStruct(comp.key, comp.viewId, comp.view, comp.platform, "quest", this.qAssets);
        }
    }
    
}