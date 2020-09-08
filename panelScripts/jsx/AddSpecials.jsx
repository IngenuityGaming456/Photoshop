#include "F:\\projects\\project_photoshop\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var specialIds = "";
var specialStruct = ["Animation", "Static"];
var specialStructLength = specialStruct.length;
var layerConfig = {
    kind: LayerKind.TEXT
};

function makeSpecials(specialName, singular, callBack) {
    try {
        var obj = {
            specialIds : ""
        };
        var isValid = false;
        var selectedLayersIds = $.evalFile("D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\SelectedLayersIds.jsx");
        var selectedLayersIdsArray = selectedLayersIds.toString().split(",");
        var idsCount = selectedLayersIdsArray.length;
        for(var i=0;i<idsCount;i++) {
            var layerRef = getInsertionReferenceById(Number(selectedLayersIdsArray[i]));
            if(layerRef.name === specialName) {
                var startCount = getStartCount(layerRef);
                var symbolCount = quickMaker('Select no of ' + specialName);
                for(var j=0;j<symbolCount;j++) {
                    if(j > 0) obj.specialIds += ",";
                    var addedSequence = Number(startCount) + j + 1;
                    app.doForcedProgress("Making" + specialName, "callBack(layerRef, singular + addedSequence, obj)");
                }
                isValid = true;
                break;
            }
        }
        return isValid + "," + specialName + "," + obj.specialIds;
    } catch(err) {
        return false + "," + specialName;
    }
}

function drawSpecials(specialRef, specialName, obj) {
    var specRef = insertLayer(specialRef, specialName, "layerSection");
    obj.specialIds += specRef.id;
    for (var i = 0; i < specialStructLength; i++) {
        var layerRef = insertLayer(specRef, specialStruct[i], "layerSection");
        if(specialStruct[i] !== "Static") {
            var pathName = getPathName(layerRef, "Image.png", specialName, 0);
            insertLayer(layerRef, pathName, "artLayer", layerConfig);
        }
    }
}