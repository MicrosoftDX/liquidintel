using System;
using SmartKegerator.Helpers;
using SmartKegerator.Models;

namespace SmartKegerator.ViewModels
{
    public class UserViewModel
    {
        public UserViewModel()
        {

        }

        public async void LoadUserInfoCommand(string userId)
        {
            //if (App.User == null)
            //{
            //    await Authentication.Authenticate();

            //    var userInfoUrl = new Uri(App.BackendUrl + "/users/" + userId);
            //    App.User = await Common.WebClient.GetAsync<UserInfo>(userInfoUrl);
            //}
        }
    }
}
