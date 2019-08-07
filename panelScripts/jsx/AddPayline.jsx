#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var paylineName = "Payline" + params.clicks;
var paylineStruct = ["Animation", "Static"];
var insertedPaylineRef;
var paylineStructLength = paylineStruct.length;
var layerConfig = {
    kind: LayerKind.TEXT,
    opacity: 0.3
};

var selectedLayersIds = $.evalFile("D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\SelectedLayersIds.jsx");
var selectedLayersIdsArray = selectedLayersIds.toString().split(",");
var idsCount = selectedLayersIdsArray.length;
for(var i=0;i<idsCount;i++) {
    var layerRef = getInsertionReferenceById(Number(selectedLayersIdsArray[i]));
    if(layerRef.name === "Paylines") {
        insertedPaylineRef = drawPaylines(layerRef);
        break;
    }
}

function drawPaylines(paylinesRef) {
    var paylineRef = insertLayer(paylinesRef, paylineName, "layerSection");
    for (var i = 0; i < paylineStructLength; i++) {
        var layerRef = insertLayer(paylineRef, paylineStruct[i], "layerSection");
        if(paylineStruct[i] !== "Static") {
            var pathName = getPathName(layerRef, "Image.png");
            insertLayer(layerRef, pathName, "artLayer", layerConfig);
        }
    }
    return paylineRef;
}

insertedPaylineRef.id;