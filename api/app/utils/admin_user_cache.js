"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const aad = require("../../ad");
var token = new aad.Token(process.env.Tenant, process.env.ClientId, process.env.ClientSecret);
var groupMembership = new aad.GraphGroupMembership((process.env.AdminGroups || "").split(';'), token);
var cache = new Map();
function isUserAdmin(user) {
    return __awaiter(this, void 0, void 0, function* () {
        user = user.toLowerCase();
        var cachedUser = cache.get(user);
        if (cachedUser) {
            if (cachedUser[1] > Date.now()) {
                return cachedUser[0];
            }
            cache.delete(user);
        }
        try {
            let isAdminUser = yield groupMembership.isUserMember(user);
            cache.set(user, [isAdminUser, Date.now() + 3600 * 1000]);
            return isAdminUser;
        }
        catch (ex) {
            if ((ex.code || "") == "Request_ResourceNotFound") {
                cache.set(user, [false, Date.now() + 24 * 3600 * 1000]);
            }
            return false;
        }
    });
}
exports.isUserAdmin = isUserAdmin;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC91dGlscy9hZG1pbl91c2VyX2NhY2hlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQSxnQ0FBZ0M7QUFFaEMsSUFBSSxLQUFLLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDOUYsSUFBSSxlQUFlLEdBQUcsSUFBSSxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDdEcsSUFBSSxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQTZCLENBQUM7QUFFakQscUJBQWtDLElBQVk7O1FBQzFDLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDMUIsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ2IsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsQ0FBQztZQUNELEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkIsQ0FBQztRQUNELElBQUksQ0FBQztZQUNELElBQUksV0FBVyxHQUFHLE1BQU0sZUFBZSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzRCxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDekQsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUN2QixDQUFDO1FBQ0QsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVSLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsSUFBSSwwQkFBMEIsQ0FBQyxDQUFDLENBQUM7Z0JBRWhELEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDNUQsQ0FBQztZQUNELE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakIsQ0FBQztJQUNMLENBQUM7Q0FBQTtBQXRCRCxrQ0FzQkMiLCJmaWxlIjoiYXBwL3V0aWxzL2FkbWluX3VzZXJfY2FjaGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuaW1wb3J0IGFhZCA9IHJlcXVpcmUoJy4uLy4uL2FkJylcclxuXHJcbnZhciB0b2tlbiA9IG5ldyBhYWQuVG9rZW4ocHJvY2Vzcy5lbnYuVGVuYW50LCBwcm9jZXNzLmVudi5DbGllbnRJZCwgcHJvY2Vzcy5lbnYuQ2xpZW50U2VjcmV0KTtcclxudmFyIGdyb3VwTWVtYmVyc2hpcCA9IG5ldyBhYWQuR3JhcGhHcm91cE1lbWJlcnNoaXAoKHByb2Nlc3MuZW52LkFkbWluR3JvdXBzIHx8IFwiXCIpLnNwbGl0KCc7JyksIHRva2VuKTtcclxudmFyIGNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIFtib29sZWFuLCBudW1iZXJdPigpO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzVXNlckFkbWluKHVzZXI6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgdXNlciA9IHVzZXIudG9Mb3dlckNhc2UoKTtcclxuICAgIHZhciBjYWNoZWRVc2VyID0gY2FjaGUuZ2V0KHVzZXIpO1xyXG4gICAgaWYgKGNhY2hlZFVzZXIpIHtcclxuICAgICAgICBpZiAoY2FjaGVkVXNlclsxXSA+IERhdGUubm93KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFVzZXJbMF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhY2hlLmRlbGV0ZSh1c2VyKTtcclxuICAgIH1cclxuICAgIHRyeSB7XHJcbiAgICAgICAgbGV0IGlzQWRtaW5Vc2VyID0gYXdhaXQgZ3JvdXBNZW1iZXJzaGlwLmlzVXNlck1lbWJlcih1c2VyKTtcclxuICAgICAgICBjYWNoZS5zZXQodXNlciwgW2lzQWRtaW5Vc2VyLCBEYXRlLm5vdygpICsgMzYwMCAqIDEwMDBdKTtcclxuICAgICAgICByZXR1cm4gaXNBZG1pblVzZXI7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICAvLyBJZiB0aGlzIGlzIGEgdHJhbnNpZW50IGVycm9yLCBkb24ndCBzdG9yZSB0aGUgdXNlcidzIHJlc3VsdCB0byB0aGUgY2FjaGVcclxuICAgICAgICBpZiAoKGV4LmNvZGUgfHwgXCJcIikgPT0gXCJSZXF1ZXN0X1Jlc291cmNlTm90Rm91bmRcIikge1xyXG4gICAgICAgICAgICAvLyBVc2VyIGRvZXMgbm90IGV4aXN0IC0gZG9uJ3Qga2VlcCBwaW5naW5nXHJcbiAgICAgICAgICAgIGNhY2hlLnNldCh1c2VyLCBbZmFsc2UsIERhdGUubm93KCkgKyAyNCAqIDM2MDAgKiAxMDAwXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxyXG5cclxuXHJcbiJdfQ==
