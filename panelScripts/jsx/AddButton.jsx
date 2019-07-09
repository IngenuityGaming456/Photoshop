#include "D:\\Projects\\PS\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var buttonStruct = ["disabled", "down", "hover", "normal"];
var statesCount = buttonStruct.length;
var buttonName = params.childName ? params.childName : "Button" + params.clicks;
// var layerConfig = {
//     kind: LayerKind.TEXT
// };
// var layerKindConfig = {
//     contents: ""
// };
var parentRef = getParentRef(params);

var buttonRef = insertLayer(parentRef, buttonName, "layerSection");
for (var i = 0; i < statesCount; i++) {
    var layerRef = insertLayer(buttonRef, buttonStruct[i], "layerSection");
    // insertLayer(layerRef, buttonStruct[i], "artLayer");
    // insertLayer(layerRef, "", "artLayer", layerConfig, layerKindConfig);
}
buttonRef.id;
