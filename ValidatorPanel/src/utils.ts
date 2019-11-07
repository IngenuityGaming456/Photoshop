export class utils {
    public static filterAppPath(appPath) {
        const firstIndex = appPath.indexOf("/");
        const driveLocation = appPath[firstIndex+1].toUpperCase() + ":";
        return driveLocation + appPath.substring(firstIndex + 2);
    }
}