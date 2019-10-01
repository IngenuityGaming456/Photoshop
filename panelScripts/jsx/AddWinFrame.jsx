#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var winFrameName = "WinFrame" + params.clicks;
var winFrameStruct = ["Animation", "Static"];
var insertedWinFrameRef;
var winFrameStructLength = winFrameStruct.length;
var layerConfig = {
    kind: LayerKind.TEXT,
    opacity: 0.3
};

var selectedLayersIds = $.evalFile("D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\SelectedLayersIds.jsx");
var selectedLayersIdsArray = selectedLayersIds.toString().split(",");
var idsCount = selectedLayersIdsArray.length;
for(var i=0;i<idsCount;i++) {
    var layerRef = getInsertionReferenceById(Number(selectedLayersIdsArray[i]));
    if(layerRef.name === "WinFrames") {
        insertedWinFrameRef = drawWinFrames(layerRef);
        break;
    }
}

function drawWinFrames(winFramesRef) {
    var winFrameRef = insertLayer(winFramesRef, winFrameName, "layerSection");
    for (var i = 0; i < winFrameStructLength; i++) {
        var layerRef = insertLayer(winFrameRef, winFrameStruct[i], "layerSection");
        if(winFrameStruct[i] !== "Static") {
            var pathName = getPathName(layerRef, "Image.png", winFrameName, 0);
            insertLayer(layerRef, pathName, "artLayer", layerConfig);
        }
    }
    return winFrameRef;
}

insertedWinFrameRef.id;