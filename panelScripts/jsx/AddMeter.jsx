#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var meterName = params.childName ? params.childName : "Meter" + params.clicks;
var parentRef = params.parentId ? getInsertionReferenceById(params.parentId) :
    getParentRef();
var meterRef = insertLayer(parentRef, meterName, "artLayer", { kind: LayerKind.TEXT });
meterRef.id;