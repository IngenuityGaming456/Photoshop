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

    var fileRef = new File("F:\\images\\im.jpg");
    var docRef = app.open (fileRef)

    app.activeDocument.selection.selectAll();
    app.activeDocument.selection.copy();
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);

    app.activeDocument.paste();
}
if(params["dimensions"]){
    var dimensions = params["dimensions"];
    var relativeX = dimensions.parentX + dimensions.x;
    var relativeY = dimensions.parentY + dimensions.y;
    childLayerRef.resizeImage(UnitValue(dimensions.width, "px"),UnitValue(dimensions.height, "px"));
    childLayerRef.translate(relativeX, relativeY);
}
childLayerRef.id;