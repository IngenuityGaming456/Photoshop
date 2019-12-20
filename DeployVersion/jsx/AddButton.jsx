var path = (new File($.fileName)).parent;
var pathNew = path + "/Plug-ins/Generator/DeployVersion/jsx/CreateStruct.jsx";
$.evalFile(pathNew);
var buttonStruct = ["disabled", "down", "hover", "normal"];
var statesCount = buttonStruct.length;
var buttonName = params.childName ? params.childName : "Button" + params.clicks;
var parentRef = params.parentId ? getInsertionReferenceById(params.parentId) :
    getParentRef();
var mappedButtonRef;
if(params["mappedItem"]) {
    mappedButtonRef = getInsertionReferenceById(params["mappedItem"].id);
}
var buttonRef = insertLayer(parentRef, buttonName, "layerSection");
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