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
const aad = require("../utils/ad");
const settings = require("../utils/settings_encoder");
const request_promise = require("request-promise");
const azureWebsiteAppsettingsBaseUri = `https://management.azure.com/subscriptions/${process.env.WebsiteSubscription}/resourceGroups/${process.env.WebsiteResourceGroup}/providers/Microsoft.Web/sites/${process.env.WebsiteName}/slots/${process.env.WebsiteSlot}/config/appsettings`;
const azureWebsiteAppsettingsApiVersion = 'api-version=2016-08-01';
var graph = new aad.SimpleGraph(new aad.Token(process.env.Tenant, process.env.ClientId, process.env.ClientSecret));
function getAllowedGroups(queryParams, output, successStatus = 200) {
    return __awaiter(this, void 0, void 0, function* () {
        if (queryParams && queryParams.search) {
            try {
                var groups = yield graph.searchGroups(queryParams.search);
                output({ code: successStatus, msg: {
                        count: groups.length,
                        results: groups
                    } });
            }
            catch (ex) {
                console.warn('Failed to search for AAD groups. Details: ' + ex);
                output({ code: 500, msg: ex });
            }
        }
        else {
            output({
                code: successStatus,
                msg: {
                    AuthorizedGroups: settings.decodeSettingArray(process.env.AuthorizedGroups)
                }
            });
        }
    });
}
exports.getAllowedGroups = getAllowedGroups;
function putAllowedGroups(groups, token, output) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var authCtx = new aad.Token(process.env.Tenant, process.env.ClientId, process.env.ClientSecret);
            var tokenParts = token.split(' ');
            var azureToken = yield authCtx.bearerToken(() => authCtx.onBehalfOfToken(tokenParts[1], aad.ResourceARM));
            var appSettings = yield request_promise.post({
                url: `${azureWebsiteAppsettingsBaseUri}/list?${azureWebsiteAppsettingsApiVersion}`,
                json: true,
                headers: {
                    "Authorization": azureToken
                }
            });
            appSettings.properties.AuthorizedGroups = settings.encodeSettingArray(groups);
            var results = yield request_promise.put({
                url: `${azureWebsiteAppsettingsBaseUri}?${azureWebsiteAppsettingsApiVersion}`,
                json: true,
                body: appSettings,
                headers: {
                    "Authorization": azureToken
                }
            });
            process.env.AuthorizedGroups = appSettings.properties.AuthorizedGroups;
            getAllowedGroups(null, output, 201);
        }
        catch (ex) {
            console.warn('Failed to update allowed groups. Details: ' + ex);
            output({ code: 500, msg: ex });
        }
    });
}
exports.putAllowedGroups = putAllowedGroups;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9jb250cm9sbGVycy9hZG1pbkNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUlBLG1DQUFvQztBQUNwQyxzREFBdUQ7QUFDdkQsbURBQW9EO0FBRXBELE1BQU0sOEJBQThCLEdBQUcsOENBQThDLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLG1CQUFtQixPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixrQ0FBa0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLFVBQVUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLHFCQUFxQixDQUFDO0FBQ3ZSLE1BQU0saUNBQWlDLEdBQUcsd0JBQXdCLENBQUM7QUFDbkUsSUFBSSxLQUFLLEdBQUcsSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7QUFFbkgsMEJBQXVDLFdBQWdCLEVBQUUsTUFBc0MsRUFBRSxnQkFBd0IsR0FBRzs7UUFDeEgsRUFBRSxDQUFDLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBRXBDLElBQUksQ0FBQztnQkFDRCxJQUFJLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMxRCxNQUFNLENBQUMsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLEdBQUcsRUFBRTt3QkFDOUIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxNQUFNO3dCQUNwQixPQUFPLEVBQUUsTUFBTTtxQkFDbEIsRUFBQyxDQUFDLENBQUM7WUFDUixDQUFDO1lBQ0QsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDUixPQUFPLENBQUMsSUFBSSxDQUFDLDRDQUE0QyxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUNoRSxNQUFNLENBQUMsRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFDO1lBQ2pDLENBQUM7UUFDTCxDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUM7WUFDRixNQUFNLENBQUM7Z0JBQ0gsSUFBSSxFQUFFLGFBQWE7Z0JBQ25CLEdBQUcsRUFBRTtvQkFDRCxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztpQkFDOUU7YUFDSixDQUFDLENBQUM7UUFDUCxDQUFDO0lBQ0wsQ0FBQztDQUFBO0FBdkJELDRDQXVCQztBQUVELDBCQUF1QyxNQUFnQixFQUFFLEtBQWEsRUFBRSxNQUFzQzs7UUFDMUcsSUFBSSxDQUFDO1lBRUQsSUFBSSxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDaEcsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNsQyxJQUFJLFVBQVUsR0FBRyxNQUFNLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxPQUFPLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUMxRyxJQUFJLFdBQVcsR0FBRyxNQUFNLGVBQWUsQ0FBQyxJQUFJLENBQUM7Z0JBQ3pDLEdBQUcsRUFBRSxHQUFHLDhCQUE4QixTQUFTLGlDQUFpQyxFQUFFO2dCQUNsRixJQUFJLEVBQUUsSUFBSTtnQkFDVixPQUFPLEVBQUU7b0JBQ0wsZUFBZSxFQUFFLFVBQVU7aUJBQzlCO2FBQ0osQ0FBQyxDQUFDO1lBQ0gsV0FBVyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDOUUsSUFBSSxPQUFPLEdBQUcsTUFBTSxlQUFlLENBQUMsR0FBRyxDQUFDO2dCQUNwQyxHQUFHLEVBQUUsR0FBRyw4QkFBOEIsSUFBSSxpQ0FBaUMsRUFBRTtnQkFDN0UsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsSUFBSSxFQUFFLFdBQVc7Z0JBQ2pCLE9BQU8sRUFBRTtvQkFDTCxlQUFlLEVBQUUsVUFBVTtpQkFDOUI7YUFDSixDQUFDLENBQUM7WUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUM7WUFDdkUsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBQ0QsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNSLE9BQU8sQ0FBQyxJQUFJLENBQUMsNENBQTRDLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDaEUsTUFBTSxDQUFDLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFDLENBQUMsQ0FBQztRQUNqQyxDQUFDO0lBQ0wsQ0FBQztDQUFBO0FBN0JELDRDQTZCQyIsImZpbGUiOiJhcHAvY29udHJvbGxlcnMvYWRtaW5Db250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXHJcbmltcG9ydCBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpO1xyXG5pbXBvcnQgdGRzID0gcmVxdWlyZSgnLi4vdXRpbHMvdGRzLXByb21pc2VzJyk7XHJcbmltcG9ydCB7VFlQRVN9IGZyb20gJ3RlZGlvdXMnO1xyXG5pbXBvcnQgYWFkID0gcmVxdWlyZSgnLi4vdXRpbHMvYWQnKTtcclxuaW1wb3J0IHNldHRpbmdzID0gcmVxdWlyZSgnLi4vdXRpbHMvc2V0dGluZ3NfZW5jb2RlcicpO1xyXG5pbXBvcnQgcmVxdWVzdF9wcm9taXNlID0gcmVxdWlyZSgncmVxdWVzdC1wcm9taXNlJyk7XHJcblxyXG5jb25zdCBhenVyZVdlYnNpdGVBcHBzZXR0aW5nc0Jhc2VVcmkgPSBgaHR0cHM6Ly9tYW5hZ2VtZW50LmF6dXJlLmNvbS9zdWJzY3JpcHRpb25zLyR7cHJvY2Vzcy5lbnYuV2Vic2l0ZVN1YnNjcmlwdGlvbn0vcmVzb3VyY2VHcm91cHMvJHtwcm9jZXNzLmVudi5XZWJzaXRlUmVzb3VyY2VHcm91cH0vcHJvdmlkZXJzL01pY3Jvc29mdC5XZWIvc2l0ZXMvJHtwcm9jZXNzLmVudi5XZWJzaXRlTmFtZX0vc2xvdHMvJHtwcm9jZXNzLmVudi5XZWJzaXRlU2xvdH0vY29uZmlnL2FwcHNldHRpbmdzYDtcclxuY29uc3QgYXp1cmVXZWJzaXRlQXBwc2V0dGluZ3NBcGlWZXJzaW9uID0gJ2FwaS12ZXJzaW9uPTIwMTYtMDgtMDEnO1xyXG52YXIgZ3JhcGggPSBuZXcgYWFkLlNpbXBsZUdyYXBoKG5ldyBhYWQuVG9rZW4ocHJvY2Vzcy5lbnYuVGVuYW50LCBwcm9jZXNzLmVudi5DbGllbnRJZCwgcHJvY2Vzcy5lbnYuQ2xpZW50U2VjcmV0KSk7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QWxsb3dlZEdyb3VwcyhxdWVyeVBhcmFtczogYW55LCBvdXRwdXQ6IChyZXNwOmFueSkgPT4gZXhwcmVzcy5SZXNwb25zZSwgc3VjY2Vzc1N0YXR1czogbnVtYmVyID0gMjAwKSB7XHJcbiAgICBpZiAocXVlcnlQYXJhbXMgJiYgcXVlcnlQYXJhbXMuc2VhcmNoKSB7XHJcbiAgICAgICAgLy8gU2VhcmNoIGZvciBBQUQgZ3JvdXBzXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdmFyIGdyb3VwcyA9IGF3YWl0IGdyYXBoLnNlYXJjaEdyb3VwcyhxdWVyeVBhcmFtcy5zZWFyY2gpO1xyXG4gICAgICAgICAgICBvdXRwdXQoe2NvZGU6IHN1Y2Nlc3NTdGF0dXMsIG1zZzoge1xyXG4gICAgICAgICAgICAgICAgY291bnQ6IGdyb3Vwcy5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICByZXN1bHRzOiBncm91cHNcclxuICAgICAgICAgICAgfX0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdGYWlsZWQgdG8gc2VhcmNoIGZvciBBQUQgZ3JvdXBzLiBEZXRhaWxzOiAnICsgZXgpO1xyXG4gICAgICAgICAgICBvdXRwdXQoe2NvZGU6IDUwMCwgbXNnOiBleH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIG91dHB1dCh7XHJcbiAgICAgICAgICAgIGNvZGU6IHN1Y2Nlc3NTdGF0dXMsIFxyXG4gICAgICAgICAgICBtc2c6IHtcclxuICAgICAgICAgICAgICAgIEF1dGhvcml6ZWRHcm91cHM6IHNldHRpbmdzLmRlY29kZVNldHRpbmdBcnJheShwcm9jZXNzLmVudi5BdXRob3JpemVkR3JvdXBzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwdXRBbGxvd2VkR3JvdXBzKGdyb3Vwczogc3RyaW5nW10sIHRva2VuOiBzdHJpbmcsIG91dHB1dDogKHJlc3A6YW55KSA9PiBleHByZXNzLlJlc3BvbnNlKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIC8vIFdlIG5lZWQgYSAnb25fYmVoYWxmX29mJyB0b2tlbiBzbyB0aGF0IHdlIGNhbiBpbXBlcnNvbmF0ZSB0aGUgZW5kIHVzZXIgYXMgd2UgbWFuaXB1bGF0ZSB0aGUgQXp1cmUgY29uZmlndXJhdGlvbi5cclxuICAgICAgICB2YXIgYXV0aEN0eCA9IG5ldyBhYWQuVG9rZW4ocHJvY2Vzcy5lbnYuVGVuYW50LCBwcm9jZXNzLmVudi5DbGllbnRJZCwgcHJvY2Vzcy5lbnYuQ2xpZW50U2VjcmV0KTtcclxuICAgICAgICB2YXIgdG9rZW5QYXJ0cyA9IHRva2VuLnNwbGl0KCcgJyk7XHJcbiAgICAgICAgdmFyIGF6dXJlVG9rZW4gPSBhd2FpdCBhdXRoQ3R4LmJlYXJlclRva2VuKCgpID0+IGF1dGhDdHgub25CZWhhbGZPZlRva2VuKHRva2VuUGFydHNbMV0sIGFhZC5SZXNvdXJjZUFSTSkpO1xyXG4gICAgICAgIHZhciBhcHBTZXR0aW5ncyA9IGF3YWl0IHJlcXVlc3RfcHJvbWlzZS5wb3N0KHtcclxuICAgICAgICAgICAgdXJsOiBgJHthenVyZVdlYnNpdGVBcHBzZXR0aW5nc0Jhc2VVcml9L2xpc3Q/JHthenVyZVdlYnNpdGVBcHBzZXR0aW5nc0FwaVZlcnNpb259YCxcclxuICAgICAgICAgICAganNvbjogdHJ1ZSxcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgXCJBdXRob3JpemF0aW9uXCI6IGF6dXJlVG9rZW5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGFwcFNldHRpbmdzLnByb3BlcnRpZXMuQXV0aG9yaXplZEdyb3VwcyA9IHNldHRpbmdzLmVuY29kZVNldHRpbmdBcnJheShncm91cHMpO1xyXG4gICAgICAgIHZhciByZXN1bHRzID0gYXdhaXQgcmVxdWVzdF9wcm9taXNlLnB1dCh7XHJcbiAgICAgICAgICAgIHVybDogYCR7YXp1cmVXZWJzaXRlQXBwc2V0dGluZ3NCYXNlVXJpfT8ke2F6dXJlV2Vic2l0ZUFwcHNldHRpbmdzQXBpVmVyc2lvbn1gLFxyXG4gICAgICAgICAgICBqc29uOiB0cnVlLFxyXG4gICAgICAgICAgICBib2R5OiBhcHBTZXR0aW5ncyxcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgXCJBdXRob3JpemF0aW9uXCI6IGF6dXJlVG9rZW5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHByb2Nlc3MuZW52LkF1dGhvcml6ZWRHcm91cHMgPSBhcHBTZXR0aW5ncy5wcm9wZXJ0aWVzLkF1dGhvcml6ZWRHcm91cHM7XHJcbiAgICAgICAgZ2V0QWxsb3dlZEdyb3VwcyhudWxsLCBvdXRwdXQsIDIwMSk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ0ZhaWxlZCB0byB1cGRhdGUgYWxsb3dlZCBncm91cHMuIERldGFpbHM6ICcgKyBleCk7XHJcbiAgICAgICAgb3V0cHV0KHtjb2RlOiA1MDAsIG1zZzogZXh9KTtcclxuICAgIH1cclxufVxyXG5cclxuIl19
