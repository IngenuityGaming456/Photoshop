var path = (new File($.fileName)).parent;
var pathNew = path + "/Plug-ins/Generator/DeployVersion/jsx/CreateStruct.jsx";
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