var path = (new File($.fileName)).parent;
var pathNew = path + "/Plug-ins/Generator/DeployVersion/jsx/CreateStruct.jsx";
$.evalFile(pathNew);
var activeLayer = getInsertionReferenceById(params.id);
if(params.level === 1) {
    activeLayer.name = activeLayer.name.substring(0, params.index) + params.sequence;
} else {
    activeLayer.name = activeLayer.name + "-Error";
}