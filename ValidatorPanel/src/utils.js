"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class utils {
    static filterAppPath(appPath) {
        const firstIndex = appPath.indexOf("/");
        const driveLocation = appPath[firstIndex + 1].toUpperCase() + ":";
        return driveLocation + appPath.substring(firstIndex + 2);
    }
}
exports.utils = utils;
//# sourceMappingURL=utils.js.map