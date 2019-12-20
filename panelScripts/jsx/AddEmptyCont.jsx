#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var layerConfig = {
    kind: LayerKind.TEXT,
};
var layerKindConfig = {
    contents: ""
};
var emptyContainerObj = getElementRef(params, "EmptyContainer");
var emptyContRef = insertLayer(emptyContainerObj.ref, emptyContainerObj.name, "layerSection");
insertLayer(emptyContRef, "", "artLayer", layerConfig, layerKindConfig);;
emptyContRef.id;