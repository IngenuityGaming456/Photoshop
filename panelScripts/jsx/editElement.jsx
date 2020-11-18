var path = (new File($.fileName)).parent;
var upperPath = path + "/Plug-ins/DeployVersion";
var innerPath = path + "/Plug-ins/Generator/DeployVersion";
var fol = new Folder(upperPath);
var selPath = fol.exists ? upperPath : innerPath;
var pathNew = selPath + "/jsx/CreateStruct.jsx";
$.evalFile(pathNew);

var obj = params.obj;
var elementRef = getInsertionReferenceById(params.obj.layerID[0]);

var relativeX = obj.x+obj.parentX;
var relativeY = obj.y+obj.parentY;
elementRef.translate(relativeX,relativeY);