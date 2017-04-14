var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Array.prototype['mapAsync'] = function (callbackfn, thisArg) {
    return __awaiter(this, void 0, void 0, function* () {
        var retval = [];
        for (var idx = 0; idx < this.length; idx++) {
            let newItem = yield callbackfn(this[idx], idx, this);
            retval.push(newItem);
        }
        return retval;
    });
};
Array.prototype['forEachAsync'] = function (callbackfn, thisArg) {
    return __awaiter(this, void 0, void 0, function* () {
        for (var idx = 0; idx < this.length; idx++) {
            yield callbackfn(this[idx], idx, this);
        }
    });
};
//# sourceMappingURL=array_async.js.map