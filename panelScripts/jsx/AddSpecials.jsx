app.activeDocument = app.documents[0];
var path = (new File($.fileName)).parent;
var upperPath = path + "/Plug-ins/DeployVersion";
var innerPath = path + "/Plug-ins/Generator/DeployVersion";
var fol = new Folder(upperPath);
var selPath = fol.exists ? upperPath : innerPath;
var pathNew = selPath + "/jsx/CreateStruct.jsx";
var pathSymbol = selPath + "/jsx/SelectedLayersIds.jsx";
$.evalFile(pathNew);
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
        var selectedLayersIds = $.evalFile(pathSymbol);
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