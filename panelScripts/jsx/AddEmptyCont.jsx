#include "C:\\Users\\hswaroop\\photoshop-scripting\\panelScripts\\jsx\\CreateStruct.jsx";
var emptyContName = "EmptyContainer" + params.clicks;
var layerConfig = {
    kind: LayerKind.TEXT
}
var layerKindConfig = {
    contents: ""
}
var emptyContRef = insertLayer(app.activeDocument, emptyContName, "layerSection");
insertLayer(emptyContRef, "", "artLayer", layerConfig, layerKindConfig);