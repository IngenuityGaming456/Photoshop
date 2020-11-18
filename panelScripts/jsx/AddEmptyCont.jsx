var path = (new File($.fileName)).parent;
var upperPath = path + "/Plug-ins/DeployVersion";
var innerPath = path + "/Plug-ins/Generator/DeployVersion";
var fol = new Folder(upperPath);
var selPath = fol.exists ? upperPath : innerPath;
var pathNew = selPath + "/jsx/CreateStruct.jsx";
$.evalFile(pathNew);
var layerConfig = {
    kind: LayerKind.TEXT,
};
var layerKindConfig = {
    contents: ""
};
var emptyContainerObj = getElementRef(params, "EmptyContainer");
var emptyContRef = insertLayer(emptyContainerObj.ref, emptyContainerObj.name, "layerSection");
insertLayer(emptyContRef, "", "artLayer", layerConfig, layerKindConfig);;
emptyContRef.id;