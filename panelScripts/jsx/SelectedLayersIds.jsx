app.activeDocument = app.documents[0];
var selectedLayersIds = [];
var ref = new ActionReference();
ref.putEnumerated( charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
var desc = executeActionGet(ref);
if(desc.hasKey(stringIDToTypeID("targetLayersIDs"))) {
    var idList = desc.getList(stringIDToTypeID("targetLayersIDs"));
    var noOfSelectedLayers = idList.count;
    for(var i=0;i<noOfSelectedLayers;i++) {
        var descRef  = idList.getReference(i);
        selectedLayersIds.push(descRef.getIdentifier());
    }
}
selectedLayersIds;