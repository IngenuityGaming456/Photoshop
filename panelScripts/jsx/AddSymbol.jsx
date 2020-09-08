#include "F:\\projects\\project_photoshop\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
#include "F:\\projects\\project_photoshop\\photoshopscript\\panelScripts\\jsx\\AddSpecials.jsx";
var symbolStruct = ["Animations", "Blur", "Static"];
var animationTypes = ["win", "landing", "trigger"];
var symbolStructLength = symbolStruct.length;
var animationLength = animationTypes.length;
var layerConfig = {
    kind: LayerKind.TEXT
};

var callObj = makeSpecials("Symbols", "Symbol", drawSymbols);

function drawSymbols(symbolsRef, symbolName, obj) {
    var symbolNameRef = insertLayer(symbolsRef, symbolName, "layerSection");
    obj.specialIds += symbolNameRef.id;
    for (var i = 0; i < symbolStructLength; i++) {
        insertLayer(symbolNameRef, symbolStruct[i], "layerSection");
    }
    var animationRef = getInsertionReference(symbolsRef, "Animations");
    for (var i = 0; i < animationLength; i++) {
        var layerRef = insertLayer(animationRef, animationTypes[i], "layerSection");
        var pathName = getPathName(layerRef, "Image.png", symbolName, 0);
        insertLayer(layerRef, pathName, "artLayer", layerConfig);
    }
    return symbolNameRef;
}

callObj;