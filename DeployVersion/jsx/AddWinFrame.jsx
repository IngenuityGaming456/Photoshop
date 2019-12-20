var path = (new File($.fileName)).parent;
var pathNew = path + "/Plug-ins/Generator/DeployVersion/jsx/AddSpecials.jsx";
$.evalFile(pathNew);
makeSpecials("WinFrames", "WinFrame", drawSpecials);