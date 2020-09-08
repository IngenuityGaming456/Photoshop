#include "F:\\projects\\project_photoshop\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var windowStruct = makeWindowAndPanel('Info', params.panelName);
windowStruct.panel.add('statictext', undefined, params.text);
var button = windowStruct.panel.add("button", undefined, "OK");
button.addEventListener("click", onClick);
windowStruct.window.show();

function onClick() {
    windowStruct.window.close();
}