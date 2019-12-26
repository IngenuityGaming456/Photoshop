var path = (new File($.fileName)).parent;
var pathNew = path + "/Plug-ins/Generator/DeployVersion/jsx/CreateStruct.jsx";
$.evalFile(pathNew);
var windowStruct = makeWindowAndPanel('Info', params.panelName);
windowStruct.panel.add('statictext', undefined, params.text);
var button = windowStruct.panel.add("button", undefined, "OK");
button.addEventListener("click", onClick);
windowStruct.window.show();

function onClick() {
    windowStruct.window.close();
}