#include "F:\\projects\\project_photoshop\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var buttonStruct = ["disabled", "down", "hover", "normal"];
var statesCount = buttonStruct.length;
var buttonObj = getElementRef(params, "Button");
var mappedButtonRef;
if(params["mappedItem"]) {
    mappedButtonRef = getInsertionReferenceById(params["mappedItem"].id);
}
var buttonRef = insertLayer(buttonObj.ref, buttonObj.name, "layerSection");
for (var i = 0; i < statesCount; i++) {
    var buttonStructRef = insertLayer(buttonRef, buttonStruct[i], "layerSection");
    if(mappedButtonRef) {
        var mappedStructRef = findStructRef(buttonStruct[i]);
        if(mappedStructRef) {
            duplicateContainer(mappedStructRef, buttonStructRef);
        }
    }
}

function findStructRef(buttonStructure) {
    const mappedLayerSets = mappedButtonRef.layerSets;
    const layerSetCount = mappedLayerSets.length;
    for(var i=0;i<layerSetCount;i++) {
        if(mappedLayerSets[i].name === buttonStructure) {
            return mappedLayerSets[i];
        }
    }
    return null;
}

buttonRef.id;