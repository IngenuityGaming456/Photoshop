#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var parentRef = params.parentName ? getInsertionReference(app.activeDocument, params.parentName) :
    app.activeDocument;
if(params.checkSelection) {
    var selectedLayers = $.evalFile("D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\SelectedLayers.jsx");
    var selectedLayersString = selectedLayers.toString();
    if(selectedLayersString.length) {
        parentRef = app.activeDocument.activeLayer;
    }
}
var layerConfig;
if(params.subType && params.subType === "text") {
    layerConfig = {
        kind: LayerKind.TEXT
    };
}
insertLayer(parentRef, params.childName, params.type, layerConfig);