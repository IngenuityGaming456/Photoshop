var path = (new File($.fileName)).parent;
var pathNew = path + "/Plug-ins/Generator/DeployVersion/jsx/CreateStruct.jsx";
$.evalFile(pathNew);
var ref = new ActionReference();
ref.putIdentifier(charIDToTypeID('Lyr '), Number(params.id));
var desc = new ActionDescriptor();
desc.putReference(charIDToTypeID("null"), ref );
executeAction(charIDToTypeID("slct"), desc, DialogModes.NO );
var activeLayer = app.activeDocument.activeLayer;
var extIndex = activeLayer.name.search(/\.(png|jpg)/);
if( extIndex === -1) {
    activeLayer.name = getPathName(activeLayer.parent,activeLayer.name + ".png", "", 1, "static");
} else {
    if(params.remove) {
        var firstSlashIndex = activeLayer.name.lastIndexOf("/");
        if(firstSlashIndex > -1) {
            activeLayer.name = activeLayer.name.substring(firstSlashIndex + 1, extIndex);
        }
    }
}