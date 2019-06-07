var controlledArray = [];
var docLayers = app.activeDocument.layers;
searchTree(docLayers);

function searchTree(layers) {
    var layersCount = layers.length;
    for(var i=0;i<layersCount;i++) {
        var layerRef = layers[i];
        if (!layerRef.kind) {
            var layerName = layerRef.name;
            var keyName = params.type;
            var position = layerName.search(keyName);
            if (position !== -1) {
                var sequenceId = layerName.slice(keyName.length);
                var typeObj = layerRef.id + ":" + sequenceId;
                controlledArray.push(typeObj);
                searchTree(layerRef);
            }
        }
    }
}
controlledArray;