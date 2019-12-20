var path = (new File($.fileName)).parent;
var pathNew = path + "/Plug-ins/Generator/DeployVersion/jsx/CreateStruct.jsx";
$.evalFile(pathNew);
var activeLayer = getInsertionReferenceById(params.id);
activeLayer.name = params.name;