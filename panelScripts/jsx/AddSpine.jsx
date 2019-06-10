#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var spineName = params.childName? params.childName : "Spine" + params.clicks;
var parentRef = params.parentName ? getInsertionReference(app.activeDocument, params.parentName) : app.activeDocument;
var spineRef = insertLayer(parentRef, spineName, "layerSection");
var pathName = getPathName(spineRef, "Image.png");
insertLayer(spineRef, pathName, "artLayer", {
    kind: LayerKind.TEXT,
    opacity: 0.3
});
spineRef.id;