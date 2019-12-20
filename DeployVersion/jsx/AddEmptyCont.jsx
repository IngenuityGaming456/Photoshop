var path = (new File($.fileName)).parent;
var pathNew = path + "/Plug-ins/Generator/DeployVersion/jsx/CreateStruct.jsx";
$.evalFile(pathNew);
var emptyContName = "EmptyContainer" + params.clicks;
var layerConfig = {
    kind: LayerKind.TEXT,
};
var layerKindConfig = {
    contents: ""
};
var parentRef = params.parentId ? getInsertionReferenceById(params.parentId) :
    getParentRef();
var emptyContRef = insertLayer(parentRef, emptyContName, "layerSection");
insertLayer(emptyContRef, "", "artLayer", layerConfig, layerKindConfig);;
emptyContRef.id;