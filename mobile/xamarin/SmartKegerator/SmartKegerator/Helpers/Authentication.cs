using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartKegerator.Models;
using Xamarin.Forms;

namespace SmartKegerator.Helpers
{
    public static class Authentication
    {
        public static async Task<bool> Authenticate()
        {
            try
            {
                var auth = DependencyService.Get<IAuthenticator>();
				var token = await auth.Authenticate("b1e80748-43c2-4450-9121-cbc0dcc98051", "f5e0a824-bfba-4367-a55c-bc6551ae4cd0", "http://dxliquidintel");
                Common.WebClient.SetBearer(token.AccessToken);

                //load user info
                var userInfoUrl = new Uri(App.BackendUrl + "/users/" + token.UserInfo.UniqueId);
                App.User = await Common.WebClient.GetAsync<UserInfo>(userInfoUrl);
                return true;
            }
            catch{
                return false;
            }
        }
    }
 }