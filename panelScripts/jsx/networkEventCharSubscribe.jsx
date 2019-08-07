var eventIds = ["copy", "past", "Dplc"];
var noOfEvents = eventIds.length;
var idNS = stringIDToTypeID( "networkEventSubscribe" );
var desc1 = new ActionDescriptor();
for(var i=0;i<noOfEvents;i++) {
    desc1.putClass( stringIDToTypeID( "eventIDAttr" ), charIDToTypeID( eventIds[i] ) );
    executeAction( idNS, desc1, DialogModes.NO );
}