#include "D:\\Projects\\PS\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var winFrameName = "WinFrame" + params.clicks;
var winFrameStruct = ["Animation", "Static"];
var winFrameStructLength = winFrameStruct.length;
var layerConfig = {
    kind: LayerKind.TEXT,
    opacity: 0.3
};

var winFramesRef;
try {
    winFramesRef = getInsertionReference(app.activeDocument, "WinFrames");
} catch (err) {
    winFramesRef = insertLayer(app.activeDocument, "WinFrames", "layerSection");
}

var winFrameRef = insertLayer(winFramesRef, winFrameName, "layerSection");
for (var i = 0; i < winFrameStructLength; i++) {
    var layerRef = insertLayer(winFrameRef, winFrameStruct[i], "layerSection");
    var pathName = getPathName(layerRef, "Image.png");
    insertLayer(layerRef, pathName, "artLayer", layerConfig);
}
winFrameRef.id;