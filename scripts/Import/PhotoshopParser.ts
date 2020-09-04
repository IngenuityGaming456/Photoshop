import {IFactory, IParams} from "./IJsxParam";
import { platform } from "os";
const fs = require('fs');

export class PhotoshopParser implements IFactory {
    private generator;
    private activeDocument;
    private pAssetsPath;
    private pObj;
    
    execute() {
        this.getAssetsAndJson();
    }

    /**
     * Function to read the photoshop json file.
     */
    private async getAssetsAndJson() {
        const stats = await this.getAssetsAndJsons("photoshop", "BigWin", "photoshop");
        this.pAssetsPath = stats.qAssetsPath;
     
        this.pObj = stats.qObj;
    }

    private getPView(view, platform){
        return this.checkViews(this.pObj, view, platform);
    }

    private checkViews(pObj, view, platform){
        let res;
        if(pObj.hasOwnProperty('layers')){
            let viewLayersObj = pObj['layers'];
            for(let i in viewLayersObj){
                if(viewLayersObj[i].name == view){
                    let isView = viewLayersObj[i].hasOwnProperty('generatorSettings')?(viewLayersObj[i].generatorSettings.hasOwnProperty('PanelScripts')?JSON.parse(viewLayersObj[i].generatorSettings.PanelScripts.json):false):false;
                    if(isView == "view")
                        return true;
                }else{
                    res = this.checkViews(viewLayersObj[i], view, platform)
                }
            }
            return res;
        }
        return false;
        
    }

    /**
      * function will handle all the recursion calls and return the response mainly a object
      * of moved, edited, renamed or deleted object from quest json file 
      * @param qLayerID 
      * @param qId 
      * @param qParentOrPath parent of qId element or path of image for imageEdit check 
      * @param x
      * @param y 
      * @param width 
      * @param height 
      * @param qImg 
      * @param operation 
      */
    private recursionCallInitiator(qLayerID?:number, qId?:string, qParentOrPath?:string, x?:number, y?:number, width?:number, height?:number, qImg?:string, operation?:string):any{
        let psObj =  this.pObj;
        switch (operation){
            case 'move': return this.findChildUnderParent(psObj, '', qParentOrPath, qLayerID, qId);
            break;
            case 'editElement': return this.checkForEditedElement(psObj, qLayerID, qId, x, y, width, height);
            break;
            case 'editImage': return this.checkIfImageChanged(psObj, qLayerID, qId, qParentOrPath, qImg);
            break;
            case 'rename': return this.checkIfRenamed(psObj, qLayerID, qId);
            break;
            default: return false; 
            break;
        }

    }

    /**
     * function checks if a component is renamed
     * @param psObj photoshop json object
     * @param qLayerID quest componenet layerId
     * @param qId name of the quest component
     */
    private checkIfRenamed(psObj, qLayerID, qId){
        let res;
        /**Check if curent object has any layer property */
        if(psObj.hasOwnProperty('layers')){
            
            /**Iterate over every component of current layer */
            for(let i in psObj['layers']){

                /**If current layer child's id is equal to quest child id */
                if(psObj['layers'][i].id == qLayerID){
                    /**If parent is also equal the component is not moved return false else return the parent to which it is moved */
                    if(psObj['layers'][i].name !== qId){
                        console.log(psObj['layers'][i].name);
                        return psObj['layers'][i].name;
                    }else{
                        return false;
                        //return "moved";
                    }
                }else{
                    res = this.checkIfRenamed(psObj['layers'][i], qLayerID, qId);   
                }
            }
            return res;
        }
        return false;
    }

    /**driver function to get deleted object array */
    private getPSObjects(platform){
        let psObj = this.pObj;
        let psObjArray = [];
        return this.getDeletedArray(psObj, psObjArray, platform);
    }

    /**get the quest deleted objects */
    private getDeletedArray(psObj, psObjArray, platform){

        if(psObj.hasOwnProperty('layers')){
            
            /**Iterate over every component of current layer */
            for(let i in psObj['layers']){
                if( [platform,'language','common'].indexOf(psObj['layers'][i].name) === -1){
                    let delImg = {};
                    delImg['id'] = psObj['layers'][i].id;
                    delImg['name'] = psObj['layers'][i].name;
                    delImg['type'] = psObj['layers'][i].type;
                    psObjArray.push(delImg);
                }
                this.getDeletedArray(psObj['layers'][i], psObjArray, platform)
            }
        }
        return psObjArray;
    }

