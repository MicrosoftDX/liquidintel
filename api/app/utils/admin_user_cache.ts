
import aad = require('../../ad')

var token = new aad.Token(process.env.Tenant, process.env.ClientId, process.env.ClientSecret);
var groupMembership = new aad.GraphGroupMembership((process.env.AdminGroups || "").split(';'), token);
var cache = new Map<string, [boolean, number]>();

export async function isUserAdmin(user: string): Promise<boolean> {
    user = user.toLowerCase();
    var cachedUser = cache.get(user);
    if (cachedUser) {
        if (cachedUser[1] > Date.now()) {
            return cachedUser[0];
        }
        cache.delete(user);
    }
    try {
        let isAdminUser = await groupMembership.isUserMember(user);
        cache.set(user, [isAdminUser, Date.now() + 3600 * 1000]);
        return isAdminUser;
    }
    catch (ex) {
        // If this is a transient error, don't store the user's result to the cache
        if ((ex.code || "") == "Request_ResourceNotFound") {
            // User does not exist - don't keep pinging
            cache.set(user, [false, Date.now() + 24 * 3600 * 1000]);
        }
        return false;
    }
}


