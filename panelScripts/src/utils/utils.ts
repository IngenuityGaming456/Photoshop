export class utlis {

    public static isKeyExists(searchArray, key) {
        return ~searchArray.indexOf(key);
    }

    public static isIDExists(id, idArray) {
        return idArray.find(item => {
            if(item.id === id) {
                return true;
            }
        });
    };

}