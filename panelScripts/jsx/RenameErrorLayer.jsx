#include "F:\\projects\\project_photoshop\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var activeLayer = getInsertionReferenceById(params.id);
if(params.level === 1) {
    activeLayer.name = activeLayer.name.substring(0, params.index) + params.sequence;
} else {
    activeLayer.name = activeLayer.name + "-Error";
}