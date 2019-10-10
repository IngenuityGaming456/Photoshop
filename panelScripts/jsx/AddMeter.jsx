#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var meterName = params.childName ? params.childName : "Meter" + params.clicks;
var parentRef = params.parentId ? getInsertionReferenceById(params.parentId) :
    getParentRef();
var mappedMeterRef;
var meterRef = insertLayer(parentRef, meterName, "artLayer", { kind: LayerKind.TEXT });
if(params["mappedItem"]) {
    mappedMeterRef = getInsertionReferenceById(params["mappedItem"].id);
    duplicateTextLayer(mappedMeterRef, meterRef);
}
meterRef.id;