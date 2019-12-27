var path = (new File($.fileName)).parent;
var pathNew = path + "/Plug-ins/Generator/DeployVersion/jsx/CreateStruct.jsx";
var pathSymbol = path + "/Plug-ins/Generator/DeployVersion/jsx/SelectedLayersIds.jsx";
$.evalFile(pathNew);
var specialStruct = ["Animation", "Static"];
var specialStructLength = specialStruct.length;
var layerConfig = {
    kind: LayerKind.TEXT
};

function makeSpecials(specialName, singular, callBack) {
    try {
        var isValid = false;
        var selectedLayersIds = $.evalFile(pathSymbol);
        var selectedLayersIdsArray = selectedLayersIds.toString().split(",");
        var idsCount = selectedLayersIdsArray.length;
        for(var i=0;i<idsCount;i++) {
            var layerRef = getInsertionReferenceById(Number(selectedLayersIdsArray[i]));
            if(layerRef.name === specialName) {
                var startCount = getStartCount(layerRef);
                var symbolCount = quickMaker(specialName);
                for(var j=0;j<symbolCount;j++) {
                    var addedSequence = Number(startCount) + j + 1;
                    app.doForcedProgress("Making" + specialName, "callBack(layerRef, singular + addedSequence)");
                }
                isValid = true;
                break;
            }
        }
        return isValid + "," + specialName;
    } catch(err) {
        return false + "," + specialName;
    }
}

function drawSpecials(specialRef, specialName) {
    var specRef = insertLayer(specialRef, specialName, "layerSection");
    for (var i = 0; i < specialStructLength; i++) {
        var layerRef = insertLayer(specRef, specialStruct[i], "layerSection");
        if(specialStruct[i] !== "Static") {
            var pathName = getPathName(layerRef, "Image.png", specialName, 0);
            insertLayer(layerRef, pathName, "artLayer", layerConfig);
        }
    }
}