#include "C:\\Users\\hswaroop\\photoshop-scripting\\panelScripts\\jsx\\CreateStruct.jsx";
var animationStruct = ["end", "loop", "start"];
var animationTypeCount = animationStruct.length;
var animationName = params.childName ? params.childName : "Animation" + params.clicks;
var layerConfig = {
    kind: LayerKind.TEXT,
    opacity: 0.3
};

var parentRef = params.parentName ? getInsertionReference(app.activeDocument, params.parentName) : app.activeDocument;
var animationRef = insertLayer(parentRef, animationName, "layerSection");
for(var i=0;i<animationTypeCount;i++) {
    var layerRef = insertLayer(animationRef, animationStruct[i], "layerSection");
    var pathName = getPathName(layerRef, "Image.png");
    insertLayer(layerRef, pathName, "artLayer", layerConfig);
}