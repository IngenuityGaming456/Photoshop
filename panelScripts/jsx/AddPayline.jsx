#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var paylineName = params && params.clicks ? "Payline" + params.clicks : "Payline1";
var paylineStruct = ["Animation", "Static"];
var paylineStructLength = paylineStruct.length;
var layerConfig = {
    kind: LayerKind.TEXT,
    opacity: 0.3
};

var paylinesRef;
try {
    paylinesRef = app.activeDocument.layerSets.getByName("Paylines");
} catch(err) {
    paylinesRef = insertLayer(app.activeDocument, "Paylines", "layerSection");
}

var paylineRef = insertLayer(paylinesRef, paylineName, "layerSection");
for(var i=0;i<paylineStructLength;i++) {
    var layerRef = insertLayer(paylineRef, paylineStruct[i], "layerSection");
    var pathName = getPathName(layerRef, "Image.png");
    insertLayer(layerRef, pathName, "artLayer", layerConfig);
}