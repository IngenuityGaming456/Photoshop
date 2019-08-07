var ref = new ActionReference();
ref.putIdentifier(charIDToTypeID('Lyr '), Number(params.id));
var desc = new ActionDescriptor();
desc.putReference(charIDToTypeID("null"), ref );
executeAction(charIDToTypeID("slct"), desc, DialogModes.NO );
var activeLayer = app.activeDocument.activeLayer;
var extIndex = activeLayer.name.search(/\.(png|jpg)/);
if( extIndex === -1) {
    activeLayer.name += ".png";
} else {
    if(params.remove) {
        activeLayer.name = activeLayer.name.substring(0, extIndex);
    }
}