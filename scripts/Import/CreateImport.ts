import {IFactory, IParams} from "./IJsxParam";
import * as fs from "fs";
// import {utlis} from "../../utils/utils";
import {PhotoshopParser} from "./PhotoshopParser";
import {result} from "./result";

/**
 * class reads the quest json file and check for rename, edit, delete and newly added elements
 */
class CreateImport implements IFactory{
    private generator;
    private activeDocument;
    private qAssetsPath;
    private qObj;
    private readonly result;
    private readonly pParser;

    public constructor() {
        this.pParser = new PhotoshopParser();
        this.pParser.execute();
        this.result = {...result};
    }


    async execute() {
        // this.generator = params.generator;
        // this.activeDocument = params.activeDocument;
        await this.getAssetsAndJson();
        await this.compareJson();
    }

    /**
     * Function to read the quest json file.
     */
    private getAssetsAndJson() {
        const stats =  this.pParser.getAssetsAndJsons("quest","BigWin", "quest");
     
        this.qAssetsPath = stats.qAssetsPath;
        this.qObj = stats.qObj;
   
    }

    /**
     * comparison starts from here, it forwards the plateform along with language object
     */
    private compareJson():void {
 
        for(let platform in this.qObj) {
      
            if(!this.qObj.hasOwnProperty(platform)) {
                continue;
            }
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
                    view,
                    platform
                });
            }else{
                this.compareComponents(enObj[view], view, platform);
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
            // console.log("compare component  ",comp);
            const compObj = viewObj[comp];
            if(this.isNew(compObj.layerID[0])) {
                const type = this.getType(compObj);
                this.result.create[type].push(compObj);
                //console.log(this.result)
            } else {
                this.isMove(compObj, viewObj, view, platform);
                this.isRename(compObj, viewObj, view, platform);
                this.isEdit(compObj, view, platform);
                this.isImageEdit(compObj, view, platform);
                
               
            }
        }
        this.isDelete(viewObj, view, platform);
        let data = JSON.stringify(this.result);
        fs.writeFileSync('modified.json', data);
       
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
            
            let res = this.pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, compObj.parent, null, null, null, null, null, "move");
            if(res){
                this.handleMove(res ,compObj.id, compObj.parent, viewObj[compObj.parent]['layerID'][0], this.getType(compObj), view, platform);
            }
           
        }
    
    }
    // private isMove(compObj, viewObj, view, platform) {
    //     const moveObj = {};
    //     const parent = compObj.parent;
    //     const parentObj = viewObj[parent];
    //     if(this.isNew(parentObj)) {
    //         this.handleMove(moveObj, compObj, parentObj, this.getType(compObj), view, platform);
    //     }
    //     const isDiff = this.psParser.compareParent(compObj, parentObj, view, platform);
    //     if(isDiff) {
    //         this.handleMove(moveObj, compObj, parentObj, this.getType(compObj), view, platform);
    //     }
    // }
    
    /**
     * function to check if a view component is renamed or not ?
     * @param compObj - individual view component
     * @param viewObj - view object 
     * @param view - current view
     * @param platform - current platfrom
     */
    private isRename(compObj:any, viewObj:object, view:string, platform:string):void{
       
        if(typeof compObj.layerID[0] == 'number'){
            
            let res:boolean|string = this.pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, null, null, null, null, null, null, "rename");
            if(res){
                console.log("in res");
                this.handleRename(res ,compObj.id, this.getType(compObj), view, platform);
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
        view:string, platform:string):void {
   
        /**check if obj is an instance of an object */
    
        if(compObj instanceof Object){
        
        
            /**chck only for the elements which were created by PS as they have integer layerid */
            if(typeof compObj.layerID[0] == 'number'){
                
                let height = compObj.h||compObj.height;
                let width = compObj.w||compObj.width;

                //let img = comp.image?comp.image:"";
           
                let res = this.pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, null, compObj.x, compObj.y, width, height, null, "editElement");
                if(res){
                    let oldDimensions:object = {
                        'x':compObj.x,
                        'y':compObj.y,
                        'width':width,
                        'height':height
                    }
                    this.handleEditElement(res, oldDimensions, this.getType(compObj), compObj.id, view, platform);
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
       
                let res = await this.pParser.recursionCallInitiator(compObj.layerID[0], compObj.id, path, null, null, null, null, compObj.image, "editImage");

                if(res){
                    this.handleEditImage(res, compObj.image, path, this.getType(compObj));
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
    private isDelete(viewObj:object, view:string, platform:string):void{

        let psObjArray:Array<any> = this.pParser.getPSObjects(platform);
        let qObjArray:Array<any> = this.getQuestObjects(viewObj);
        let diff:Array<object>;
        if(psObjArray.length > 0 && qObjArray.length >0){
            diff = psObjArray.filter((x)=>!qObjArray.includes(x.id));
        }
    
        if(diff.length>0)
            this.handleDeletdElements(diff, viewObj, view, platform);
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
    private handleDeletdElements(diff:any, viewObj:object, view:string, platform:string):void{
        
        for(let i in diff){
      
            this.result.delete['components'].push({
                "id":diff[i].id,
                "name":diff[i].name,
                "type":diff[i].type,
                view,
                platform
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
    private handleRename(newName:boolean|string ,oldName:string, type:string, view:string, platform:string):void{
        let renamed={};
        renamed['newName'] = newName;
        renamed['oldName'] = oldName;
        
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
    private handleEditElement(bounds:{left:number, right:number, top:number, bottom:number}, oldDimensions:object, type:string, qId:string, view:string, platform:string):void{
       
        let newDimensions = {};

        newDimensions["x"]=bounds.left;
        newDimensions["y"]=bounds.top;
        newDimensions["width"]=bounds.right-bounds.left;
        newDimensions["height"]=bounds.bottom-bounds.top;
        
        this.result.edit.layout[type].push({
            newDimensions,
            oldDimensions,
            "name":qId,
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
    private handleEditImage(newImg:{image:string, path:string}, oldImg:string, path:string, type:string):void{
        this.result.edit.layout[type].push({
            "oldImage":oldImg,
            "newImage":newImg.image
        });
        this.result.edit.asset[type].push({
            "oldPath": path,
            "newOath": newImg.path
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
    private handleMove(parent:string, child:string, newParent:string, newParentId:string|number, type:string, view:string, platform:string):void {
        let moveObj = {};
        moveObj["child"] = child;
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
}


let obj = new CreateImport();
obj.execute();