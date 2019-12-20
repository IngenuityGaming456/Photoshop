var path = (new File($.fileName)).parent;
var pathNew = path + "/Plug-ins/Generator/DeployVersion/jsx/CreateStruct.jsx";
$.evalFile(pathNew);
var pathNew1 = path + "/Plug-ins/Generator/DeployVersion/jsx/AddSpecials.jsx";
$.evalFile(pathNew1);
var symbolStruct = ["Animations", "Blur", "Static"];
var animationTypes = ["win", "landing", "trigger"];
var symbolStructLength = symbolStruct.length;
var animationLength = animationTypes.length;
var layerConfig = {
    kind: LayerKind.TEXT
};

var callObj = makeSpecials("Symbols", "Symbol", drawSymbols);

function drawSymbols(symbolsRef, symbolName) {
    var symbolNameRef = insertLayer(symbolsRef, symbolName, "layerSection");
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