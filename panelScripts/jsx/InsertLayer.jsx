var path = (new File($.fileName)).parent;
var upperPath = path + "/Plug-ins/DeployVersion";
var innerPath = path + "/Plug-ins/Generator/DeployVersion";
var fol = new Folder(upperPath);
var selPath = fol.exists ? upperPath : innerPath;
var pathNew = selPath + "/jsx/CreateStruct.jsx";
$.evalFile(pathNew);
var childLayerRef;
var activeLayer = {};
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

if(params["image"]) {
    activeLayer = insertImage(params);
}

if(params["text"]) {
    insertText(params, childLayerRef);
}

if(params["image"]) {
    activeLayer.id;
} else {
    childLayerRef.id;
}