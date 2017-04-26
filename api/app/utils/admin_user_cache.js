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
const aad = require("./ad");
const settings = require("../utils/settings_encoder");
var token = new aad.Token(process.env.Tenant, process.env.ClientId, process.env.ClientSecret);
var groupMembership = new aad.GraphGroupMembership(settings.decodeSettingArray(process.env.AdminGroups), token);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC91dGlscy9hZG1pbl91c2VyX2NhY2hlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQSw0QkFBNEI7QUFDNUIsc0RBQXVEO0FBRXZELElBQUksS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzlGLElBQUksZUFBZSxHQUFHLElBQUksR0FBRyxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2hILElBQUksS0FBSyxHQUFHLElBQUksR0FBRyxFQUE2QixDQUFDO0FBRWpELHFCQUFrQyxJQUFZOztRQUMxQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzFCLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNiLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLENBQUM7WUFDRCxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZCLENBQUM7UUFDRCxJQUFJLENBQUM7WUFDRCxJQUFJLFdBQVcsR0FBRyxNQUFNLGVBQWUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3pELE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDdkIsQ0FBQztRQUNELEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFUixFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLElBQUksMEJBQTBCLENBQUMsQ0FBQyxDQUFDO2dCQUVoRCxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzVELENBQUM7WUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pCLENBQUM7SUFDTCxDQUFDO0NBQUE7QUF0QkQsa0NBc0JDIiwiZmlsZSI6ImFwcC91dGlscy9hZG1pbl91c2VyX2NhY2hlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXHJcbmltcG9ydCBhYWQgPSByZXF1aXJlKCcuL2FkJylcclxuaW1wb3J0IHNldHRpbmdzID0gcmVxdWlyZSgnLi4vdXRpbHMvc2V0dGluZ3NfZW5jb2RlcicpO1xyXG5cclxudmFyIHRva2VuID0gbmV3IGFhZC5Ub2tlbihwcm9jZXNzLmVudi5UZW5hbnQsIHByb2Nlc3MuZW52LkNsaWVudElkLCBwcm9jZXNzLmVudi5DbGllbnRTZWNyZXQpO1xyXG52YXIgZ3JvdXBNZW1iZXJzaGlwID0gbmV3IGFhZC5HcmFwaEdyb3VwTWVtYmVyc2hpcChzZXR0aW5ncy5kZWNvZGVTZXR0aW5nQXJyYXkocHJvY2Vzcy5lbnYuQWRtaW5Hcm91cHMpLCB0b2tlbik7XHJcbnZhciBjYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBbYm9vbGVhbiwgbnVtYmVyXT4oKTtcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpc1VzZXJBZG1pbih1c2VyOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIHVzZXIgPSB1c2VyLnRvTG93ZXJDYXNlKCk7XHJcbiAgICB2YXIgY2FjaGVkVXNlciA9IGNhY2hlLmdldCh1c2VyKTtcclxuICAgIGlmIChjYWNoZWRVc2VyKSB7XHJcbiAgICAgICAgaWYgKGNhY2hlZFVzZXJbMV0gPiBEYXRlLm5vdygpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRVc2VyWzBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYWNoZS5kZWxldGUodXNlcik7XHJcbiAgICB9XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGxldCBpc0FkbWluVXNlciA9IGF3YWl0IGdyb3VwTWVtYmVyc2hpcC5pc1VzZXJNZW1iZXIodXNlcik7XHJcbiAgICAgICAgY2FjaGUuc2V0KHVzZXIsIFtpc0FkbWluVXNlciwgRGF0ZS5ub3coKSArIDM2MDAgKiAxMDAwXSk7XHJcbiAgICAgICAgcmV0dXJuIGlzQWRtaW5Vc2VyO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgLy8gSWYgdGhpcyBpcyBhIHRyYW5zaWVudCBlcnJvciwgZG9uJ3Qgc3RvcmUgdGhlIHVzZXIncyByZXN1bHQgdG8gdGhlIGNhY2hlXHJcbiAgICAgICAgaWYgKChleC5jb2RlIHx8IFwiXCIpID09IFwiUmVxdWVzdF9SZXNvdXJjZU5vdEZvdW5kXCIpIHtcclxuICAgICAgICAgICAgLy8gVXNlciBkb2VzIG5vdCBleGlzdCAtIGRvbid0IGtlZXAgcGluZ2luZ1xyXG4gICAgICAgICAgICBjYWNoZS5zZXQodXNlciwgW2ZhbHNlLCBEYXRlLm5vdygpICsgMjQgKiAzNjAwICogMTAwMF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG4iXX0=
