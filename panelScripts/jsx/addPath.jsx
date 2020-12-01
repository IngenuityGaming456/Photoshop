app.activeDocument = app.documents[0];
var path = (new File($.fileName)).parent;
var upperPath = path + "/Plug-ins/DeployVersion";
var innerPath = path + "/Plug-ins/Generator/DeployVersion";
var fol = new Folder(upperPath);
var selPath = fol.exists ? upperPath : innerPath;
var pathNew = selPath + "/jsx/CreateStruct.jsx";
$.evalFile(pathNew);
var ref = new ActionReference();
ref.putIdentifier(charIDToTypeID('Lyr '), Number(params.id));
var desc = new ActionDescriptor();
desc.putReference(charIDToTypeID("null"), ref );
executeAction(charIDToTypeID("slct"), desc, DialogModes.NO );
var activeLayer = app.activeDocument.activeLayer;
activeLayer.name = activeLayer.name.replace(/\s/g, "");
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