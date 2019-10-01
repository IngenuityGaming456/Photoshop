(function () {
    "use strict";
    let _generator, _documentManager, _activeDocument, documentPromise = [],
        PhotoshopStartModel = require("./models/PhotoshopStartModel").PhotoshopStartModel,
        CreateView = require("./modules/CreateViewClasses").CreateView,
        CreateViewStructure = require("./modules/CreateViewStructure").CreateViewStructure,
        inject = require("./modules/FactoryClass").inject,
        execute = require("./modules/FactoryClass").execute,
        EventsManager = require("./modules/EventsManager").EventsManager,
        _startModel, _modelFactory,
        path = require('path'), structureMap,
        componentsMap, viewsMap, _socket,
        _eventsManager, fs = require("fs"),
        DocumentStarter = require("../src/modules/DocumentStarter").DocumentStarter, _documentStarter,
        DocumentManager = require("../lib/documentmanager");
        

    /**
     * This is the first function to get called by the generator.
     * @param {*} generator 
     */
    async function init(generator, config, logger) {
        _generator = generator;
        activateListeners();
        await initDocument(config, logger);
        initializeModelFactory();
        initializeDocumentStarter();
        initializeEventsManager();
    }

    async function initDocument(config, logger) {
        _documentManager = new DocumentManager(_generator, config, logger);
        await _generator.evaluateJSXFileSharedSafe(path.join(__dirname, "../jsx/networkEventCharSubscribe.jsx"));
    }   

    function activateListeners() {
        _generator.onPhotoshopEvent("imageChanged", onImageChanged);
        _generator.on("UncheckFromContainerPanel", (layerName) => { onUncheckPanel(layerName); });
       // _generator.onPhotoshopEvent("currentDocumentChanged", onDocumentChanged);
    }

    function onUncheckPanel(layerName) {
        _socket.emit("UncheckFromContainerPanel", layerName);
    }
    
    function onImageChanged(event) {
        _eventsManager.onImageChanged(event);
    }

    // function onDocumentChanged() {
    //     componentsMap.forEach(handleChange);
    //     Promise.all(documentPromise)
    //         .then(
    //             _generator.evaluateJSXFile(path.join(__dirname, "../jsx/alert.jsx"), {
    //                 message: "Search is done, Happy Photoshopping"
    //             }));
    // }
    //
    // function handleChange(itemMap) {
    //     let jsxPromise = _generator.evaluateJSXFile(path.join(__dirname, "../jsx/searchDocument.jsx"),
    //         { type: itemMap.label });
    //     documentPromise.push(jsxPromise);
    //     jsxPromise.then(controlledString => {
    //         if (!controlledString.length) {
    //             return;
    //         }
    //         let controlledArrays = controlledString.split(",");
    //         controlledArrays.forEach(item => {
    //             let colonPos = item.search(":");
    //             let typeObj = {
    //                 id: Number(item.slice(0, colonPos)),
    //                 sequence: Number(item.slice(colonPos + 1))
    //             };
    //             itemMap.elementArray.push(typeObj);
    //         });
    //     });
    // }


    function initializeModelFactory() {
        _startModel = new PhotoshopStartModel();
    }


    function initializeDocumentStarter() {
        _documentStarter = new DocumentStarter();
        execute(_documentStarter, {generator: _generator, storage: {
                documentManager: _documentManager, startModel: _startModel
            }});
    }

    function initializeEventsManager() {
        _eventsManager = new EventsManager();
        execute(_eventsManager, {generator: _generator, storage: {
            documentManager: _documentManager
            }});
    }

    exports.init = init;
}());