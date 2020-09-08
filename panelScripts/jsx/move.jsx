#include "F:\\projects\\project_photoshop\\photoshopscript\\generator-core\\plugins\\panelScripts\\jsx\\CreateStruct.jsx";


var newParent =getInsertionReferenceById(params.newParentId);
var child = getInsertionReferenceById(params.childId);

if(newParent && child){
    if(child.typename == "LayerSet"){
        var newObj = newParent.layerSets.add();
            newObj.name = child.name;
            moveLayers(newObj, child);
    }else{
    moveLayers(newParent, child);
    }
    child.remove();
}


function moveLayers(newParent, child){
    for(var i=0;i<child.layers.length; i++){
        if(child.layers[i].typename == "ArtLayer"){
             child.layers[i].duplicate(newParent, ElementPlacement.PLACEATEND);
        }else{
               var newObj = newParent.layerSets.add();
               newObj.name = child.layers[i].name;
               moveLayers(newObj, child.layers[i]);       
        }
    }
}