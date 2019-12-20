var path = (new File($.fileName)).parent;
var pathNew = path + "/Plug-ins/Generator/DeployVersion/jsx/CreateStruct.jsx";
$.evalFile(pathNew);
if(params.id) {
    var activeLayer = getInsertionReferenceById(params.id);
    if(activeLayer) {
        activeLayer.remove();
    }
}
if(params.level === 1) {
    var backgroundLayer = app.activeDocument.artLayers[0];
    app.activeDocument.artLayers.add();
    if(backgroundLayer.isBackgroundLayer) {
        backgroundLayer.remove();
    }
}