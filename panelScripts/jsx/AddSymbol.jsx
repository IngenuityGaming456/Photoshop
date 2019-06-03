#include "C:\\Users\\hswaroop\\photoshop-scripting\\panelScripts\\jsx\\CreateStruct.jsx";
var symbolStruct = ["Animations", "Blur", "Static"];
var animationTypes = ["win", "landing", "trigger"];
var symbolStructLength = symbolStruct.length;
var animationLength = animationTypes.length;
var symbolName = params && params.clicks ? "Symbol" + params.clicks : "Symbol1";
var layerConfig = {
    opacity: 0.3,
    kind: LayerKind.TEXT
};
var symbolsRef;
try {
    symbolsRef = app.activeDocument.layerSets.getByName("Symbols");
} catch(err) {
    symbolsRef = insertLayer(app.activeDocument, "Symbols", "layerSection");
}
var symbolNameRef = insertLayer(symbolsRef, symbolName, "layerSection");
for(var i=0; i<symbolStructLength; i++) {
    var layerRef = insertLayer(symbolNameRef, symbolStruct[i], "layerSection");
    if(layerRef.name !== "Animations") {
        var pathName = getPathName(layerRef, "Image.png");
        insertLayer(layerRef, pathName, "artLayer", layerConfig);
    }
}
var animationRef = getInsertionReference(symbolsRef, "Animations");
for(var i=0; i< animationLength; i++) {
    var layerRef = insertLayer(animationRef, animationTypes[i], "layerSection");
    var pathName = getPathName(layerRef, "Image.png");
    insertLayer(layerRef, pathName, "artLayer", layerConfig);
}