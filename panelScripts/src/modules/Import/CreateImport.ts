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
            console.log(abject)
            const enObj:object = this.qObj[platform]["en"];
            this.compareViews(enObj, platform);
        }
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
                this.result.create.views.push({
                    view : enObj[view],
                    platform
                });
            }else{
                this.compareComponents(enObj[view], view, platform);
            }
            this.isDelete(enObj, enObj[view], platform);
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
            // console.log("compare component  ",comp);
            const compObj = viewObj[comp];
            if(this.isNew(compObj.layerID[0])) {
                const type = this.getType(compObj);
                const parentId = this.getParentId(view, platform);
                this.result.create[type].push({
                    key : compObj,
                    viewId: parentId,
                    parent:compObj.parent,
                    view,
                    platform
                });

                //console.log(this.result)
            } else {
                this.isMove(compObj, viewObj, view, platform);
                this.isRename(compObj, viewObj, view, platform);
                this.isEdit(compObj, view, viewObj, platform);
                this.isImageEdit(compObj, view, platform);
            

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

        if(compObj.parent != "" && typeof compObj.layerID[0] == 'number'){

            let res = this.pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, compObj.parent, null,  null, "move");
            if(res){
                this.handleMove(res ,compObj.id, compObj.layerID[0], compObj.parent, viewObj[compObj.parent]['layerID'][0], this.getType(compObj), view, platform);
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
    private isEdit(compObj:{parent:string,layerID:Array<number>,
                       id:string, w?:number, h?:number, width?:number,
                       height?:number, x:number, y:number, type:string},
                   view:string, viewObj:any, platform:string):void {

        let tempParent = {};
        let tempChild = {};
        tempParent["x"]=0;
        tempParent["y"]=0;
        /**check if obj is an instance of an object */

        if(compObj instanceof Object){


            /**chck only for the elements which were created by PS as they have integer layerid */
            if(typeof compObj.layerID[0] == 'number'){

                let height = compObj.h||compObj.height;
                let width = compObj.w||compObj.width;

                let parent = compObj.parent?compObj.parent:"";
                if(viewObj.hasOwnProperty(parent)){
                    let tempParent = viewObj[parent];
                    tempParent["x"]=tempParent.x;
                    tempParent["y"]=tempParent.y;
                }

                tempChild["x"]= compObj.x;
                tempChild["y"]= compObj.y;
                tempChild["width"]= width;
                tempChild["height"]= height;

                let res = this.pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, tempParent, tempChild, null, "editElement");
                if(res){
                    let oldDimensions:object = {
                        'x':compObj.x,
                        'y':compObj.y,
                        'width':width,
                        'height':height
                    }
                    this.handleEditElement(res, oldDimensions, this.getType(compObj), compObj.layerID[0], compObj.id, view, platform);
                }
                console.log(res);
            }
        }

    }

    /**
     *
     * @param compObj function to check if image is edited or not
     * @param viewObj - current view object
     * @param view - current view
     * @param platform - current platform
     */
    private async isImageEdit(compObj:any, view:string, platform:string){
        if(compObj instanceof Object){

            /**chck only for the elements which were created by PS as they have integer layerid */
            if(typeof compObj.layerID[0] == 'number' && compObj.image){
                let path = `${this.qAssetsPath}/${platform}/common/${view}/${compObj.image}.png`;

                let res = await this.pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, path, null, compObj.image, "editImage");

                if(res){
                    this.handleEditImage(compObj, this.getType(compObj), view, platform);
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
    private isDelete(enObj:object, viewObj, platform:string):void{
        let psObjArray:Array<any> = this.pParser.getPSObjects(platform);
        let qObjArray:Array<any> = this.getQuestObjects(viewObj);
        let diff:Array<object>;
        diff = psObjArray.filter((x)=>!qObjArray.includes(x.id));
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
                psObjArray.splice(index, 1);
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

    /**
     * function adds the edited elements in the result object
     * @param bounds bounds of the elements (top, bottom, left, right)
     * @param oldDimensions old dimensions of the component
     * @param type type of the component
     * @param qId id (identifying name) of the component
     * @param view current view
     * @param platform current platform
     */
    private handleEditElement(bounds:{left:number, right:number, top:number, bottom:number}, oldDimensions:object, type:string, compId, qId:string, view:string, platform:string):void{

        let newDimensions = {};

        newDimensions["x"]=bounds.left;
        newDimensions["y"]=bounds.top;
        newDimensions["width"]=bounds.right-bounds.left;
        newDimensions["height"]=bounds.bottom-bounds.top;

        this.result.edit.layout[type].push({
            newDimensions,
            oldDimensions,
            "name":qId,
            compId,
            view,
            platform
        });
    }
    /**
     * function adds the edited image in the result object
     * @param newImg new image object contains name and path
     * @param oldImg old image name
     * @param path old image path
     * @param type type of the component i.e. image
     */
    private handleEditImage(compObj:any, type:string, view, platform):void{
        
        this.result.edit.asset[type].push({
            "imageObj":compObj,
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
        console.log(this.result.move)
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