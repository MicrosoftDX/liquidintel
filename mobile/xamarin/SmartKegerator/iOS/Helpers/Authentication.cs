﻿using System;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using SmartKegerator.Helpers;
using UIKit;
using Xamarin.Forms;


[assembly: Dependency(typeof(SmartKegerator.iOS.Helpers.Authentication))]
namespace SmartKegerator.iOS.Helpers
{
    public class Authentication:IAuthenticator
    {
        public Authentication()
        {

        }

        public async Task<AuthenticationResult> Authenticate(string resource, string userId, string returnUrl)
        {
			AuthenticationResult authResult = null;

			try
			{
				AuthenticationContext authContext = new AuthenticationContext("https://login.windows.net/common/oauth2/authorize");
				authResult = await authContext.AcquireTokenAsync(resource,
																 userId,
																 new Uri(returnUrl),
																 new PlatformParameters(UIApplication.SharedApplication.KeyWindow.RootViewController));
			}
			catch (Exception e)
			{
				var a = e;
			}
			return authResult;
        }
    }
}
