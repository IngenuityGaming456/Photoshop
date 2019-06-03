function insertLayer(parentRef, childName, layerType, layerConfig, layerKindConfig) {
    var childLayer;
    if(layerType === "layerSection") {
        childLayer = parentRef.layerSets.add();
    }
    if(layerType === "artLayer") {
        childLayer = parentRef.artLayers.add();
        if(layerConfig && layerConfig.hasOwnProperty("opacity")) {
            childLayer.opacity = layerConfig.opacity;
        }
        if(layerConfig && layerConfig.hasOwnProperty("kind")) {
            childLayer.kind = layerConfig.kind;
            childLayer.textItem.contents = layerKindConfig ? layerKindConfig.contents : "Default";
        }
    }
    childLayer.name = childName;
    return childLayer;
}

function getInsertionReference(upperLevelRef, searchKey) {
    var referenceResult = [];
    var layerSetsArray = upperLevelRef.layerSets;
    var layerSetsCount = layerSetsArray.length;
    try {
        return upperLevelRef.layerSets.getByName(searchKey);
    } catch (err) {
        for(var i=0;i<layerSetsCount;i++) {
            referenceResult.push(getInsertionReference(layerSetsArray[i], searchKey));
        }
    }
    var referenceResultLength = referenceResult.length;
    for(var i=0;i<referenceResultLength;i++) {
        if(referenceResult[i]){
            return referenceResult[i];
        }
    }
    return null;
}

function getPathName(layerRef, pathName) {
    if(layerRef === app.activeDocument) {
        return pathName;
    }
    pathName = layerRef.name + "/" + pathName;
    return getPathName(layerRef.parent, pathName);
}