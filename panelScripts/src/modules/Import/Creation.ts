import {IFactory, IParams} from "../../interfaces/IJsxParam";
import {utlis} from "../../utils/utils";
import * as path from "path";
 
export class Creation implements IFactory{
    private generator;
    private diffObj;
    private activeDocument;
    private pFactory;
    private qAssets;

    execute(params: IParams){
        this.diffObj = params.storage.result;
        this.pFactory = params.storage.pFactory;
        this.generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.qAssets = params.storage.qAssets;
        this.handleChangesInPS();
    }

    private async handleChangesInPS(){
        let diffObj = this.diffObj;
        if(diffObj.hasOwnProperty("move")){
            await this.handleOperationOverComp(diffObj['move'], "move");
        }
        if(diffObj.hasOwnProperty("delete")){
            await this.handleDeleteComp(diffObj['delete']);
        }
        if(diffObj.hasOwnProperty("rename")){
            await this.handleOperationOverComp(diffObj['rename'], "rename");
        }
        if(diffObj.hasOwnProperty("create")){
            await this.handleOperationOverComp(diffObj['create'], "create");
        }
        if(diffObj.hasOwnProperty("edit")){
            await this.handleOperationOverComp(diffObj['edit'], "edit");
        }
    }

    private async handleDeleteComp(deleteObj){
        if(deleteObj.hasOwnProperty('components')){
            for(let i in deleteObj['components']){
                await this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/DeleteErrorLayer.jsx"), {id: deleteObj['components'][i].id});
            }
        }
    }

    private async handleOperationOverComp(obj, operation){
        if(operation === "create") {
            await this.handleCreation(obj);
        }
        if(operation === "edit"){
           await this.handleEdit(obj);
        }

        if(obj.hasOwnProperty('container')){
            console.log(operation);
            switch(operation){
                case "move" : await this.handleMoveComp(obj['container']);
                break;
                case "rename" : await this.handleRenameComp(obj['container']);
                break;
            }
           
        }
        if(obj.hasOwnProperty('image')){
            switch(operation){
                case "move": await this.handleMoveComp(obj['image']);
                break;
                case "rename" : await this.handleRenameComp(obj['image']);
                break;
               
            }
        }
    }

    private async handleMoveComp(moveObj){
        for(let i in moveObj){
            let currentObj = moveObj[i];
            let currentMovedObj = JSON.parse(currentObj['moveObj']);
            await this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/move.jsx"), {newParentId: currentMovedObj.newparentId, childId: currentMovedObj.childId});
        }
    }

    private async handleRenameComp(renameObj){
        for(let i in renameObj){
            let currentObj = renameObj[i];
            let currentMovedObj = JSON.parse(currentObj['renamed']);
            await this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/rename.jsx"), {elementId: currentMovedObj.elementId, newName:currentMovedObj.newName});
        }
    }

    private async handleCreation(createObj) {
            await this.handleViewCreation(createObj["views"]);
            await this.handleComponentsCreation(createObj["container"]);
            await this.handleComponentsCreation(createObj["image"]);
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
            const compId = comp.key.id;
            await this.pFactory.makeStruct({[compId]: comp.key}, comp.viewId, comp.view, comp.platform, "quest", this.qAssets);
        }
    }

    private async handleEdit(editObj) {
        await this.handleAssetEdit(editObj["image"]);
    }

    private async handleAssetEdit(assetArr) {
        for(const assetObj of assetArr) {
            const cObj = {...assetObj};
            if(cObj.key.isAssetChange) {
                await this.generator.evaluateJSXFile(path.join(__dirname, "../../../jsx/DeleteErrorLayer.jsx"), {id: cObj.key.layerID[0]});
            }
            const compId = cObj.key.id;
            await this.pFactory.makeStruct({[compId]: cObj.key}, cObj.viewId, cObj.view, cObj.platform, "quest", this.qAssets);
        }
    }
    
}