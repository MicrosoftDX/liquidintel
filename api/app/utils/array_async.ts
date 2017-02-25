
Array.prototype['mapAsync'] = async function(callbackfn, thisArg) {
    var retval = [];
    for (var idx = 0; idx < this.length; idx++) {
        let newItem = await callbackfn(this[idx], idx, this);
        retval.push(newItem);
    }
    return retval;
}

Array.prototype['forEachAsync'] = async function(callbackfn, thisArg) {
    for (var idx = 0; idx < this.length; idx++) {
        await callbackfn(this[idx], idx, this);
    }
}