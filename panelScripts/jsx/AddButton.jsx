#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var buttonStruct = ["disabled", "down", "hover", "normal"];
var statesCount = buttonStruct.length;
var buttonName = params.childName ? params.childName : "Button" + params.clicks;
var parentRef = params.parentId ? getInsertionReferenceById(params.parentId) :
    getParentRef();
var buttonRef = insertLayer(parentRef, buttonName, "layerSection");
for (var i = 0; i < statesCount; i++) {
    insertLayer(buttonRef, buttonStruct[i], "layerSection");
}
buttonRef.id;