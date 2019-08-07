#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var animationStruct = ["end", "loop", "start"];
var animationTypeCount = animationStruct.length;
var animationName = params.childName ? params.childName : "Animation" + params.clicks;
var layerConfig = {
    kind: LayerKind.TEXT,
    opacity: 0.3
};

var parentRef = params.parentId ? getInsertionReferenceById(params.parentId) :
    getParentRef();
var animationRef = insertLayer(parentRef, animationName, "layerSection");
for (var i = 0; i < animationTypeCount; i++) {
    var layerRef = insertLayer(animationRef, animationStruct[i], "layerSection");
    var pathName = getPathName(layerRef, "Image.png");
    insertLayer(layerRef, pathName, "artLayer", layerConfig);
}

animationRef.id;