#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var activeLayer = getInsertionReferenceById(params.id);
if(activeLayer) {
    activeLayer.remove();
}