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
    }
    
    function onImageChanged(event) {
        _eventsManager && _eventsManager.onImageChanged(event);
    }

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