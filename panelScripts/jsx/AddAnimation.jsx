#include "F:\\projects\\project_photoshop\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var animationStruct = ["end", "loop", "start"];
var animationTypeCount = animationStruct.length;
var animationObj = getElementRef(params, "Animation");
var layerConfig = {
    kind: LayerKind.TEXT,
};
var animationRef = insertLayer(animationObj.ref, animationObj.name, "layerSection");
for (var i = 0; i < animationTypeCount; i++) {
    var layerRef = insertLayer(animationRef, animationStruct[i], "layerSection");
    var pathName = getPathName(layerRef, "Image.png", animationObj.name, 0);
    var tempTextLayer = insertLayer(layerRef, pathName, "artLayer", layerConfig);
    translate(tempTextLayer);
}
animationRef.id;