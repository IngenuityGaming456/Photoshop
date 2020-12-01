app.activeDocument = app.documents[0];
var path = (new File($.fileName)).parent;
var upperPath = path + "/Plug-ins/DeployVersion";
var innerPath = path + "/Plug-ins/Generator/DeployVersion";
var fol = new Folder(upperPath);
var selPath = fol.exists ? upperPath : innerPath;
var pathNew = selPath + "/jsx/CreateStruct.jsx";
$.evalFile(pathNew);
var activeLayer = getInsertionReferenceById(params.id);
if(params.level === 1) {
    activeLayer.name = activeLayer.name.substring(0, params.index) + params.sequence;
} else {
    activeLayer.name = activeLayer.name + "-Error";
}