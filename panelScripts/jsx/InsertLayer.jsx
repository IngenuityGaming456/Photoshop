#include "F:\\projects\\project_photoshop\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";

var parentRef = params.parentId ? getInsertionReferenceById(params.parentId) :
    app.activeDocument;
var layerConfig;
if (params.subType && params.subType === "text") {
    layerConfig = {
        kind: LayerKind.TEXT,
    };
}

var childLayerRef = insertLayer(parentRef, params.childName, params.type, layerConfig);

if(params["mappedItem"]) {
    var mappedItemRef = getInsertionReferenceById(params["mappedItem"].id);
    if(params.subType && params.subType === "text") {
        app.doForcedProgress("Duplicating Text", "duplicateTextLayer(mappedItemRef, childLayerRef)");
    } else {
        app.doForcedProgress("Duplicating Container", "duplicateContainer(mappedItemRef, childLayerRef)");
    }
}

if(params["image"]){

    var currentParent = params.parentId ? getInsertionReferenceById(params.parentId) :app.activeDocument;
    var mask = app.activeDocument.activeLayer;
    var fileRef = new File(params.file);
    var docRef = app.open(fileRef);
    
    var imageBounds = mask.bounds;

    var maskTop = imageBounds[0];
    var maskLeft = imageBounds[1];
    var maskWidth = imageBounds[2]-imageBounds[0];
    var maskHeight = imageBounds[3]- imageBounds[1];

    var pastedImg = docRef.activeLayer.duplicate(mask, ElementPlacement.PLACEBEFORE); 

    docRef.close(SaveOptions.DONOTSAVECHANGES);

    if(params["dimensions"]){
        var dimensions = params["dimensions"];
        var relativeX = dimensions.parentX + dimensions.x;
        var relativeY = dimensions.parentY + dimensions.y;
      
        pastedImg.translate(relativeX, relativeY);
    }
}
childLayerRef.id;