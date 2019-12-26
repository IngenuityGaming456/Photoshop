var path = (new File($.fileName)).parent;
var pathNew = path + "/Plug-ins/Generator/DeployVersion/jsx/CreateStruct.jsx";
$.evalFile(pathNew);
var meterObj = getElementRef(params, "Meter");
var mappedMeterRef;
var meterRef = insertLayer(meterObj.ref, meterObj.name, "layerSection");
if(params["mappedItem"]) {
    mappedMeterRef = getInsertionReferenceById(params["mappedItem"].id);
    duplicateContainer(mappedMeterRef, meterRef);
}
meterRef.id;