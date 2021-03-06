app.activeDocument = app.documents[0];
var path = (new File($.fileName)).parent;
var upperPath = path + "/Plug-ins/DeployVersion";
var innerPath = path + "/Plug-ins/Generator/DeployVersion";
var fol = new Folder(upperPath);
var selPath = fol.exists ? upperPath : innerPath;
var pathNew = selPath + "/jsx/CreateStruct.jsx";
$.evalFile(pathNew);
var radioResponse;
var noPng = true;
var bitmapObj = getElementRef(params, "Bitmap");
var dir = app.activeDocument.fullName.toString();
var assetsPath = dir.substring(0, dir.indexOf(".psd")) + "-assets";
var othersPath = assetsPath + "/others/Bitmaps";
var assetsFolder = new Folder(assetsPath);
if(assetsFolder.exists) {
    var othersFolder = new Folder(othersPath);
    if(othersFolder.exists) {
        var filesArray = othersFolder.getFiles(/\.(json|xml|fnt)/);
        var pngArray = othersFolder.getFiles(/\.(png)/);
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
        var radioCompress = radioResponse.replace(/^.*[\/]/, "");
        var pngCount = pngArray.length;
        if(!pngCount) {
            noPng = true;
        }
        for(var i=0;i<pngCount;i++) {
            var pngStr = pngArray[i].toString().replace(/^.*[\/]/, "").replace(/\.(png)/, "");
            if(pngStr === radioCompress.replace(/\.(json|xml|fnt)/, "")) {
                noPng = false;
                break;
            }
        }
        windowStruct.window.close();
    }
}

if(radioResponse) {
    if(noPng) {
        "bitmap" + noPng;
    } else {
        var bitmapRef = insertLayer(bitmapObj.ref, bitmapObj.name, "layerSection");
        bitmapRef.id + "," + radioResponse;
    }
} else {
    "bitmap";
}