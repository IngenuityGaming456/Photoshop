const fs = require('fs');
const Parser = require('./parser');
let parser = new Parser();
// const psJson = require('./photoshop.json');
// const qJson = require('./quest.json');

class Index{
    psFile;
    qFile;
    constructor(){
        this.qFile = JSON.parse(fs.readFileSync('quest.json', 'utf8'));
        let obj = this.qFile;
        let plateform = obj['desktop'];
        let language = plateform['en'];
        let view = language['bigWin'];

        this.checkIfElementMoveGetParent(view);

        this.checkIfElementEdited(view);

        this.checkIfImageEdited(view);
        //this.checkImages();
         /**root element of view */
        //let root = this.getRootOfView(view, plateform);
        
    }

    getRootOfView(view, plateform){
        console.log(view);
        for(let obj in view){
            console.log(obj, "  ",view[obj] instanceof Object)
            if(view[obj] instanceof Object && view[obj]["parent"] == ""){
                return view[obj];
            }
        }
        return false;
    }

    checkIfElementMoveGetParent(viewObj){
        /**iterate over every objct one by one */
        for (let obj in viewObj){
            /**check if obj is an instance of an object */
      
            if(viewObj[obj] instanceof Object){
          
                let comp = viewObj[obj];
                if(comp.parent != "" && typeof comp.layerID[0] == 'number'){
                  
                    let res = parser.checkAndGetNewParent(comp.layerID[0], comp.id, comp.parent);

                    console.log(res);
                }
            }
        }
    }

    checkIfElementEdited(viewObj){
        /**iterate over every objct one by one */
        for (let obj in viewObj){
            /**check if obj is an instance of an object */
      
            if(viewObj[obj] instanceof Object){
          
                let comp = viewObj[obj];
                /**chck only for the elements which were created by PS as they have integer layerid */
                if(typeof comp.layerID[0] == 'number'){
                  
                    let height = comp.h||comp.height;
                    let width = comp.w||comp.width;
                    // console.log("height ",height);
                    // console.log("width ",width);

                    let img = comp.image?comp.image:"";
                   // console.log("image is : ", img)
                    let res = parser.getEditedElement(comp.layerID[0], comp.id, comp.x, comp.y, width, height, img);

                    console.log(res);
                }
            }
        }
    }

    async checkIfImageEdited(viewObj){
        for (let obj in viewObj){
            /**check if obj is an instance of an object */
      
            if(viewObj[obj] instanceof Object){
          
                let comp = viewObj[obj];
                /**chck only for the elements which were created by PS as they have integer layerid */
                if(typeof comp.layerID[0] == 'number' && comp.image){
                    let res = await parser.handleImageEditCheck(comp.layerID[0], comp.id, comp.image);

                    console.log(res);
                }
            }
        }
        
    }

   
   
}


let o = new Index();
//o.print();
// o.iterateOver();