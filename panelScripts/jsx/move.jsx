app.activeDocument = app.documents[0];
var path = (new File($.fileName)).parent;
var upperPath = path + "/Plug-ins/DeployVersion";
var innerPath = path + "/Plug-ins/Generator/DeployVersion";
var fol = new Folder(upperPath);
var selPath = fol.exists ? upperPath : innerPath;
var pathNew = selPath + "/jsx/CreateStruct.jsx";
$.evalFile(pathNew);

var newParent =getInsertionReferenceById(params.newParentId);
var child = getInsertionReferenceById(params.childId);

if(newParent && child){
    if(child.typename === "LayerSet"){
        var newObj = newParent.layerSets.add();
            newObj.name = child.name;
            moveLayers(newObj, child);
    }else{
    moveLayers(newParent, child);
    }
    child.remove();
}


function moveLayers(newParent, child){
    if(child.typename === "ArtLayer"){
        child.duplicate(newParent, ElementPlacement.PLACEATEND);
    }else{
        for(var i=0;i<child.layers.length; i++){
            if(child.layers[i].typename === "ArtLayer"){
                child.layers[i].duplicate(newParent, ElementPlacement.PLACEATEND);
            }else{
                var newObj = newParent.layerSets.add();
                newObj.name = child.layers[i].name;
                moveLayers(newObj, child.layers[i]);       
            }
        }
    }
}