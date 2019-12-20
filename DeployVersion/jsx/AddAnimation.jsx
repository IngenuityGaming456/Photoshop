var path = (new File($.fileName)).parent;
var pathNew = path + "/Plug-ins/Generator/DeployVersion/jsx/CreateStruct.jsx";
$.evalFile(pathNew);
    var animationStruct = ["end", "loop", "start"];
    var animationTypeCount = animationStruct.length;
    var animationName = params.childName ? params.childName : "Animation" + params.clicks;
    var layerConfig = {
        kind: LayerKind.TEXT,
    };

    var parentRef = params.parentId ? getInsertionReferenceById(params.parentId) :
        getParentRef();
    var animationRef = insertLayer(parentRef, animationName, "layerSection");
    for (var i = 0; i < animationTypeCount; i++) {
        var layerRef = insertLayer(animationRef, animationStruct[i], "layerSection");
        var pathName = getPathName(layerRef, "Image.png", animationName, 0);
        var tempTextLayer = insertLayer(layerRef, pathName, "artLayer", layerConfig);
        translate(tempTextLayer);
    }
    animationRef.id;