    /**
     * 
     * @param obj function to check if a object is moved from its parent to under other parent
     * @param psParent 
     * @param qParent 
     * @param qLayerID 
     * @param qId 
     */
    private findChildUnderParent(obj:object, psParent:string, qParent:string, qLayerID:number, qId:string){
        let res;
        /**Check if curent object has any layer property */
        if(obj.hasOwnProperty('layers')){
            
            /**Iterate over every component of current layer */
            for(let i in obj['layers']){

                /**If current layer child's id is equal to quest child id */
                if(obj['layers'][i].id == qLayerID){
                    /**If parent is also equal the component is not moved return false else return the parent to which it is moved */
                    if(psParent == qParent){
                        return false;
                    }else{
                    
                        return psParent;
                        //return "moved";
                    }
                }else{
                    let layerParent = obj['layers'][i].name;
                    res = this.findChildUnderParent(obj['layers'][i], layerParent, qParent, qLayerID, qId); 
                }
               
            }
            return res; 
         
        }
        return false;
    }

    /**
     * function will check if elements are edited
     * @param obj 
     * @param qLayerID 
     * @param qId 
     * @param x 
     * @param y 
     * @param width 
     * @param height 
     */
    private checkForEditedElement(obj:object, qLayerID:number, qId:string, x:number, y:number, width:number, height:number){
        let res;
        if(obj.hasOwnProperty('layers')){
            for(let i in obj['layers']){
                let currentEle = obj['layers'][i];
                
                if(currentEle.name == qId){
                    /**if width or height of the element get changed */
                    if((width !== (currentEle.bounds.right - currentEle.bounds.left)) || 
                        (height !== (currentEle.bounds.bottom - currentEle.bounds.top)) || 
                        (x !== currentEle.bounds.left) || y !== currentEle.bounds.top){
                        return currentEle.bounds;
                    }else{
                        return false;
                    }
                }else{
                    res = this.checkForEditedElement(currentEle, qLayerID, qId, x, y, width, height); 
                }
            }
           
            return res;
        }
        return false;
    }

    /**
     * driver recursion function to check if images are chnaged 
     * @param obj 
     * @param qLayerID 
     * @param qId 
     * @param path 
     * @param qImg 
     */
    private checkIfImageChanged(obj, qLayerID, qId, path, qImg){
        let res;
        if(obj.hasOwnProperty('layers')){
            for(let i in obj['layers']){
                let currentEle = obj['layers'][i];
            
                if(currentEle.name == qId && (currentEle.hasOwnProperty('type') && currentEle.type == 'layer')){
                   
                    return this.checkImages(qImg, JSON.parse(currentEle.generatorSettings.PanelScriptsImage.json).image, path);
                }else{
                    res = this.checkIfImageChanged(currentEle, qLayerID, qId, path, qImg)
                }
            }
            return res;
        }
        return false;
         
    }

    /**
     * function will check if images are changed, we have extract path of 
     * ps images from quest images because inside folder structure is same
     * @param qImg quest image
     * @param psImg ps images
     * @param path path of quest images
     */

    private async checkImages(qImg, psImg, path){

        try{
            let array = path.split("/");
            let len = array.length;
            const img1 = this.readImages(path);
            let img2Path = `${this.pAssetsPath}/${array[len-4]}/common/${array[len-2]}/${psImg}.png`;
            const img2 = this.readImages(img2Path);
            
            let [im1, im2] =await Promise.all([img1, img2]);
            return (im1['img']==im2['img'])? false:{'image': psImg, 'path': img2Path};

        }catch(error){
            // console.log(error);
            return false;
        }
    }

    public getAssetsAndJsons(folderName, image, jsonName) {
        // const savedPath = activeDocument.directory;
        // const fileName = activeDocument.name;
        // const qAssetsPath = savedPath + "\\" + `${key}\\${fileName}-assets`;
        // const qJsonPath =savedPath + "\\" + `${key}\\${fileName}`;
        const qAssetsPath = `F:/projects/scripts/test188/${folderName}/test188-assets`;
        const qJsonPath = `F:/projects/scripts/test188/${folderName}/test188.json` ;
        //console.log(qAssetsPath,"        ",qJsonPath);
        //const qAssetsPath = fs.readFileSync(qAssetsPatha, 'base64');
        const qObj = JSON.parse(fs.readFileSync(qJsonPath, 'utf8'));
        return {
            qAssetsPath,
            qObj
        }
    }

    public readImages(url){
        return new Promise((resolve, reject)=>{
            fs.readFile(url, 'base64', (err, img) => {
                if(err){
                    return reject(err);
                }else{
                    return resolve({"img":img});
                }
            });
        });
    }
    // private CheckIfElementsDeleted(qLayerID, qId){
    //     let psObj =  this.pObj;
    //     if(obj.hasOwnProperty('layers')){
    //         for(let i in pObj['layers']){
    //             let currentEle = obj['layers'][i];
                
    //         }
    //         return res;
    //     }
    //     return false;
    // }
 }