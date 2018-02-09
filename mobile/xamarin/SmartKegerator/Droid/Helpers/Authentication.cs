﻿using System;
using System.Threading.Tasks;
using Android.App;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using SmartKegerator.Helpers;
using Xamarin.Forms;

[assembly: Dependency(typeof(SmartKegerator.Droid.Helpers.Authentication))]
namespace SmartKegerator.Droid.Helpers
{
    public class Authentication:IAuthenticator
    {
        public async Task<AuthenticationResult> Authenticate(string resource, string userId, string returnUrl)
        {
			AuthenticationResult authResult = null;

			try
			{
				AuthenticationContext authContext = new AuthenticationContext("https://login.windows.net/common");
                authResult = await authContext.AcquireTokenAsync(resource,
                                                                 userId,
                                                                 new Uri(returnUrl),
                                                                 new PlatformParameters((Activity)Forms.Context));
			}
			catch (Exception e)
			{
				var a = e;
			}
			return authResult;
        }
    }
}
