"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var baseGameStruct = require("../res/baseGame"), bigWinStruct = require("../res/bigWin"), paytableStruct = require("../res/paytable"), introOutroStruct = require("../res/IntroOutro"), freeGameStruct = require("../res/freeGame"), backgroundStruct = require("../res/background"), platformStruct = require("../res/platform");
var ViewParamFactory = /** @class */ (function () {
    function ViewParamFactory() {
    }
    ViewParamFactory.makeViewMap = function () {
        var viewMap = new Map(), backgroundBG = { backgrounds: backgroundStruct.backgrounds }, backgroundFG = { backgroundsFg: backgroundStruct.fgbackgrounds };
        viewMap.set("AddMainView", {
            background: backgroundBG,
            bigWin: bigWinStruct,
            baseGame: baseGameStruct
        }).set("AddPaytable", {
            paytable: paytableStruct
        }).set("AddIntroOutro", {
            introOutro: introOutroStruct
        }).set("AddFreeGameView", {
            background: backgroundFG,
            freeGame: freeGameStruct
        });
        return viewMap;
    };
    ;
    ViewParamFactory.makePlatformMap = function () {
        var desktopPlatform = { desktop: platformStruct.desktop }, mobilePlatform = { mobile: platformStruct.mobile };
        var platformMap = new Map();
        platformMap.set("DesktopView", {
            desktop: desktopPlatform
        }).set("MobileView", {
            mobile: mobilePlatform
        });
        return platformMap;
    };
    ViewParamFactory.makeLayoutMap = function () {
        var layoutMap = new Map();
        layoutMap.set("LayoutEnabled", {});
        return layoutMap;
    };
    ViewParamFactory.makeTestingMap = function () {
        var testingMap = new Map();
        testingMap.set("Testing", {});
        return testingMap;
    };
    return ViewParamFactory;
}());
exports.ViewParamFactory = ViewParamFactory;
//# sourceMappingURL=ViewParamFactory.js.map