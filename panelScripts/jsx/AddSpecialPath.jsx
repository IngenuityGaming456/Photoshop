#include "F:\\projects\\project_photoshop\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var activeLayer = getInsertionReferenceById(params.id);
app.doForcedProgress(restructurePath(activeLayer, params.parentName, params.subLayerName));

function restructurePath(animationLayer, parentName, subLayerName) {
    restructureAnimations(animationLayer, parentName, subLayerName);
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