#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var spineName = params.childName ? params.childName : "Spine" + params.clicks;
var parentRef = params.parentId ? getInsertionReferenceById(params.parentId) :
    getParentRef();
var spineRef = insertLayer(parentRef, spineName, "layerSection");
var pathName = getPathName(spineRef, "Image.png", spineName, 0);
insertLayer(spineRef, pathName, "artLayer", {
    kind: LayerKind.TEXT,
});
spineRef.id;