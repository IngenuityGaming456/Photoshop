import {IFactory, IParams} from "../../interfaces/IJsxParam";
import * as fs from "fs";
import {utlis} from "../../utils/utils";
import {PhotoshopParser} from "./PhotoshopParser";
import {result} from "./result";
import {inject, execute} from "../FactoryClass"
import {Creation} from "./Creation";
import {PhotoshopFactory} from "../PhotoshopFactory";
import {ModelFactory} from "../../models/ModelFactory";

/**
 * class reads the quest json file and check for rename, edit, delete and newly added elements
 */
export class CreateImport implements IFactory{
    private generator;
    private activeDocument;
    private qAssetsPath;
    private qObj;
    private readonly result;
    private readonly pParser;
    private readonly pFactory;
    private readonly modelFactory;
    private deletedViews=[];

    public constructor(psParser: PhotoshopParser, pFactory: PhotoshopFactory, modelFactory: ModelFactory) {
        this.pFactory = pFactory;
        this.pParser = psParser;
        this.modelFactory = modelFactory;
        this.result = {...result};
    }

    public execute(params: IParams) {
        this.generator = params.generator;
        this.activeDocument = params.activeDocument;
        execute(this.pParser, {
            generator: this.generator,
            activeDocument: this.activeDocument
        });
        this.pParser.execute(params);
        this.getAssetsAndJson();
        this.compareJson();
        this.startCreation();
    }

    /**
     * Function to read the quest json file.
     */
    private getAssetsAndJson() {
        const stats =  utlis.getAssetsAndJson("Quest", this.activeDocument);
        this.qAssetsPath = stats.qAssetsPath;
      
        this.qObj = stats.qObj;
    }

    /**
     * comparison starts from here, it forwards the platform along with language object
     */
    private compareJson():void {

        for(let platform in this.qObj) {

            if(!this.qObj.hasOwnProperty(platform)) {
                continue;
            }
            let abject = this.qObj[platform];
            const enObj:object = this.qObj[platform]["en"];
            this.checkIfViewsDeleted(enObj, platform);
            this.compareViews(enObj, platform);
        }
    }

    checkIfViewsDeleted(enObj, platform){
        let questViewsArr=[];
        for(const view in enObj){
            questViewsArr.push(view);
        }
        /**function will return deleted views */
        let photoShopViewsObj = this.pParser.compareWithPhotoShopViews(questViewsArr, platform);

        let diff;
        diff = photoShopViewsObj.filter((x)=>!questViewsArr.includes(x.name));

        for (const i in diff){
            this.deletedViews.push(diff[i].name);
        }
        this.findAndHandleDeletedElements(enObj ,photoShopViewsObj, diff, platform);

    }

    /**
     * function compare views
     * @param enObj - language(english) object
     * @param platform - plateform (desktop, landscape, portrait etc)
     */
    private compareViews(enObj:object, platform:string) {

        for(let view in enObj) {
            if(!enObj.hasOwnProperty(view)) {
                continue;
            }
            const pView:boolean = this.pParser.getPView(view, platform); 
            if(!pView) {
                enObj[view].base=true;
                this.result.create.views.push({
                    [view]:enObj[view],
                    platform,
                });
            }else{
                this.compareComponents(enObj[view], view, platform);
                /**if view is newly added then dont check for edit, delete or rename */
                if( !this.deletedViews.includes(view)){
                    this.isDelete(enObj, enObj[view], view, platform);
                }
            }
            
        }
    }

