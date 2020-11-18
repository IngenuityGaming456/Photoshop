var path = (new File($.fileName)).parent;
var upperPath = path + "/Plug-ins/DeployVersion";
var innerPath = path + "/Plug-ins/Generator/DeployVersion";
var fol = new Folder(upperPath);
var selPath = fol.exists ? upperPath : innerPath;
var pathNew = selPath + "/jsx/CreateStruct.jsx";
$.evalFile(pathNew);
if (params.id) {
    var activeLayer = getInsertionReferenceById(params.id);
    if (activeLayer) {
        activeLayer.remove();
    }
}
if (params.level === 1) {
    var backgroundLayer = app.activeDocument.artLayers[0];
    app.activeDocument.artLayers.add();
    if (backgroundLayer.isBackgroundLayer) {
        backgroundLayer.remove();
    }
}
