#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var activeLayer = getInsertionReferenceById(params.id);
app.doForcedProgress(restructurePath(activeLayer));

function restructurePath(layerRef) {
    var layerSets = layerRef.layerSets;
    var layerSetCount = layerSets.length;
    for(var i=0;i<layerSetCount;i++) {
        var subLayerRef = layerSets[i];
        var nestedLayerSets = subLayerRef.layerSets;
        var animationLayer = nestedLayerSets[2];
        restructureAnimations(animationLayer, layerRef.name, subLayerRef.name);
    }
}

function restructureAnimations(nestedLayerRef, parentName, travelName) {
    if(parentName === "Symbols") {
        var nestedLayers = nestedLayerRef.layerSets;
        var count = nestedLayers.length;
        for(var i=0;i<count;i++) {
            var ref = nestedLayers[i];
            ref.layers[0].name = "Image.png";
            ref.layers[0].name = getPathName(ref.layers[0], "", travelName, 0);
        }
    } else {
        nestedLayerRef.layers[0].name = "Image.png";
        nestedLayerRef.layers[0].name = getPathName(nestedLayerRef.layers[0], "", travelName, 0);
    }
}