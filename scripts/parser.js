const fs = require('fs');
// const psJson = require('./photoshop.json');
// const qJson = require('./quest.json');

class Parser{
    psFile;
    qFile;
    constructor(){
        this.psFile = JSON.parse(fs.readFileSync("photoshop.json", 'utf8'));
        this.qFile = JSON.parse(fs.readFileSync('quest.json', 'utf8'));
    }
   
    print(){
        console.log(this.psFile);
        console.log(this.qFile);
    }
    iteratePSFile(obj){
        console.log(obj.id+"\n");
        if(obj.hasOwnProperty('layers')){
            for (let i in obj['layers'] )
            this.iteratePSFile(obj['layers'][i]);
        }
        
        return;

    }
    checkPSFile(){
        let obj = this.psFile;
        
        this.iteratePSFile(obj);
    }
    /**handler function to check if a element is moved if yes then get the new parent*/
    checkAndGetNewParent(layerID, id, parent){
        let obj = this.psFile;
    
        return this.findChildUnderParent(obj,'',  parent, layerID, id);
    }

    findChildUnderParent(obj, psParent, qParent, qLayerID, qId){
        let res;
        // console.log(psParent, qParent, qLayerID, qId);
        if(obj.hasOwnProperty('layers')){
            
            for(let i in obj['layers']){
                // console.log(obj['layers'][i].id, " ", qLayerID);
              
                if(obj['layers'][i].id == qLayerID){
                   
                    if(psParent == qParent){
                        return "same";/**nothing moved */
                    }else{
                        return "moved"; /**this current object is moved */
                    }
                }else{
                    let layerParent = obj['layers'][i].name;
                    res = this.findChildUnderParent(obj['layers'][i], layerParent, qParent, qLayerID, qId);   
                }
            }
            return res;
        }
        return "notFound";
    }

    /**handler function to get the element if edited */
    getEditedElement(layerID, id, x, y, width, height){
        let obj = this.psFile;
        return this.checkForEditedElement(obj, layerID, id, x, y, width, height);
    }

    checkForEditedElement(obj, qLayerID, qId, x, y, width, height){
        let res;
        if(obj.hasOwnProperty('layers')){
            for(let i in obj['layers']){
                let currentEle = obj['layers'][i];
                
                if(currentEle.name == qId){
                    /**if width or height of the element get changed */
                    if((width !== (currentEle.bounds.right - currentEle.bounds.left)) || (height !== (currentEle.bounds.bottom - currentEle.bounds.top)) ){
                       
                        return "changed";
                        
                    }else{
                       
                        return "notChanged";
                   
                    }
                }else{
                    res = this.checkForEditedElement(currentEle, qLayerID, qId, x, y, width, height);
                  
                }
               
            }
           
            return res;
        }
        return "notFound";
    }

    /**handler function to check if a image iis changed */
    handleImageEditCheck(qLayerID, qId, qImg){
        let obj = this.psFile;
        return this.checkIfImageChanged(obj, qLayerID, qId, qImg);
    }

    checkIfImageChanged(obj, qLayerID, qId, qImg){
        let res;
        if(obj.hasOwnProperty('layers')){
            for(let i in obj['layers']){
                let currentEle = obj['layers'][i];
            
                if(currentEle.name == qId && (currentEle.hasOwnProperty('type') && currentEle.type == 'layer')){
                   
                    return this.checkImages(qImg, JSON.parse(currentEle.generatorSettings.PanelScriptsImage.json).image);
                }else{
                    res = this.checkIfImageChanged(currentEle, qLayerID, qId, qImg)
                }
            }
            return res;
        }
        return "not_changed";
         
    }

    readImages(url){
        return new Promise((resolve, reject)=>{
            fs.readFile(url, 'base64', (err, img) => {
                if(err){
                    return reject(err);
                }else{
                    return resolve(img);
                }
            });
        });
    }

    async checkImages(qImg, psImg){
        try{
            const img1 = this.readImages(`q_assets/desktop/common/bigWin/${qImg}.png`);
    
            const img2 = this.readImages(`ps_assets/desktop/common/bigWin/${psImg}.png`);
            
            await img1;
            await img2;
            // console.log(img1);
             
            // console.log(img2);
            
            return (img1==img2)?"img_not_changed":"img_changed";
    
        }catch(error){
            console.log(error);
            return "error";
        }

   
    
    }
   
}

module.exports = Parser;

