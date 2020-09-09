#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var meterObj = getElementRef(params, "Meter");
var mappedMeterRef;
var meterRef = insertLayer(meterObj.ref, meterObj.name, "layerSection");
if(params["mappedItem"]) {
    mappedMeterRef = getInsertionReferenceById(params["mappedItem"].id);
    duplicateContainer(mappedMeterRef, meterRef);
}
meterRef.id;