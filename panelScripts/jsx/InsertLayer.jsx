#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var parentRef = params.parentName ? getInsertionReference(app.activeDocument, params.parentName) :
    app.activeDocument;
var layerConfig;
if(params.subType && params.subType === "text") {
    layerConfig = {
        kind: LayerKind.TEXT
    };
}
insertLayer(parentRef, params.childName, params.type, layerConfig);