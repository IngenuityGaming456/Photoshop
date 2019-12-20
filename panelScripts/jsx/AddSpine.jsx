#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var spineObj = getElementRef(params, "Spine");
var spineRef = insertLayer(spineObj.ref, spineObj.name, "layerSection");
var pathName = getPathName(spineRef, "Image.png", spineName, 0);
insertLayer(spineRef, pathName, "artLayer", {
    kind: LayerKind.TEXT,
});
spineRef.id;