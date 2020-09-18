#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var childLayerRef;
var activeLayer;
var parentRef = params.parentId ? getInsertionReferenceById(params.parentId) :
    app.activeDocument;
var layerConfig;
if (params.subType && params.subType === "text") {
    layerConfig = {
        kind: LayerKind.TEXT,
    };
}

if(!params["image"]) {
    childLayerRef = insertLayer(parentRef, params.childName, params.type, layerConfig);
}

if(params["mappedItem"]) {
    var mappedItemRef = getInsertionReferenceById(params["mappedItem"].id);
    if(params.subType && params.subType === "text") {
        app.doForcedProgress("Duplicating Text", "duplicateTextLayer(mappedItemRef, childLayerRef)");
    } else {
        app.doForcedProgress("Duplicating Container", "duplicateContainer(mappedItemRef, childLayerRef)");
    }
}

if(params["image"]){
    var mask = app.activeDocument.activeLayer;
    var fileRef = new File(params.file);
    app.open(fileRef);
    app.activeDocument.flatten();
    app.activeDocument.selection.selectAll();
    app.activeDocument.selection.copy();
    var imageBounds = app.activeDocument.selection.bounds;
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    var topLeftH = 0;
    var topLeftV = 0;
    var docH = imageBounds[2]-imageBounds[0];
    var docV = imageBounds[3]- imageBounds[1];
    var selRegion = [[new UnitValue(0, "px"), new UnitValue(0, "px")], [new UnitValue(docH, "px"), new UnitValue(0, "px")], [new UnitValue(docH, "px"), new UnitValue(docV, "px")], [new UnitValue(0, "px"), new UnitValue(docV, "px")]];
    app.activeDocument.selection.select(selRegion);
    app.activeDocument.paste();
    activeLayer = app.activeDocument.activeLayer;
    if(params["dimensions"]){
        var dimensions = params["dimensions"];
        var relativeX = dimensions.parentX + dimensions.x;
        var relativeY = dimensions.parentY + dimensions.y;

        activeLayer.translate(relativeX, relativeY);
    }
    activeLayer.name = params.childName;
}
if(params["image"]) {
    activeLayer.id;
} else {
    childLayerRef.id;
}