    /**function compare view components one by one with psParser
     * @param viewObj - view object
     * @param view - view ie. bigwin, intro outro etc
     * @param platform - platform i.e. desktop, landscape, portrait etc.
     */
    private compareComponents(viewObj:object, view:string, platform:string):void {
        for(let comp in viewObj) {
            if(!viewObj.hasOwnProperty(comp) || !(viewObj[comp] instanceof Object)) {
                continue;
            }
            const compObj = viewObj[comp];
            if(this.isNew(compObj.layerID[0])) {
                const type = this.getType(compObj);
                const parentId = this.getParentId(view, platform);
                compObj["parentX"] = compObj.parent && viewObj[compObj.parent].x || 0;
                compObj["parentY"] = compObj.parent && viewObj[compObj.parent].y || 0;
                this.result.create[type].push({
                    key : compObj,
                    viewId: parentId,
                    view,
                    platform
                });
            } else {
                console.log(viewObj);
                this.isMove(compObj, viewObj, view, platform);
                this.isRename(compObj, viewObj, view, platform);
                this.isEdit(compObj, view, viewObj, platform);
            }
        }
    }
    /**
     * This function will check if a component is moved or not
     * @param compObj components of a view (bigWin, intro outro etc) bigwin , bigwincontainer etc
     * @param viewObj object of view Bigwin view, intro view etc
     * @param view view Bigwin view, intro view etc
     * @param platform desktop, landscape, portrait etc
     */
    private isMove(compObj:any, viewObj:any, view:string, platform:string):void {

        if(compObj.parent && typeof(compObj.layerID[0]) == "number"){

            let res = this.pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, compObj.parent, null,  null, "move");
            if(res){
              
                this.handleMove(res ,compObj.id, compObj.layerID[0], compObj.parent, viewObj[compObj.parent].layerID[0], this.getType(compObj), view, platform);
                return;
            }

        }

    }

    /**
     * function to check if a view component is renamed or not ?
     * @param compObj - individual view component
     * @param viewObj - view object
     * @param view - current view
     * @param platform - current platfrom
     */
    private isRename(compObj:any, viewObj:object, view:string, platform:string):void{

        if(typeof compObj.layerID[0] == 'number'){

            let res:boolean|string = this.pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, null, null, null, "rename");
            if(res){
                this.handleRename(res ,compObj.id, compObj.layerID[0], this.getType(compObj), view, platform);
            }
        }
    }

    /**
     * function to check if a view component is edited or not
     * @param compObj - current view component
     * @param viewObj - current view object
     * @param view - current view
     * @param platform - current platform
     */
    private isEdit(compObj, view:string, viewObj:any, platform:string):void {

        let tempParent = {};
        let tempChild = {};
        tempParent["x"]=0;
        tempParent["y"]=0;
        /**check if obj is an instance of an object */

        if(compObj instanceof Object){


            /**chck only for the elements which were created by PS as they have integer layerid */
            if(typeof compObj.layerID[0] == 'number' && compObj.type== "image"){

                let height = compObj.h||compObj.height;
                let width = compObj.w||compObj.width;

                let parent = compObj.parent?compObj.parent:"";
                if(viewObj.hasOwnProperty(parent)){
                    let eleParent = viewObj[parent];
                    tempParent["x"]= eleParent.x;
                    tempParent["y"]= eleParent.y;
                }

                tempChild["x"]= compObj.x;
                tempChild["y"]= compObj.y;
                tempChild["width"]= width;
                tempChild["height"]= height;

                let resL = this.pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, tempParent, tempChild, null, "editElement");
                if(resL){
                    compObj["parentX"] = tempParent["x"];
                    compObj["parentY"] = tempParent["y"];
                    compObj["width"] = width;
                    compObj["height"] = height;
                    compObj.h && delete compObj.h;
                    compObj.w && delete compObj.w;
                    compObj["isAssetChange"] = false;
                }
                let path = utlis.recurFiles(`${compObj.image}`, this.qAssetsPath);
 
                let resA = this.pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, path, null, compObj.image, "editImage");

                if(resA){
                    compObj["isAssetChange"] = true;
                }
                if(resA || resL){
                    
                    const parentId = this.getParentId(view, platform);
                    this.handleEditElement(compObj, parentId, view, platform);
                }
            }
        }

    }

    /**
     * function to get all the quest component object which has numerical ids
     * because psjson has numerical ids
     * @param viewObj - current view object
     */
    private getQuestObjects(viewObj:object):Array<number>{
        let qArray:Array<number> =[];
        for (let i in viewObj){
            if(!viewObj.hasOwnProperty(i)) {
                continue;
            }
            let comp = viewObj[i];
            if(comp instanceof Object && typeof comp.layerID[0] == 'number')
                qArray.push(comp.layerID[0]);
        }
        return qArray;
    }

    /**
     * function handles the delete functionality
     * first it gathers the view components from photoshop json
     * second it gathers the view components from quest json
     * then it perform questjsonobject - photoshopjsonobject
     * and gets the deleted components
     * @param viewObj - current view object
     * @param view - current view
     * @param platform - current platform
     */
    private isDelete(enObj:object, viewObj, view, platform:string):void{
        let psObjArray:Array<any> = this.pParser.getPSObjects(view, platform);
        let qObjArray:Array<any> = this.getQuestObjects(viewObj);
        let diff:Array<object>;
        diff = psObjArray.filter((x)=>!qObjArray.includes(x.id));
        this.findAndHandleDeletedElements(enObj ,psObjArray, diff, platform);
    }

    private findAndHandleDeletedElements(enObj ,psObjArray, diff, platform){
        if(diff.length>0) {
            const delItems = [];
            for(const psObj of psObjArray) {
                if(psObj.isView) {
                    if(this.isInQuestView(psObj.name, enObj, platform)) {
                        delItems.push(psObj);
                    }
                }
            }
            for(const item of delItems) {
                const index = psObjArray.indexOf(item);
                diff.splice(index, 1);
            }
            this.handleDeletdElements(diff);
        }
    }

    private isInQuestView(viewName, enObj, platform) {
        const views = Object.keys(enObj);
        return views.includes(viewName);
    }

    /**
     * function checks if a component is newly added, as newly added components has string ids
     * @param compObj - current view component object
     */
    private isNew(layerID:any):boolean {

        return (typeof(layerID)=="string" ?true:false) ;
    }

    /**
     * function to get type of a view component
     * @param compObj - curent view component object
     */
    private getType(compObj:{type:string}): string{
        return compObj.type;
    }

    /**
     * function adds the deleted elements in the result object
     * @param diff - deleted components
     * @param viewObj - current view object
     * @param view - current view
     * @param platform - current platform
     */
    private handleDeletdElements(diff:any):void{

        for(let i in diff){

            this.result.delete['components'].push({
                "id":diff[i].id,
                "name":diff[i].name,
                "type":diff[i].type
            });
        }
    }

    /**
     * function adds the renamed elements in the result object
     * @param newName new name of the component
     * @param oldName old name of the component
     * @param type type of the component
     * @param view current view
     * @param platform current platform
     */
    private handleRename(newName:boolean|string ,oldName:string, elementId:number|string, type:string, view:string, platform:string):void{
        let renamed={};
        renamed['newName'] = newName;
        renamed['oldName'] = oldName;
        renamed['elementId'] = elementId;

        renamed = JSON.stringify(renamed);
        this.result.rename[type].push({
            renamed,
            view,
            platform
        });
    }

    private handleEditElement(compObj, parentId ,view:string, platform:string):void{
        this.result.edit[compObj.type].push({
            key:compObj,
            viewId: parentId,
            view,
            platform
        });
    }

    /**
     * function adds the moved elements in the result object
     * @param newParent new parent of the moved component
     * @param child component moved
     * @param parent old parent of the moved component
     * @param type type of the component
     * @param view current view
     * @param platform current platform
     */
    private handleMove(parent:string, child:string, childId:string|number, newParent:string,  newParentId:string|number, type:string, view:string, platform:string):void {
        let moveObj = {};
        moveObj["child"] = child;
        moveObj["childId"] = childId;
        moveObj["parent"] = parent;
        moveObj["newparent"] = newParent;
        moveObj["newparentId"] = newParentId;
        moveObj = JSON.stringify(moveObj);
        this.result.move[type].push({
            moveObj,
            view,
            platform
        });
     
    }

    private getParentId(view, platform) {
        const elementalMap = this.modelFactory.getPhotoshopModel().viewElementalMap;
        const currentView = elementalMap[platform][view];
        return currentView.base.id;
    }
 
    private startCreation() {
        const creationObj = inject({ref: Creation, dep: []});
        // execute(creationObj, {storage: {result : this.result}, generator: this.generator});
        execute(creationObj, {storage:{
            result : this.result,
            pFactory: this.pFactory,
            qAssets: this.qAssetsPath
        }, generator: this.generator, activeDocument: this.activeDocument});
    }
}