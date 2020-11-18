var path = (new File($.fileName)).parent;
var upperPath = path + "/Plug-ins/DeployVersion";
var innerPath = path + "/Plug-ins/Generator/DeployVersion";
var fol = new Folder(upperPath);
var selPath = fol.exists ? upperPath : innerPath;
var pathNew = selPath + "/jsx/CreateStruct.jsx";
$.evalFile(pathNew);
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
    if(params["frames"]) {
        insertImage({dimensions: params.dimensions, file: params["frames"][buttonStruct[i]], "childName": buttonStruct[i]}, {});
    }
    if(mappedButtonRef) {
        var mappedStructRef = findStructRef(mappedButtonRef, buttonStruct[i]);
        if(mappedStructRef) {
            duplicateContainer(mappedStructRef, buttonStructRef);
        }
    }
}

buttonRef.id;