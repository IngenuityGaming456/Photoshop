(function () {
    "use strict";

    /**
     * A central place to store all string literals.
     */
    let CONSTANTS = {
        COMMON_NAME: "common"
    };

    let _generator, documentPromise = [],
        CreateView = require("./modules/CreateViewClasses").CreateView,
        CreatePlatform = require("./modules/CreateViewClasses").CreatePlatform,
        CreateViewStructure = require("./modules/CreateViewStructure").CreateViewStructure,
        Restructure = require("./modules/Restructure").Restructure,
        ViewParamFactory = require("./modules/ViewParamFactory").ViewParamFactory,
        CreateComponent = require("./modules/CreateComponent").CreateComponent,
        menuLables = require("./res/menuLables"),
        languagesStruct = require("./res/languages"),
        path = require('path'), structureMap,
        componentsMap, viewsMap, platformsMap;

    /**
     * Whether the menu can be toggled. Set it from anywhere.
     * Purpose: when a generator code is running, menu should not be allowed to toggle.
     * So set it to `true`, and once all the process completes, set it to `false` again.
     */
    let lockMenuToggle = false;

    /**
     * This enum stores the default group names as enum.
     */
    var menuGroupEnum = {
        Menu_Platform: "Menu_Platform",
        Menu_View: "Menu_View",
        Menu_UI: "Menu_UI",
        Menu_Special_UI: "Menu_Special_UI"
    };

    /**
     * This object stores all the menu items as array by groups.
     */
    var menuGroups = {
        Menu_Platform: [],
        Menu_View: [],
        Menu_UI: [],
        Menu_Special_UI: [],
    };

    /**
     * This stores all the menu by Labels/displayName. 
     * Warning: DisplayNames need not be unique. So, `menuDisplayNameArray` can store only the last element with that Display Name.
     */
    var menuLablesArray = {};
    var menuDisplayNameArray = {};

    /**
     * This object stores all data useful for enable/disble menu items.
     * @public
     */
    var menuAuxData = {
        isDesktopCreated: false,
        isMobileCreated: false,
        isMobile: false,                // is the selected component part of Mobile
        isDesktop: false,               // is the selected component part of Desktop
        isPortrait: false,
        isLandscape: false
    };

    /** the default checked and enabled state of all menu. */
    var _defaultMenuChecked = false;
    var _defaultMenuEnabled = false;


    /**
     * This is the first function to get called by the generator.
     * @param {*} generator 
     */
    async function init(generator) {
        _generator = generator;
        createObjects();
        await addMenuItems(menuLables);
        _storeMenuByLabel();
        // first disable all menu, then enable eligible platform menu.
        await setEnableMenuByGroup(undefined, false);
        await _initPlatformMenuState();

        _generator.onPhotoshopEvent("generatorMenuChanged", onButtonMenuClicked);
        _generator.onPhotoshopEvent("imageChanged", onImageChanged);
        _generator.onPhotoshopEvent("currentDocumentChanged", onDocumentChanged);
    }

    /**
     * Enables/Disables a group of Menu items.
     * @param {menuGroupEnum | menuGroupEnum[] | undefined} groupId The group whose state needs to change. If undefined, then all the groups are set to `enabled` parameter.
     * @param {boolean} [enable = true] whether to enable the menu group.
     * @returns {Array} an array of all elements which state has been switched.
     */
    async function setEnableMenuByGroup(groupId, enable) {
        if (typeof enable !== "boolean") { enable = true; }

        var targets = [], i;
        if (groupId === undefined || groupId === null) {
            // if no target group specified, then modify all menu.
            for (const group in menuGroups) {
                if (menuGroups.hasOwnProperty(group)) {
                    const elementsArray = menuGroups[group];
                    if (Array.isArray(elementsArray)) {
                        targets = targets.concat(elementsArray);
                    }
                }
            }
        }
        else if (Array.isArray(groupId)) {
            groupId.forEach(id => {
                if (Array.isArray(menuGroups[id])) {
                    targets = targets.concat(menuGroups[id]);
                }
            });
        }
        else {
            targets = menuGroups[groupId].concat();
        }

        for (i = 0; i < targets.length; i++) {
            try {
                await _generator.toggleMenu(targets[i].label, enable, _defaultMenuChecked, targets[i].displayName)
            } catch (error) {
                _handleError(error);
            }
        }

        return targets;
    }

    function onDocumentChanged() {
        componentsMap.forEach(handleChange);
        try {
            Promise.all(documentPromise)
                .then(
                    _generator.evaluateJSXFile(path.join(__dirname, "../jsx/alert.jsx"), {
                        message: "Search is done, Happy Photoshopping"
                    }));
        } catch (error) {
            _handleError(error);
        }
    }

    function handleChange(itemMap) {
        try {
            let jsxPromise = _generator.evaluateJSXFile(path.join(__dirname, "../jsx/searchDocument.jsx"),
                { type: itemMap.label });
            documentPromise.push(jsxPromise);
            jsxPromise.then(controlledString => {
                if (!controlledString.length) {
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
        } catch (error) {
            _handleError(error);
        }
    }

    /**
     * This function is called whenever a layer selection changes.
     * @param {any} event 
     */
    async function onImageChanged(event) {
        if (event.layers && !event.layers[0].added && (event.layers[0].removed || event.layers[0].name)) {
            componentsMap.forEach(item => {
                Restructure.searchAndModifyControlledArray(event.layers, item);
            });
        }
        if (event.selection && event.selection.length === 1) {
            // when exactly one item is selected.
            try {
                _generator.evaluateJSXFile(path.join(__dirname, "../jsx/ShowPanel.jsx"), languagesStruct);

                let jsxPromise;
                jsxPromise = _generator.evaluateJSXFile(path.join(__dirname, "../jsx/getSelectedItemName.jsx"));
                jsxPromise.then(selectedName => {
                    if (selectedName === CONSTANTS.COMMON_NAME) {
                        let newJsxPromise = _generator.evaluateJSXFile(path.join(__dirname, "../jsx/getChildrenName.jsx"));
                        newJsxPromise.then(_evaluateCommonChildrenName, _handleError);
                    }
                });
            } catch (error) {
                _handleError(error);
            }
        }
    }

    async function onButtonMenuClicked(event) {
        let menu = event.generatorMenuChanged;
        let elementMap = getElementMap(menu.name);
        let classRef = structureMap.get(elementMap);

        try {
            if (classRef === CreateComponent) {
                await (new CreateComponent(_generator, menu.name, elementMap));
            }
            if (classRef === CreateView) {
                await (new CreateViewStructure(_generator, new CreateView(_generator, menu.name, elementMap)));
            }
            if (classRef === CreatePlatform) {
                await (new CreateViewStructure(_generator, new CreatePlatform(_generator, menu.name, elementMap)));
                // if the entry doesn't exist, it will create a new one.
                // NOTE: menu.name is the the `label` of menu.
                let target = getMenuByLabel(menu.name);
                menuAuxData["is" + target.displayName + "Created"] = true;

                // if the entry doesn't exist, it will create a new one.
                // it will iterate through all platform views and set the corresponding [`isCreated`] in `menuAuxData` to true.
                // let should_level1 = elementMap.get(menu.name);
                // let shouldContain = [];

                // for (const should_level2 in should_level1) {
                //     if (should_level1.hasOwnProperty(should_level2)) {
                //         const item = should_level1[should_level2];
                //         shouldContain = shouldContain.concat(Object.keys(item));
                //     }
                // }

                // shouldContain.forEach((platformView, idx) => {
                //     menuAuxData["is" + platformView + "Created"] = true;
                // });
            }
        } catch (error) {
            _handleError(error);
        }

        try {
            await updatePlatformMenuStates();
        } catch (error) {
            _handleError(error);
        }
    }

    function getElementMap(menuName) {
        let keysIterable = structureMap.keys();
        for (let keys of keysIterable) {
            if (keys.has(menuName)) {
                return keys;
            }
        }
    }

    async function addMenuItems(menuLables) {
        for (let menu in menuLables) {
            if (menuLables.hasOwnProperty(menu)) {
                if (menuLables[menu].type && menuLables[menu].type === "comp") {
                    componentsMap.set(menuLables[menu].label,
                        {
                            label: menuLables[menu].displayName,
                            elementArray: [],
                            filteredId: []
                        });
                }

                try {
                    await _generator.addMenuItem(menuLables[menu].label, menuLables[menu].displayName, _defaultMenuEnabled, _defaultMenuChecked);
                } catch (error) {
                    _handleError(error);
                }

                // save a reference of the menu in a variable.
                if (menuGroups && typeof menuLables[menu].menuGroup === "string") {
                    if (!menuGroups[menuLables[menu].menuGroup]) {
                        menuGroups[menuLables[menu].menuGroup] = [];
                    }
                    menuGroups[menuLables[menu].menuGroup].push(menuLables[menu]);
                }
            }
        }
    }

    function createObjects() {
        structureMap = new Map();
        componentsMap = new Map();
        viewsMap = ViewParamFactory.makeViewMap();
        platformsMap = ViewParamFactory.makePlatformMap();
        createStructureMap(componentsMap, CreateComponent);
        createStructureMap(viewsMap, CreateView);
        createStructureMap(platformsMap, CreatePlatform);
    }

    function createStructureMap(typeMap, typeClass) {
        structureMap.set(typeMap, typeClass);
    }

    /**
     * This function enables/disables platform menu according to the set variables.
     */
    async function updatePlatformMenuStates() {
        // update `Menu_Platform` menu items
        for (var i = 0; i < menuGroups.Menu_Platform.length; i++) {
            var target = menuGroups.Menu_Platform[i];
            var currentState = _generator.getMenuState(target.label);
            var toState = !menuAuxData["is" + target.displayName + "Created"];

            if (currentState !== toState) {
                try {
                    await _generator.toggleMenu(target.label, toState, _defaultMenuChecked, target.displayName);
                } catch (error) {
                    _handleError(error);
                }
            }
        }
    }

    /**
     * Function to evaluate the `common` layer's children.
     * @private
     * @param {string} data An array of children's name.
     */
    async function _evaluateCommonChildrenName(data) {
        if (lockMenuToggle) { return; }
        if (!data || !data.length) {
            // no children
            setEnableMenuByGroup(menuGroupEnum.Menu_View, true);
            return;
        }

        var target;
        let children = data.split(",");

        // update view menu
        // check for all the Menu_View, to determine, if it should be enabled or disabled. 
        menuGroups.Menu_View.forEach((viewMenuItem, idx) => {
            if (typeof viewMenuItem.label === "string") {
                // now we will check if, all the items which were supposed to be generated by the menu, has been generated, then disable, else enable.
                // `should_` variables refers to the items which were supposed to be generated.
                let should_level1 = viewsMap.get(viewMenuItem.label);
                let shouldContain = [];
                for (const should_level2 in should_level1) {
                    if (should_level1.hasOwnProperty(should_level2)) {
                        const item = should_level1[should_level2];
                        shouldContain = shouldContain.concat(Object.keys(item));
                    }
                }

                let isAllItemsGenerated = arrayContainsArray(children, shouldContain);
                // if all the items for certain view has been generated, then disable that view menu.
                try {
                    _generator.toggleMenu(viewMenuItem.label, !isAllItemsGenerated, _defaultMenuChecked, viewMenuItem.displayName)
                } catch (error) {
                    _handleError(error);
                }
            }
        });
    }

    /**
     * Utility function to handle and show errors. 
     * @param {any} data additional data for the error. Generally, the error message.
     */
    function _handleError(data) {
        console.error(data);
    }

    /**
     * This function stores references of all Menu by Lables and displayNames.
     */
    function _storeMenuByLabel() {
        for (const group in menuGroups) {
            if (menuGroups.hasOwnProperty(group)) {
                const item = menuGroups[group];
                item.forEach((indivItem, idx) => {
                    if (indivItem && typeof indivItem.label === "string") {
                        menuLablesArray[indivItem.label] = indivItem;
                    }
                    if (indivItem && typeof indivItem.displayName === "string") {
                        menuDisplayNameArray[indivItem.displayName] = indivItem;
                    }
                });
            }
        }
    }

    /**
     * This function sets the initial state of platform menu, by checking if platforms are created.
     * @private
     */
    async function _initPlatformMenuState() {
        try {
            let jsxPromise = _generator.evaluateJSXFile(path.join(__dirname, "../jsx/getRootLevelLayers.jsx"));
            jsxPromise.then((rootLevel) => {
                if (!rootLevel) { return; }
                let rootItems = rootLevel.split(",");
                if (!rootItems.length) { return; }

                menuGroups.Menu_Platform.forEach((platformMenuItem, idx) => {
                    if (typeof platformMenuItem.label === "string") {
                        // now we check if certain platform was generated already.
                        let should_level1 = platformsMap.get(platformMenuItem.label);
                        let shouldContain = [];
                        for (const should_level2 in should_level1) {
                            if (should_level1.hasOwnProperty(should_level2)) {
                                const item = should_level1[should_level2];
                                shouldContain = shouldContain.concat(Object.keys(item));
                            }
                        }

                        let isAllItemsGenerated = arrayContainsArray(rootItems, shouldContain);

                        // if all the items in particular platform are created, then disable that platform menu.
                        try {
                            let tempJsxPromise = _generator.toggleMenu(platformMenuItem.label, !isAllItemsGenerated, _defaultMenuChecked, platformMenuItem.displayName);
                            tempJsxPromise.then(() => {
                                menuAuxData["is" + platformMenuItem.displayName + "Created"] = isAllItemsGenerated;
                            }, _handleError);
                        } catch (error) {
                            _handleError(error);
                        }
                    }
                });
            }, _handleError);
        } catch (error) {
            _handleError(error);
        }
    }

    /**
     * Public utility function to enable/disable menu by label.
     * @param {string} labelId 
     * @param {boolean} [enable = false] True = enable, false = disable.
     */
    async function setEnableMenuByLabel(labelId, enable) {
        let target = menuLablesArray[labelId];
        if (!target) {
            console.error(labelId + "is not a valid Menu label.");
            return;
        }

        if (enable === undefined) { enable = false; }
        try {
            await _generator.toggleMenu(target.label, enable, _defaultMenuChecked, target.displayName);
        } catch (error) {
            _handleError(error);
        }
    }

    /**
     * Public utility function to enable/disable menu by displayName.
     * @param {string} nameId 
     * @param {boolean} [enable = false] True = enable, false = disable.
     */
    async function setEnableMenuByDisplayName(nameId, enable) {
        let target = menuDisplayNameArray[nameId];
        if (!target) {
            console.error(nameId + "is not a valid Menu display Name.");
            return;
        }

        if (enable === undefined) { enable = false; }
        try {
            await _generator.toggleMenu(target.label, enable, _defaultMenuChecked, target.displayName);
        } catch (error) {
            _handleError(error);
        }
    }

    /**
     * Utility function that returns the menu item by label/displayName as id.
     * @param {string} labelId 
     */
    function getMenuByLabel(labelId) {
        try {
            return menuLablesArray[labelId];
        } catch (error) {
            _handleError(error);
        }
    }

    function getMenuByDisplayName(displayId) {
        try {
            return menuDisplayNameArray[displayId];
        } catch (error) {
            _handleError(error);
        }
    }


    /**
     * Utility Function
     * Returns `true` if the first specified array contains all elements from the second one. 
     * `false` otherwise.
     *
     * @param {array} superset
     * @param {array} subset
     *
     * @returns {boolean}
     */
    function arrayContainsArray(superset, subset) {
        if (0 === subset.length) {
            return false;
        }
        return subset.every(function (value) {
            return (superset.indexOf(value) >= 0);
        });
    }

    exports.init = init;
}());