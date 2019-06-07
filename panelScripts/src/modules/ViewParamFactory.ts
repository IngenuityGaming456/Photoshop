let baseGameStruct =   require("../res/baseGame"),
    bigWinStruct =     require("../res/bigWin"),
    paytableStruct =   require("../res/paytable"),
    introOutroStruct = require("../res/IntroOutro"),
    freeGameStruct =   require("../res/freeGame"),
    backgroundStruct = require("../res/background");

export class ViewParamFactory {

    public static makeViewMap() {
        let viewMap  = new Map();
        let backgroundBG = {backgrounds: backgroundStruct.backgrounds};
        let backgroundFG = {backgroundsFg: backgroundStruct.fgbackgrounds};
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
}