#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var meterObj = getElementRef(params, "Meter");
var mappedMeterRef;
var meterRef = insertLayer(meterObj.ref, meterObj.name, "artLayer", { kind: LayerKind.TEXT });
if(params["mappedItem"]) {
    mappedMeterRef = getInsertionReferenceById(params["mappedItem"].id);
    duplicateTextLayer(mappedMeterRef, meterRef);
}
meterRef.id;