#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";

var obj = params.obj;
var elementRef = getInsertionReferenceById(params.obj.layerID[0]);

var relativeX = obj.x+obj.parentX;
var relativeY = obj.y+obj.parentY;
elementRef.translate(relativeX,relativeY);