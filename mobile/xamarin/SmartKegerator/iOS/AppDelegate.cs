using System;
using System.Collections.Generic;
using System.Linq;

using Foundation;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using UIKit;

namespace SmartKegerator.iOS
{
    [Register("AppDelegate")]
    public partial class AppDelegate : global::Xamarin.Forms.Platform.iOS.FormsApplicationDelegate
    {
        public override bool FinishedLaunching(UIApplication app, NSDictionary options)
        {
            global::Xamarin.Forms.Forms.Init();
            LoadApplication(new App());

			if (false)
			{
				PlatformParameters pp = new PlatformParameters(Window.RootViewController);
			}

			return base.FinishedLaunching(app, options);
        }
    }
}
