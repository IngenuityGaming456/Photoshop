#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var symbolStruct = ["Animations", "Blur", "Static"];
var animationTypes = ["win", "landing", "trigger"];
var insertedSymbolRef;
var symbolStructLength = symbolStruct.length;
var animationLength = animationTypes.length;
var symbolName = "Symbol" + params.clicks;
var layerConfig = {
    opacity: 0.3,
    kind: LayerKind.TEXT
};
var selectedLayersIds = $.evalFile("D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\SelectedLayersIds.jsx");
var selectedLayersIdsArray = selectedLayersIds.toString().split(",");
var idsCount = selectedLayersIdsArray.length;
for(var i=0;i<idsCount;i++) {
    var layerRef = getInsertionReferenceById(Number(selectedLayersIdsArray[i]));
    if(layerRef.name === "Symbols") {
        insertedSymbolRef = drawSymbols(layerRef);
        break;
    }
}

function drawSymbols(symbolsRef) {
    var symbolNameRef = insertLayer(symbolsRef, symbolName, "layerSection");
    for (var i = 0; i < symbolStructLength; i++) {
        var layerRef = insertLayer(symbolNameRef, symbolStruct[i], "layerSection");
    }
    var animationRef = getInsertionReference(symbolsRef, "Animations");
    for (var i = 0; i < animationLength; i++) {
        var layerRef = insertLayer(animationRef, animationTypes[i], "layerSection");
        var pathName = getPathName(layerRef, "Image.png", symbolName, 0);
        insertLayer(layerRef, pathName, "artLayer", layerConfig);
    }
    return symbolNameRef;
}

insertedSymbolRef.id;