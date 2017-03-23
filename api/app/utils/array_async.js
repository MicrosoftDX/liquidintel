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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC91dGlscy9hcnJheV9hc3luYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNBLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsVUFBZSxVQUFVLEVBQUUsT0FBTzs7UUFDNUQsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO1lBQ3pDLElBQUksT0FBTyxHQUFHLE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDckQsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNsQixDQUFDO0NBQUEsQ0FBQTtBQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLEdBQUcsVUFBZSxVQUFVLEVBQUUsT0FBTzs7UUFDaEUsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDekMsTUFBTSxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMzQyxDQUFDO0lBQ0wsQ0FBQztDQUFBLENBQUEiLCJmaWxlIjoiYXBwL3V0aWxzL2FycmF5X2FzeW5jLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXHJcbkFycmF5LnByb3RvdHlwZVsnbWFwQXN5bmMnXSA9IGFzeW5jIGZ1bmN0aW9uKGNhbGxiYWNrZm4sIHRoaXNBcmcpIHtcclxuICAgIHZhciByZXR2YWwgPSBbXTtcclxuICAgIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IHRoaXMubGVuZ3RoOyBpZHgrKykge1xyXG4gICAgICAgIGxldCBuZXdJdGVtID0gYXdhaXQgY2FsbGJhY2tmbih0aGlzW2lkeF0sIGlkeCwgdGhpcyk7XHJcbiAgICAgICAgcmV0dmFsLnB1c2gobmV3SXRlbSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmV0dmFsO1xyXG59XHJcblxyXG5BcnJheS5wcm90b3R5cGVbJ2ZvckVhY2hBc3luYyddID0gYXN5bmMgZnVuY3Rpb24oY2FsbGJhY2tmbiwgdGhpc0FyZykge1xyXG4gICAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgdGhpcy5sZW5ndGg7IGlkeCsrKSB7XHJcbiAgICAgICAgYXdhaXQgY2FsbGJhY2tmbih0aGlzW2lkeF0sIGlkeCwgdGhpcyk7XHJcbiAgICB9XHJcbn0iXX0=
