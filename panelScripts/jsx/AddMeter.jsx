var path = (new File($.fileName)).parent;
var upperPath = path + "/Plug-ins/DeployVersion";
var innerPath = path + "/Plug-ins/Generator/DeployVersion";
var fol = new Folder(upperPath);
var selPath = fol.exists ? upperPath : innerPath;
var pathNew = selPath + "/jsx/CreateStruct.jsx";
$.evalFile(pathNew);
var meterObj = getElementRef(params, "Meter");
var mappedMeterRef;
var meterRef = insertLayer(meterObj.ref, meterObj.name, "layerSection");
if(params["mappedItem"]) {
    mappedMeterRef = getInsertionReferenceById(params["mappedItem"].id);
    duplicateContainer(mappedMeterRef, meterRef);
}
if(params["text"]) {
    var textId = insertLayer(meterRef, meterRef.name, "artLayer", {kind: LayerKind.TEXT});
    insertText(params, textId);
}
meterRef.id;