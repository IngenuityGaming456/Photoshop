app.activeDocument = app.documents[0];
var selectedLayersName = [];
var ref = new ActionReference();
ref.putEnumerated( charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
var desc = executeActionGet(ref);
if( desc.hasKey( stringIDToTypeID( 'targetLayers' ) ) ) {
    desc = desc.getList(stringIDToTypeID('targetLayers'));
    var selectedLayersCount = desc.count;
    for (var i = 0; i < selectedLayersCount; i++) {
        selectedLayersReference(desc.getReference(i).getIndex() + 1);
    }
}

function selectedLayersReference(index) {
    var ref = new ActionReference();
    ref.putProperty( charIDToTypeID("Prpr") , charIDToTypeID( "Nm  " ));
    ref.putIndex( charIDToTypeID( "Lyr " ), index );
    selectedLayersName.push(executeActionGet(ref).getString(charIDToTypeID( "Nm  " )));
}
selectedLayersName;