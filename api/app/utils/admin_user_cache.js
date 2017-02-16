"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const aad = require("../../ad");
var token = new aad.Token(process.env.Tenant, process.env.ClientId, process.env.ClientSecret);
var groupMembership = new aad.GraphGroupMembership(process.env.AdminGroups.split(';'), token);
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
//# sourceMappingURL=admin_user_cache.js.map