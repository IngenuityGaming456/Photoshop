app.activeDocument = app.documents[0];
var path = (new File($.fileName)).parent;
var upperPath = path + "/Plug-ins/DeployVersion";
var innerPath = path + "/Plug-ins/Generator/DeployVersion";
var fol = new Folder(upperPath);
var selPath = fol.exists ? upperPath : innerPath;
var pathNew = selPath + "/jsx/AddSpecials.jsx";
$.evalFile(pathNew);
makeSpecials("WinFrames", "WinFrame", drawSpecials);