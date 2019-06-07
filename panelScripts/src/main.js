(function () {
    "use strict";
    let _generator, documentPromise = [],
        CreateView = require("./modules/CreateView").CreateView,
        Restructure = require("./modules/Restructure").Restructure,
        ViewParamFactory = require("./modules/ViewParamFactory").ViewParamFactory,
        CreateComponent = require("./modules/CreateComponent").CreateComponent,
        menuLables = require("./res/menuLables"),
        path = require('path'),
        compArray = [], viewArray = [],
        componentsMap, viewsMap, createComponent, createView = {};

    function init(generator) {
        _generator = generator;
        createObjects();
        addMenuItems(menuLables);
        _generator.onPhotoshopEvent("generatorMenuChanged", onButtonMenuClicked);
        _generator.onPhotoshopEvent("imageChanged", onImageChanged);
        _generator.onPhotoshopEvent("currentDocumentChanged", onDocumentChanged);
    }

    function onDocumentChanged() {
        componentsMap.forEach(handleChange);
        Promise.all(documentPromise)
               .then(
                _generator.evaluateJSXFile(path.join(__dirname, "../jsx/alert.jsx"), {
                    message: "Search is done, Happy Photoshopping"
                }));
    }

    function handleChange(itemMap) {
        let jsxPromise = _generator.evaluateJSXFile(path.join(__dirname, "../jsx/searchDocument.jsx"),
            {type: itemMap.label});
        documentPromise.push(jsxPromise);
        jsxPromise.then(controlledString => {
            if(!controlledString.length) {
                return;
            }
            let controlledArrays = controlledString.split(",");
            controlledArrays.forEach(item => {
                let colonPos = item.search(":");
                let typeObj = {
                    id: Number(item.slice(0, colonPos)),
                    sequence: Number(item.slice(colonPos + 1))
                };
                itemMap.elementArray.push(typeObj);
            });
        });
    }

    function onImageChanged(event) {
        if(event.layers && !event.layers[0].added && (event.layers[0].removed || event.layers[0].name)) {
            componentsMap.forEach(item => {
                Restructure.searchAndModifyControlledArray(event.layers, item);
            });
        }
    }

    function onButtonMenuClicked(event) {
        let menu = event.generatorMenuChanged;
        let element = findElementType(menu);
        if(element.type === "view") {
            createView = new CreateView(_generator, element, viewsMap);
        }
        if(element.type === "comp") {
            createComponent = new CreateComponent(_generator, element, componentsMap);
        }
    }

    function findElementType(menu) {
        let element = searchForElement(menu.name, viewArray);
        if(element) {
            return element;
        }
        element = searchForElement(menu.name, compArray);
        if(element) {
            return element;
        }
        return element;
    }

    function searchForElement(searchKey, searchArray) {
        return searchArray.find(item => {
            return item.label === searchKey;
        });
    }

    function addMenuItems(menuLables) {
        for(let menu in menuLables) {
            if(menuLables.hasOwnProperty(menu)) {
                if(menuLables[menu].type && menuLables[menu].type === "view") {
                    viewArray.push(menuLables[menu]);
                }
                if(menuLables[menu].type && menuLables[menu].type === "comp") {
                    compArray.push(menuLables[menu]);
                    componentsMap.set(menuLables[menu].label,
                        {
                            label: menuLables[menu].displayName,
                            elementArray: [],
                            filteredId: []
                        });
                }
                _generator.addMenuItem(menuLables[menu].label, menuLables[menu].displayName, true, false);
            }
        }
    }

    function createObjects() {
        componentsMap = new Map();
        viewsMap = ViewParamFactory.makeViewMap();
    }

    exports.init = init;
}());