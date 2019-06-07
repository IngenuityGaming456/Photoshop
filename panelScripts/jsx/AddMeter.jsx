#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var meterName = params.childName? params.childName : "Meter" + params.clicks;
var parentRef = params.parentName ? getInsertionReference(app.activeDocument, params.parentName) : app.activeDocument;
var meterRef = insertLayer(parentRef, meterName, "artLayer", {kind: LayerKind.TEXT});
meterRef.id;
