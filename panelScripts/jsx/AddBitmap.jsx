#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var radioResponse;
var bitmapObj = getElementRef(params, "Bitmap");
var dir = app.activeDocument.fullName.toString();
var assetsPath = dir.substring(0, dir.indexOf(".psd")) + "-assets";
var othersPath = assetsPath + "/others/Bitmaps";
var assetsFolder = new Folder(assetsPath);
if(assetsFolder.exists) {
    var othersFolder = new Folder(othersPath);
    if(othersFolder.exists) {
        var filesArray = othersFolder.getFiles(/\.(json|xml)/);
        bitmapSelectionPanel(filesArray);
    } else {
        othersFolder.create();
    }
}

function bitmapSelectionPanel(filesArray) {
    var windowStruct = makeWindowAndPanel('Select Options', 'Choose Bitmap Fonts');
    addElementsToPanel(windowStruct.panel, filesArray, 'radiobutton');
    var bitmapButton = windowStruct.panel.add('button', undefined, 'OK');
    bitmapButton.addEventListener('click', handleResponse);
    windowStruct.window.show();
    function handleResponse() {
        radioResponse = getRadioResponse(windowStruct.panel, filesArray.length);
        windowStruct.window.close();
    }
}

if(radioResponse) {
    var bitmapRef = insertLayer(bitmapObj.ref, bitmapObj.name, "artLayer", { kind: LayerKind.TEXT });
    bitmapRef.id + "," + radioResponse;
} else {
    "bitmap";
}