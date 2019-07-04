"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var baseGameStruct = require("../res/baseGame"), bigWinStruct = require("../res/bigWin"), paytableStruct = require("../res/paytable"), introOutroStruct = require("../res/IntroOutro"), freeGameStruct = require("../res/freeGame"), backgroundStruct = require("../res/background"), platformStruct = require("../res/platform");
var ViewParamFactory = /** @class */ (function () {
    function ViewParamFactory() {
    }
    ViewParamFactory.makeViewMap = function () {
        var viewMap = new Map(), backgroundBG = { backgrounds: backgroundStruct.backgrounds }, backgroundFG = { backgroundsFg: backgroundStruct.fgbackgrounds };
        viewMap.set("AddMainView", {
            baseGame: baseGameStruct,
            bigWin: bigWinStruct,
            background: backgroundBG
        });
        viewMap.set("AddPaytable", {
            paytable: paytableStruct
        });
        viewMap.set("AddIntroOutro", {
            introOutro: introOutroStruct
        });
        viewMap.set("AddFreeGameView", {
            freeGame: freeGameStruct,
            background: backgroundFG
        });
        return viewMap;
    };
    ;
    ViewParamFactory.makePlatformMap = function () {
        var desktopPlatform = { desktop: platformStruct.desktop }, mobilePlatform = { mobile: platformStruct.mobile };
        var platformMap = new Map();
        platformMap.set("DesktopView", {
            desktop: desktopPlatform
        });
        platformMap.set("MobileView", {
            mobile: mobilePlatform
        });
        return platformMap;
    };
    return ViewParamFactory;
}());
exports.ViewParamFactory = ViewParamFactory;
//# sourceMappingURL=ViewParamFactory.js.map