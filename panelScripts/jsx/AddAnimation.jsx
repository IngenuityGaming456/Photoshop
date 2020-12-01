app.activeDocument = app.documents[0];
var path = (new File($.fileName)).parent;
var upperPath = path + "/Plug-ins/DeployVersion";
var innerPath = path + "/Plug-ins/Generator/DeployVersion";
var fol = new Folder(upperPath);
var selPath = fol.exists ? upperPath : innerPath;
var pathNew = selPath + "/jsx/CreateStruct.jsx";
$.evalFile(pathNew);
var animationStruct = ["end", "loop", "start"];
var animationTypeCount = animationStruct.length;
var animationObj = getElementRef(params, "Animation");
var layerConfig = {
    kind: LayerKind.TEXT,
};
var mappedAnimationRef;
if(params["mappedItem"]) {
    mappedAnimationRef = getInsertionReferenceById(params["mappedItem"].id);
}
var animationRef = insertLayer(animationObj.ref, animationObj.name, "layerSection");
for (var i = 0; i < animationTypeCount; i++) {
    var layerRef = insertLayer(animationRef, animationStruct[i], "layerSection");
    if(mappedAnimationRef) {
        var mappedStructRef = findStructRef(mappedAnimationRef, animationStruct[i]);
        if(mappedStructRef) {
            duplicateContainer(mappedStructRef, layerRef);
        }
    } else {
        var pathName = getPathName(layerRef, "Image.png", animationObj.name, 0);
        var tempTextLayer = insertLayer(layerRef, pathName, "artLayer", layerConfig);
        translate(tempTextLayer);
    }
}
animationRef.id;