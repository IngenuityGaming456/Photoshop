#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
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

childLayerRef.id;